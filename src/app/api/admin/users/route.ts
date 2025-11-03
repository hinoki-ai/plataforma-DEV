import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, Permissions, canCreateUser } from "@/lib/authorization";
import { z } from "zod";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limiter";
import { sanitizeJsonInput, SANITIZATION_SCHEMAS } from "@/lib/sanitization";
import {
  createSuccessResponse,
  handleApiError,
  ApiErrorResponse,
} from "@/lib/api-error";
import {
  adminUserCreationSchema,
  logUserCreation,
  UserCreationError,
  type AdminUserCreationData,
} from "@/lib/user-creation";
import {
  createClerkUser,
  getClerkUsers,
  getClerkUserByEmail,
  getClerkUserCountByRole,
  type CreateClerkUserData,
} from "@/services/actions/clerk-users";

export const runtime = "nodejs";

// const updateUserSchema = z.object({
//   name: z.string().min(2).optional(),
//   role: z.enum(['ADMIN', 'PROFESOR']).optional(),
//   isActive: z.boolean().optional(),
// });

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for admin actions
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.ADMIN_ACTIONS.limit,
        RATE_LIMITS.ADMIN_ACTIONS.windowMs,
        "admin",
      )
    ) {
      return handleApiError(
        new ApiErrorResponse(
          "Demasiadas solicitudes de administrador. Intente más tarde.",
          429,
          "RATE_LIMITED",
        ),
        "GET /api/admin/users",
      );
    }

    let session = null;
    try {
      session = await auth();
    } catch (error) {
      console.error("Auth error:", error);
      return handleApiError(
        new ApiErrorResponse("Error de autenticación", 500, "AUTH_ERROR", {
          originalError: error instanceof Error ? error.message : String(error),
        }),
        "GET /api/admin/users",
      );
    }

    if (!session || session.user.role !== "ADMIN") {
      return handleApiError(
        new ApiErrorResponse("Acceso no autorizado", 401, "UNAUTHORIZED"),
        "GET /api/admin/users",
      );
    }

    let allUsers: any[] = [];
    try {
      allUsers = await getClerkUsers();
    } catch (error) {
      console.error("Failed to get users from Clerk:", error);
      return handleApiError(
        new ApiErrorResponse(
          "Error al obtener usuarios del sistema de autenticación",
          500,
          "CLERK_ERROR",
          {
            originalError:
              error instanceof Error ? error.message : String(error),
          },
        ),
        "GET /api/admin/users",
      );
    }

    // Map to match expected structure
    const users = allUsers
      .filter((u) => u.isActive) // Only show active users
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.getTime(),
        updatedAt: u.updatedAt.getTime(),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    // Get admin creation stats for the current admin
    // Note: Clerk doesn't track who created users, so we'll use a simpler approach
    const adminUsers = await getClerkUsers("ADMIN");
    const adminsCreated = adminUsers.length;
    const maxAdminsAllowed = 5; // Allow more admins in Clerk-based system

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
    return handleApiError(error, "GET /api/admin/users");
  }
}

// POST /api/admin/users - Create new user (authorized users only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin actions
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.ADMIN_ACTIONS.limit,
        RATE_LIMITS.ADMIN_ACTIONS.windowMs,
        "admin",
      )
    ) {
      return NextResponse.json(
        { error: "Too many admin requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(
            request,
            RATE_LIMITS.ADMIN_ACTIONS.limit,
            RATE_LIMITS.ADMIN_ACTIONS.windowMs,
            "admin",
          ),
        },
      );
    }

    const session = await auth();

    if (!session?.user?.role) {
      return handleApiError(
        new ApiErrorResponse("Acceso no autorizado", 401, "UNAUTHORIZED"),
        "POST /api/admin/users",
      );
    }

    const body = await request.json();
    // Sanitize input data before validation
    const sanitizedBody = sanitizeJsonInput(body);
    const validatedData = adminUserCreationSchema.parse(sanitizedBody);

    // Check if user has permission to create the target role
    if (!canCreateUser(session.user.role, validatedData.role)) {
      return handleApiError(
        new ApiErrorResponse(
          `No tienes permisos para crear usuarios ${validatedData.role.toLowerCase()}`,
          403,
          "FORBIDDEN",
        ),
        "POST /api/admin/users",
      );
    }

    // Check if email already exists
    const existingUser = await getClerkUserByEmail(validatedData.email);
    if (existingUser) {
      return handleApiError(
        new ApiErrorResponse(
          "El email ya está registrado",
          409,
          "DUPLICATE_EMAIL",
        ),
        "POST /api/admin/users",
      );
    }

    // Check admin creation limits
    if (validatedData.role === "ADMIN") {
      const adminUsers = await getClerkUsers("ADMIN");
      const adminCount = adminUsers.length;

      // Allow up to 5 admins in Clerk-based system
      if (adminCount >= 5) {
        return handleApiError(
          new ApiErrorResponse(
            "Límite de administradores alcanzado. Máximo 5 administradores permitidos.",
            403,
            "ADMIN_LIMIT_EXCEEDED",
            {
              currentAdminsCreated: adminCount,
              maxAllowed: 5,
              contactInfo: {
                email: "support@plataforma-astral.com",
                message: "Contacta al soporte para más información",
              },
            },
          ),
          "POST /api/admin/users",
        );
      }
    }

    try {
      // Create user in Clerk
      const clerkUserData: CreateClerkUserData = {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        role: validatedData.role,
        isActive: true,
        skipPasswordRequirement: !validatedData.password, // Allow passwordless for OAuth users
      };

      const user = await createClerkUser(clerkUserData);

      // Log successful user creation
      logUserCreation(
        "adminUserCreation",
        {
          email: validatedData.email,
          role: validatedData.role,
          name: validatedData.name,
        },
        session.user.id,
        true,
      );

      // Map to expected structure
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      };

      // Get updated admin creation stats after creating the user
      const adminUsers = await getClerkUsers("ADMIN");
      const adminsCreated = adminUsers.length;
      const maxAdminsAllowed = 5;

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
      // Log failed user creation
      logUserCreation(
        "createUserClerk",
        { email: validatedData.email, role: validatedData.role },
        session.user.id,
        false,
        error,
      );

      // Re-throw the error to be handled by outer catch block
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiError(
        new ApiErrorResponse(
          "Datos de entrada inválidos",
          400,
          "VALIDATION_ERROR",
          {
            validationErrors: error.issues,
          },
        ),
        "POST /api/admin/users",
      );
    }

    return handleApiError(error, "POST /api/admin/users");
  }
}
