/**
 * Standardized Error Types and Handling
 * Consistent error classification and handling across the application
 * Part of Stage 4: Quality & Performance
 */

import { UserRole } from '@/lib/prisma-compat-types';
export type ExtendedUserRole = UserRole;

// Base error interface
export interface AppError extends Error {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean;
  statusCode?: number;
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'AUTH',
  AUTHORIZATION = 'AUTHZ',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVICE = 'SERVICE',
  DATABASE = 'DATABASE',
  FILE_SYSTEM = 'FILE_SYSTEM',
  UI = 'UI',
  UNKNOWN = 'UNKNOWN',
}

// Specific error classes
export class AuthenticationError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'high';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = false;
  statusCode?: number = 401;

  constructor(
    message: string,
    code: string = 'AUTH_FAILED',
    context?: string,
    userRole?: ExtendedUserRole
  ) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = `${ErrorCategory.AUTHENTICATION}_${code}`;
    this.context = context;
    this.userRole = userRole;
    this.technicalMessage = message;
    this.userMessage =
      'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    this.timestamp = new Date();
  }
}

export class AuthorizationError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = false;
  statusCode?: number = 403;

  constructor(
    message: string,
    code: string = 'ACCESS_DENIED',
    context?: string,
    userRole?: ExtendedUserRole
  ) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = `${ErrorCategory.AUTHORIZATION}_${code}`;
    this.context = context;
    this.userRole = userRole;
    this.technicalMessage = message;
    this.userMessage = 'No tienes permisos para realizar esta acción.';
    this.timestamp = new Date();
  }
}

export class ValidationError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = true;
  statusCode?: number = 400;
  fieldErrors: Record<string, string[]> = {};

  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {},
    code: string = 'INVALID_INPUT',
    context?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = `${ErrorCategory.VALIDATION}_${code}`;
    this.context = context;
    this.fieldErrors = fieldErrors;
    this.technicalMessage = message;
    this.userMessage = 'Por favor, revisa la información ingresada.';
    this.timestamp = new Date();
  }
}

export class NetworkError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = true;
  statusCode?: number;

  constructor(
    message: string,
    code: string = 'CONNECTION_FAILED',
    statusCode?: number,
    context?: string
  ) {
    super(message);
    this.name = 'NetworkError';
    this.code = `${ErrorCategory.NETWORK}_${code}`;
    this.context = context;
    this.statusCode = statusCode;
    this.technicalMessage = message;
    this.timestamp = new Date();

    // User-friendly messages based on status code
    if (statusCode === 0 || !statusCode) {
      this.userMessage =
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      this.severity = 'high';
    } else if (statusCode >= 500) {
      this.userMessage =
        'El servidor está experimentando problemas. Intenta nuevamente en unos minutos.';
      this.severity = 'high';
    } else if (statusCode === 429) {
      this.userMessage =
        'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.';
      this.retryable = false;
    } else {
      this.userMessage = 'Error de conexión. Por favor, intenta nuevamente.';
    }
  }
}

export class ServiceError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = true;
  statusCode?: number = 500;

  constructor(
    message: string,
    code: string = 'SERVICE_UNAVAILABLE',
    context?: string,
    retryable: boolean = true
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = `${ErrorCategory.SERVICE}_${code}`;
    this.context = context;
    this.retryable = retryable;
    this.technicalMessage = message;
    this.userMessage = retryable
      ? 'Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.'
      : 'Error en el servicio. Por favor, contacta al administrador.';
    this.timestamp = new Date();
  }
}

export class DatabaseError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'critical';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = false;
  statusCode?: number = 500;

  constructor(
    message: string,
    code: string = 'DB_CONNECTION_FAILED',
    context?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = `${ErrorCategory.DATABASE}_${code}`;
    this.context = context;
    this.technicalMessage = message;
    this.userMessage =
      'Error en la base de datos. Los administradores han sido notificados.';
    this.timestamp = new Date();
  }
}

export class FileSystemError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = true;
  statusCode?: number = 500;

  constructor(
    message: string,
    code: string = 'FILE_OPERATION_FAILED',
    context?: string
  ) {
    super(message);
    this.name = 'FileSystemError';
    this.code = `${ErrorCategory.FILE_SYSTEM}_${code}`;
    this.context = context;
    this.technicalMessage = message;
    this.userMessage =
      'Error al procesar el archivo. Intenta nuevamente o contacta soporte.';
    this.timestamp = new Date();
  }
}

export class UIError extends Error implements AppError {
  code: string;
  context?: string;
  userRole?: ExtendedUserRole;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  userMessage: string;
  technicalMessage: string;
  timestamp: Date;
  retryable: boolean = true;
  statusCode?: number;

  constructor(
    message: string,
    code: string = 'RENDER_FAILED',
    context?: string
  ) {
    super(message);
    this.name = 'UIError';
    this.code = `${ErrorCategory.UI}_${code}`;
    this.context = context;
    this.technicalMessage = message;
    this.userMessage = 'Error en la interfaz. Intenta recargar la página.';
    this.timestamp = new Date();
  }
}

// Error factory functions
export function createError(
  category: ErrorCategory,
  message: string,
  code?: string,
  context?: string,
  userRole?: ExtendedUserRole
): AppError {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return new AuthenticationError(message, code, context, userRole);
    case ErrorCategory.AUTHORIZATION:
      return new AuthorizationError(message, code, context, userRole);
    case ErrorCategory.VALIDATION:
      return new ValidationError(message, {}, code, context);
    case ErrorCategory.NETWORK:
      return new NetworkError(message, code, undefined, context);
    case ErrorCategory.SERVICE:
      return new ServiceError(message, code, context);
    case ErrorCategory.DATABASE:
      return new DatabaseError(message, code, context);
    case ErrorCategory.FILE_SYSTEM:
      return new FileSystemError(message, code, context);
    case ErrorCategory.UI:
      return new UIError(message, code, context);
    default:
      const error = new Error(message) as AppError;
      error.code = `${ErrorCategory.UNKNOWN}_${code || 'GENERIC'}`;
      error.context = context;
      error.userRole = userRole;
      error.severity = 'medium';
      error.userMessage = 'Ha ocurrido un error inesperado.';
      error.technicalMessage = message;
      error.timestamp = new Date();
      error.retryable = true;
      return error;
  }
}

// Error classification helper
export function classifyError(error: any): AppError {
  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof ValidationError ||
    error instanceof NetworkError ||
    error instanceof ServiceError ||
    error instanceof DatabaseError ||
    error instanceof FileSystemError ||
    error instanceof UIError
  ) {
    return error;
  }

  // Try to classify based on error properties
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return new UIError(error.message, 'JS_ERROR');
  }

  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new NetworkError(error.message, 'FETCH_FAILED');
  }

  if (
    error.message?.includes('validation') ||
    error.message?.includes('invalid')
  ) {
    return new ValidationError(error.message);
  }

  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode;
    if (statusCode === 401) {
      return new AuthenticationError(error.message);
    }
    if (statusCode === 403) {
      return new AuthorizationError(error.message);
    }
    if (statusCode >= 400 && statusCode < 500) {
      return new ValidationError(error.message);
    }
    if (statusCode >= 500) {
      return new ServiceError(error.message);
    }
  }

  // Default to generic error
  return createError(
    ErrorCategory.UNKNOWN,
    error.message || 'Unknown error',
    'UNCLASSIFIED'
  );
}

// Error severity helpers
export function isCriticalError(error: AppError): boolean {
  return error.severity === 'critical';
}

export function isRetryableError(error: AppError): boolean {
  return error.retryable;
}

export function shouldNotifyUser(error: AppError): boolean {
  return error.severity !== 'low';
}

export function shouldLogError(error: AppError): boolean {
  return error.severity !== 'low';
}

// Context-aware error message formatting
export function formatErrorForContext(
  error: AppError,
  context: 'public' | 'auth' | 'admin' = 'public'
): { title: string; message: string; showTechnical: boolean } {
  const showTechnical = context === 'admin' || context === 'auth';

  let title = 'Error';
  switch (error.severity) {
    case 'critical':
      title = context === 'public' ? '¡Ups! Problema técnico' : 'Error Crítico';
      break;
    case 'high':
      title = context === 'public' ? 'Problema temporal' : 'Error Importante';
      break;
    case 'medium':
      title = context === 'public' ? 'Pequeño inconveniente' : 'Error';
      break;
    case 'low':
      title = context === 'public' ? 'Información' : 'Advertencia';
      break;
  }

  return {
    title,
    message: error.userMessage,
    showTechnical,
  };
}
