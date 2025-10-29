import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, Permissions, canCreateUser } from "@/lib/authorization";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
  hashUserPassword,
  logUserCreation,
  UserCreationError,
  type AdminUserCreationData,
} from "@/lib/user-creation";

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

    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return handleApiError(
        new ApiErrorResponse("Acceso no autorizado", 401, "UNAUTHORIZED"),
        "GET /api/admin/users",
      );
    }

    const client = getConvexClient();
    const allUsers = await client.query(api.users.getUsers, {});

    // Map to match expected structure
    const users = allUsers
      .map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    // Get admin creation stats for the current admin
    const admins = allUsers.filter(
      (u) => u.role === "ADMIN" && u.createdByAdmin === session.user.id,
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

    const client = getConvexClient();

    // Check if email already exists
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: validatedData.email,
    });

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
      // Count how many admins this admin has already created
      const allUsers = await client.query(api.users.getUsers, {
        role: "ADMIN",
      });
      const adminCount = allUsers.filter(
        (u) => u.createdByAdmin === session.user.id,
      ).length;

      // Limit to 1 secondary admin per main admin
      if (adminCount >= 1) {
        return handleApiError(
          new ApiErrorResponse(
            "Límite de administradores alcanzado. Solo puedes crear 1 administrador secundario.",
            403,
            "ADMIN_LIMIT_EXCEEDED",
            {
              currentAdminsCreated: adminCount,
              maxAllowed: 1,
              contactInfo: {
                email: "support@plataforma-astral.com",
                message: "Solicita ampliación de slots de administrador",
              },
            },
          ),
          "POST /api/admin/users",
        );
      }
    }

    // Hash the provided password using standardized function
    const password = validatedData.password;
    const hashedPassword = password
      ? await hashUserPassword(password)
      : undefined;

    const userId = await client.mutation(api.users.createUser, {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      institutionId: validatedData.institutionId as any, // Type assertion for Convex ID
      createdByAdmin: session.user.id, // Track which admin created this user
    });

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

    const user = await client.query(api.users.getUserById, { userId: userId });

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
    const allUsers = await client.query(api.users.getUsers, { role: "ADMIN" });
    const adminsCreated = allUsers.filter(
      (u) => u.createdByAdmin === session.user.id,
    ).length;
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
