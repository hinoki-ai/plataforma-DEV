import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, Permissions, canCreateUser } from '@/lib/authorization';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';
import { sanitizeJsonInput, SANITIZATION_SCHEMAS } from '@/lib/sanitization';
import { createSuccessResponse, handleApiError, ApiErrorResponse } from '@/lib/api-error';

export const runtime = 'nodejs';

// Password strength validation
const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'La contraseña debe contener al menos un carácter especial');

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingrese un email válido'),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'PROFESOR', 'PARENT']),
  isActive: z.boolean().optional().default(true),
});

// const updateUserSchema = z.object({
//   name: z.string().min(2).optional(),
//   role: z.enum(['ADMIN', 'PROFESOR']).optional(),
//   isActive: z.boolean().optional(),
// });

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for admin actions
    if (checkRateLimit(request, RATE_LIMITS.ADMIN_ACTIONS.limit, RATE_LIMITS.ADMIN_ACTIONS.windowMs, 'admin')) {
      return handleApiError(
        new ApiErrorResponse('Demasiadas solicitudes de administrador. Intente más tarde.', 429, 'RATE_LIMITED'),
        'GET /api/admin/users'
      );
    }

    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return handleApiError(
        new ApiErrorResponse('Acceso no autorizado', 401, 'UNAUTHORIZED'),
        'GET /api/admin/users'
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get admin creation stats for the current admin
    const adminStats = await prisma.user.groupBy({
      by: ['createdByAdmin'],
      where: {
        createdByAdmin: session.user.id,
        role: 'ADMIN',
      },
      _count: {
        id: true,
      },
    });

    const adminsCreated = adminStats.length > 0 ? adminStats[0]._count.id : 0;
    const maxAdminsAllowed = 1;

    const data = {
      users,
      adminLimits: {
        currentAdminsCreated: adminsCreated,
        maxAdminsAllowed,
        canCreateMoreAdmins: adminsCreated < maxAdminsAllowed,
        remainingAdminSlots: Math.max(0, maxAdminsAllowed - adminsCreated),
      },
    };

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/users');
  }
}

// POST /api/admin/users - Create new user (authorized users only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin actions
    if (checkRateLimit(request, RATE_LIMITS.ADMIN_ACTIONS.limit, RATE_LIMITS.ADMIN_ACTIONS.windowMs, 'admin')) {
      return NextResponse.json(
        { error: 'Too many admin requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(request, RATE_LIMITS.ADMIN_ACTIONS.limit, RATE_LIMITS.ADMIN_ACTIONS.windowMs, 'admin')
        }
      );
    }

    const session = await auth();

    if (!session?.user?.role) {
      return handleApiError(
        new ApiErrorResponse('Acceso no autorizado', 401, 'UNAUTHORIZED'),
        'POST /api/admin/users'
      );
    }

    const body = await request.json();
    // Sanitize input data before validation
    const sanitizedBody = sanitizeJsonInput(body);
    const validatedData = createUserSchema.parse(sanitizedBody);

    // Check if user has permission to create the target role
    if (!canCreateUser(session.user.role, validatedData.role)) {
      return handleApiError(
        new ApiErrorResponse(`No tienes permisos para crear usuarios ${validatedData.role.toLowerCase()}`, 403, 'FORBIDDEN'),
        'POST /api/admin/users'
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return handleApiError(
        new ApiErrorResponse('El email ya está registrado', 409, 'DUPLICATE_EMAIL'),
        'POST /api/admin/users'
      );
    }

    // Check admin creation limits
    if (validatedData.role === 'ADMIN') {
      // Count how many admins this admin has already created
      const adminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          createdByAdmin: session.user.id,
        },
      });

      // Limit to 1 secondary admin per main admin
      if (adminCount >= 1) {
        return handleApiError(
          new ApiErrorResponse('Límite de administradores alcanzado. Solo puedes crear 1 administrador secundario.', 403, 'ADMIN_LIMIT_EXCEEDED', {
            currentAdminsCreated: adminCount,
            maxAllowed: 1,
            contactInfo: {
              email: 'support@manitospintadas.com',
              message: 'Solicita ampliación de slots de administrador'
            }
          }),
          'POST /api/admin/users'
        );
      }
    }

    // Hash the provided password
    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        createdByAdmin: session.user.id, // Track which admin created this user
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit logging removed - using simple error-handler

    // Get updated admin creation stats after creating the user
    const adminStats = await prisma.user.groupBy({
      by: ['createdByAdmin'],
      where: {
        createdByAdmin: session.user.id,
        role: 'ADMIN',
      },
      _count: {
        id: true,
      },
    });

    const adminsCreated = adminStats.length > 0 ? adminStats[0]._count.id : 0;
    const maxAdminsAllowed = 1;

    const data = {
      ...user,
      adminLimits: {
        currentAdminsCreated: adminsCreated,
        maxAdminsAllowed,
        canCreateMoreAdmins: adminsCreated < maxAdminsAllowed,
        remainingAdminSlots: Math.max(0, maxAdminsAllowed - adminsCreated),
      },
    };

    return createSuccessResponse(data, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiError(
        new ApiErrorResponse('Datos de entrada inválidos', 400, 'VALIDATION_ERROR', {
          validationErrors: error.issues
        }),
        'POST /api/admin/users'
      );
    }

    return handleApiError(error, 'POST /api/admin/users');
  }
}
