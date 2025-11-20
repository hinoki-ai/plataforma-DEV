import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type { SessionData } from "@/lib/auth-client";
import { createSuccessResponse, handleApiError } from "@/lib/api-error";

// =================================================
// 🛡️ UNIFIED API VALIDATION SYSTEM
// =================================================
// Standardizes request validation, auth, and responses
// across all API endpoints

// Common validation schemas
export const CommonSchemas = {
  // User ID validation
  userId: z.string().cuid("Invalid user ID format"),

  // Email validation with school domain preference
  email: z.string().email("Invalid email format").max(255, "Email too long"),

  // Password with security requirements
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Date range filters
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // Search query
  search: z.object({
    q: z.string().max(100, "Search query too long").optional(),
  }),
};

// Role-based access control
export const REQUIRED_ROLES = {
  MASTER_ONLY: ["MASTER"],
  ADMIN_PLUS: ["MASTER", "ADMIN"],
  TEACHER_PLUS: ["MASTER", "ADMIN", "PROFESOR"],
  PARENT_PLUS: ["MASTER", "ADMIN", "PARENT"],
  ANY_AUTHENTICATED: ["MASTER", "ADMIN", "PROFESOR", "PARENT"],
} as const;

type RequiredRole = keyof typeof REQUIRED_ROLES;

// Validation result types
export interface ValidationResult<T> {
  success: true;
  data: T;
  session: SessionData;
}

export interface ValidationError {
  success: false;
  error: string;
  details?: z.ZodError;
}

// Main validation function
export async function validateApiRequest<T>(
  request: NextRequest,
  options: {
    bodySchema?: z.ZodSchema<T>;
    querySchema?: z.ZodSchema<any>;
    requiredRole?: RequiredRole;
    requireAuth?: boolean;
  } = {},
): Promise<ValidationResult<T> | ValidationError> {
  try {
    const {
      bodySchema,
      querySchema,
      requiredRole,
      requireAuth = true,
    } = options;

    // 1. Authentication check
    const session = await auth();

    if (requireAuth && !session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // 2. Authorization check
    if (requiredRole && session?.user) {
      const userRole = session?.user.role;
      const allowedRoles = REQUIRED_ROLES[requiredRole];

      if (!allowedRoles.includes(userRole as any)) {
        return {
          success: false,
          error: `Insufficient permissions. Required: ${allowedRoles.join(" or ")}`,
        };
      }
    }

    // 3. Query validation
    if (querySchema) {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());

      const queryResult = querySchema.safeParse(queryParams);
      if (!queryResult.success) {
        return {
          success: false,
          error: "Invalid query parameters",
          details: queryResult.error,
        };
      }
    }

    // 4. Body validation
    let bodyData: T | undefined;
    if (bodySchema) {
      try {
        const body = await request.json();
        const bodyResult = bodySchema.safeParse(body);

        if (!bodyResult.success) {
          return {
            success: false,
            error: "Invalid request body",
            details: bodyResult.error,
          };
        }

        bodyData = bodyResult.data;
      } catch (error) {
        return {
          success: false,
          error: "Invalid JSON in request body",
        };
      }
    }

    return {
      success: true,
      data: bodyData as T,
      session: session as SessionData,
    };
  } catch (error) {
    console.error("API validation error:", error);
    return {
      success: false,
      error: "Internal validation error",
    };
  }
}

// Helper function to create validated API route handler
export function createApiRoute<TBody = any, TQuery = any>(
  handler: (
    request: NextRequest,
    validated: ValidationResult<TBody>,
    query?: TQuery,
  ) => Promise<Response>,
  options: {
    bodySchema?: z.ZodSchema<TBody>;
    querySchema?: z.ZodSchema<TQuery>;
    requiredRole?: RequiredRole;
    requireAuth?: boolean;
  } = {},
) {
  return async (request: NextRequest) => {
    try {
      // Validate the request
      const validation = await validateApiRequest(request, options);

      if (!validation.success) {
        return handleApiError(
          new Error(validation.error),
          request.nextUrl.pathname,
        );
      }

      // Parse query if schema provided
      let queryData: TQuery | undefined;
      if (options.querySchema) {
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        const queryResult = options.querySchema.safeParse(queryParams);

        if (queryResult.success) {
          queryData = queryResult.data;
        }
      }

      // Call the actual handler
      return await handler(request, validation, queryData);
    } catch (error) {
      return handleApiError(error, request.nextUrl.pathname);
    }
  };
}

// Specific validation schemas for common use cases
export const ApiSchemas = {
  // User management
  createUser: z.object({
    name: z.string().min(2).max(100),
    email: CommonSchemas.email,
    password: CommonSchemas.password,
    role: z.enum(["ADMIN", "PROFESOR", "PARENT"]),
  }),

  updateUser: z.object({
    name: z.string().min(2).max(100).optional(),
    email: CommonSchemas.email.optional(),
    isActive: z.boolean().optional(),
  }),

  // Meeting management
  createMeeting: z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    studentName: z.string().min(2).max(100),
    studentGrade: z.string().min(1).max(20),
    guardianName: z.string().min(2).max(100),
    guardianEmail: CommonSchemas.email,
    guardianPhone: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format"),
    scheduledDate: z.string().datetime(),
    scheduledTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    duration: z.number().int().min(15).max(240).default(30),
    location: z.string().max(100).default("Sala de Reuniones"),
  }),

  // Calendar events
  createCalendarEvent: z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    category: z.enum([
      "ACADEMIC",
      "HOLIDAY",
      "SPECIAL",
      "PARENT",
      "ADMINISTRATIVE",
      "EXAM",
      "MEETING",
      "VACATION",
      "EVENT",
      "DEADLINE",
      "OTHER",
    ]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    level: z.string().default("both"),
    isAllDay: z.boolean().default(false),
    isRecurring: z.boolean().default(false),
    location: z.string().max(200).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
      .optional(),
  }),

  // Planning documents
  createPlanningDocument: z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(10).max(10000),
    subject: z.string().min(2).max(100),
    grade: z.string().min(1).max(20),
    attachments: z.array(z.string().url()).optional(),
  }),

  // Error reporting
  errorReport: z.object({
    errorId: z.string().min(1),
    message: z.string().min(1).max(1000),
    stack: z.string().max(5000).optional(),
    url: z.string().url().optional(),
    userAgent: z.string().max(500).optional(),
    timestamp: z.string().datetime(),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    context: z.record(z.string(), z.any()).optional(),
  }),
};

// Query parameter schemas
export const QuerySchemas = {
  pagination: CommonSchemas.pagination,
  search: CommonSchemas.search,
  dateRange: CommonSchemas.dateRange,

  // User filtering
  userFilters: z.object({
    ...CommonSchemas.pagination.shape,
    ...CommonSchemas.search.shape,
    role: z.enum(["MASTER", "ADMIN", "PROFESOR", "PARENT"]).optional(),
    isActive: z.coerce.boolean().optional(),
  }),

  // Meeting filtering
  meetingFilters: z.object({
    ...CommonSchemas.pagination.shape,
    ...CommonSchemas.dateRange.shape,
    status: z
      .enum([
        "SCHEDULED",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "RESCHEDULED",
      ])
      .optional(),
    type: z
      .enum([
        "PARENT_TEACHER",
        "FOLLOW_UP",
        "EMERGENCY",
        "IEP_REVIEW",
        "GRADE_CONFERENCE",
      ])
      .optional(),
  }),
};

export default validateApiRequest;
