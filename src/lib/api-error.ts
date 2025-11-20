import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class ApiErrorResponse extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: any,
  ) {
    super(message);
    this.name = "ApiErrorResponse";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Standardized error response utility for API routes
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_ERROR",
  details?: any,
) {
  const error = {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(error, { status: statusCode });
}

/**
 * Success response utility for API routes
 */
export function createSuccessResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any, context?: string): NextResponse {
  // Use structured logging
  try {
    if (error instanceof ApiErrorResponse) {
      apiLogger.error(`API Error: ${error.message}`, undefined, {
        context,
        statusCode: error.statusCode,
        code: error.code,
        details: error.details,
      });
    } else {
      apiLogger.error(
        `API Error${context ? ` in ${context}` : ""}`,
        error instanceof Error ? error : new Error(String(error)),
        {
          context,
        },
      );
    }
  } catch (loggingError) {
    // Fallback logging if structured logging fails
  }

  // If it's already our custom error
  if (error instanceof ApiErrorResponse) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details,
    );
  }

  // Handle Prisma errors
  if (error?.code?.startsWith("P")) {
    const prismaErrors: Record<
      string,
      { message: string; statusCode: number }
    > = {
      P2002: {
        message: "Ya existe un registro con estos datos",
        statusCode: 409,
      },
      P2025: {
        message: "El registro solicitado no fue encontrado",
        statusCode: 404,
      },
      P1001: {
        message: "Error de conexión a la base de datos",
        statusCode: 503,
      },
      P1017: {
        message: "La conexión a la base de datos fue cerrada",
        statusCode: 503,
      },
    };

    const prismaError = prismaErrors[error.code];
    if (prismaError) {
      return createErrorResponse(
        prismaError.message,
        prismaError.statusCode,
        error.code,
        {
          originalError: error.message,
        },
      );
    }
  }

  // Handle validation errors
  if (error?.name === "ValidationError") {
    return createErrorResponse(
      "Datos de entrada inválidos",
      400,
      "VALIDATION_ERROR",
      {
        validationErrors: error.errors,
      },
    );
  }

  // Handle authentication errors
  if (
    error?.name === "UnauthorizedError" ||
    error?.message?.includes("unauthorized")
  ) {
    return createErrorResponse("Acceso no autorizado", 401, "UNAUTHORIZED");
  }

  // Handle rate limiting
  if (error?.message?.includes("rate limit") || error?.statusCode === 429) {
    return createErrorResponse(
      "Demasiadas solicitudes. Intente más tarde.",
      429,
      "RATE_LIMITED",
    );
  }

  // Default error response
  const message = error?.message || "Ha ocurrido un error interno del servidor";
  const statusCode = error?.statusCode || 500;

  return createErrorResponse(message, statusCode, "INTERNAL_ERROR", {
    originalError: error?.message,
    context,
  });
}
