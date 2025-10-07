import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, Permissions, canCreateUser } from '@/lib/authorization';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';
import { sanitizeJsonInput, SANITIZATION_SCHEMAS } from '@/lib/sanitization';
import { createSuccessResponse, handleApiError, ApiErrorResponse } from '@/lib/api-error';
import bcryptjs from 'bcryptjs';

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

    const client = getConvexClient();
    const allUsers = await client.query(api.users.getUsers, {});
    
    // Map to match expected structure
    const users = allUsers
      .map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    // Get admin creation stats for the current admin
    const admins = allUsers.filter(u => 
      u.role === 'ADMIN' && u.createdByAdmin === session.user.id
    );
    
    const adminsCreated = admins.length;
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

    const client = getConvexClient();
    
    // Check if email already exists
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: validatedData.email,
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
      const allUsers = await client.query(api.users.getUsers, { role: 'ADMIN' });
      const adminCount = allUsers.filter(u => u.createdByAdmin === session.user.id).length;

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
    const hashedPassword = await bcryptjs.hash(validatedData.password, 10);

    const userId = await client.mutation(api.users.createUser, {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      createdByAdmin: session.user.id, // Track which admin created this user
    });
    
    const user = await client.query(api.users.getUserById, { id: userId });

    // Map to expected structure
    const userData = {
      id: user!._id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      createdAt: user!.createdAt,
      updatedAt: user!.updatedAt,
    };

    // Get updated admin creation stats after creating the user
    const allUsers = await client.query(api.users.getUsers, { role: 'ADMIN' });
    const adminsCreated = allUsers.filter(u => u.createdByAdmin === session.user.id).length;
    const maxAdminsAllowed = 1;

    const data = {
      ...userData,
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
