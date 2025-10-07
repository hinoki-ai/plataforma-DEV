import { NextResponse } from "next/server";
import { logger } from "./logger";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    options: {
      isOperational?: boolean;
      code?: string;
    } = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.code = options.code;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, { code: "VALIDATION_ERROR" });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, 401, { code: "AUTHENTICATION_ERROR" });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Permisos insuficientes") {
    super(message, 403, { code: "AUTHORIZATION_ERROR" });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Recurso no encontrado") {
    super(message, 404, { code: "NOT_FOUND_ERROR" });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Error de base de datos") {
    super(message, 500, { code: "DATABASE_ERROR" });
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Error de conexión") {
    super(message, 503, { code: "NETWORK_ERROR" });
  }
}

export class UploadError extends AppError {
  constructor(message: string = "Error al subir archivo") {
    super(message, 400, { code: "UPLOAD_ERROR" });
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Demasiadas peticiones. Intenta más tarde.") {
    super(message, 429, { code: "RATE_LIMIT_ERROR" });
  }
}

export class CSRFError extends AppError {
  constructor(message: string = "Token CSRF inválido") {
    super(message, 403, { code: "CSRF_ERROR" });
  }
}

// Helper function to check if error is a Next.js redirect
function isNextRedirect(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return (
    error.message === "NEXT_REDIRECT" ||
    (error as any).digest === "NEXT_REDIRECT" ||
    (error as any).digest?.startsWith?.("NEXT_REDIRECT")
  );
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Don't handle Next.js redirects - let them pass through
  if (isNextRedirect(error)) {
    throw error;
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (
      error.message.includes("prisma") ||
      error.message.includes("database")
    ) {
      return new DatabaseError(error.message);
    }

    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new NetworkError(error.message);
    }

    if (
      error.message.includes("unauthorized") ||
      error.message.includes("auth")
    ) {
      return new AuthenticationError(error.message);
    }

    // Generic application error
    return new AppError(error.message, 500);
  }

  // Unknown error type
  return new AppError("Error interno del servidor", 500);
}

export function logError(error: AppError, context?: Record<string, any>) {
  const logData = {
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    stack: error.stack,
    isOperational: error.isOperational,
    context,
  };

  if (error.statusCode >= 500) {
    logger.error("[SYSTEM ERROR]", error);
  } else if (error.statusCode >= 400) {
    logger.warn("[CLIENT ERROR]", error);
  } else {
    logger.info("[APPLICATION ERROR]", error.message);
  }

  // In production, send to error monitoring service
  if (process.env.NODE_ENV === "production") {
    // sendToErrorMonitoring(logData)
  }
}

export interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
    code?: string;
    timestamp: string;
    action?: string;
  };
  success: false;
}

export function createErrorResponse(error: AppError): ErrorResponse {
  return {
    error: {
      message: getUserFriendlyMessage(error.message, error.code),
      statusCode: error.statusCode,
      code: error.code,
      timestamp: error.timestamp.toISOString(),
      action: getErrorAction(error.code),
    },
    success: false,
  };
}

// Server action error wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Let Next.js redirects pass through
      if (isNextRedirect(error)) {
        throw error;
      }

      const appError = handleError(error);
      logError(appError, { args });
      throw appError;
    }
  };
}

// User-friendly error messages
function getUserFriendlyMessage(
  errorMessage: string,
  errorCode?: string,
): string {
  const errorMap: Record<string, Record<string, string>> = {
    UPLOAD_ERROR: {
      "too large": "El archivo es demasiado grande (máximo 10MB)",
      "invalid type":
        "Tipo de archivo no permitido. Use imágenes, PDF, Word o Excel",
      "upload failed": "Error al subir el archivo. Por favor, intenta de nuevo",
      "no files": "Por favor, selecciona al menos un archivo",
      "too many files": "Máximo 5 archivos por carga",
    },
    VALIDATION_ERROR: {
      required: "Este campo es obligatorio",
      "invalid format": "Formato inválido. Por favor, revisa los datos",
      "out of range": "El valor está fuera del rango permitido",
    },
    AUTHENTICATION_ERROR: {
      authentication: "Por favor, inicia sesión para continuar",
      "session expired": "Tu sesión ha expirado. Inicia sesión nuevamente",
    },
    AUTHORIZATION_ERROR: {
      permission: "No tienes permisos para realizar esta acción",
    },
    RATE_LIMIT_ERROR: {
      "too many": "Demasiadas peticiones. Espera un momento",
    },
    CSRF_ERROR: {
      csrf: "Token de seguridad inválido. Refresca la página",
    },
  };

  if (errorCode && errorMap[errorCode]) {
    const messages = errorMap[errorCode];
    const lowerMessage = errorMessage.toLowerCase();

    for (const [key, friendlyMessage] of Object.entries(messages)) {
      if (lowerMessage.includes(key)) {
        return friendlyMessage;
      }
    }
  }

  return errorMessage;
}

// Action recommendations for users
function getErrorAction(errorCode?: string): string {
  const actions: Record<string, string> = {
    AUTHENTICATION_ERROR: "Inicia sesión para continuar",
    VALIDATION_ERROR: "Revisa los datos ingresados",
    UPLOAD_ERROR: "Verifica el archivo y vuelve a intentar",
    RATE_LIMIT_ERROR: "Espera un momento antes de reintentar",
    CSRF_ERROR: "Refresca la página y vuelve a intentar",
    DATABASE_ERROR: "Contacta al administrador si persiste",
    NETWORK_ERROR: "Verifica tu conexión a internet",
    NOT_FOUND_ERROR: "Verifica la URL o vuelve al inicio",
  };

  return (
    actions[errorCode || ""] || "Intenta de nuevo o contacta soporte técnico"
  );
}

// API route error wrapper
export function withApiErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
) {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error);
      logError(appError, { args });

      return NextResponse.json(createErrorResponse(appError), {
        status: appError.statusCode,
      });
    }
  };
}
