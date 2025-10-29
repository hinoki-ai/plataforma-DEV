/**
 * Centralized User Creation Utilities
 * Standardizes password hashing, validation, and error handling across all user creation flows
 */

import { z } from "zod";
import { hashPassword } from "./crypto";
import { ExtendedUserRole } from "./authorization";

// ==========================================
// PASSWORD VALIDATION SCHEMAS
// ==========================================

/**
 * Standard password validation schema - used across all user creation flows
 */
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número")
  .regex(
    /[^a-zA-Z0-9]/,
    "La contraseña debe contener al menos un carácter especial",
  );

// ==========================================
// USER CREATION SCHEMAS
// ==========================================

/**
 * Base user creation schema - minimal fields required for any user
 */
export const baseUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  email: z.string().email("Ingrese un email válido").toLowerCase().trim(),
  role: z.enum(["MASTER", "ADMIN", "PROFESOR", "PARENT", "PUBLIC"] as const),
  password: passwordSchema.optional(), // Optional for OAuth users
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  isOAuthUser: z.boolean().default(false),
  provider: z.string().optional(),
  institutionId: z.string().optional(),
  createdByAdmin: z.string().optional(),
  parentRole: z.string().optional(),
  status: z
    .enum(["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"] as const)
    .default("ACTIVE"),
});

/**
 * Admin user creation schema
 */
export const adminUserCreationSchema = baseUserSchema.extend({
  role: z.enum(["ADMIN", "PROFESOR", "PARENT"] as const),
});

/**
 * Parent self-registration schema
 */
export const parentRegistrationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  email: z.string().email("Ingrese un email válido").toLowerCase().trim(),
  password: passwordSchema,
  phone: z.string().optional(),
  guardianPhone: z.string().optional(),
  // Student information for verification
  studentName: z
    .string()
    .min(2, "El nombre del estudiante es requerido")
    .trim(),
  studentGrade: z.string().min(1, "El grado del estudiante es requerido"),
  studentEmail: z
    .string()
    .email("El email del estudiante debe ser válido")
    .toLowerCase()
    .trim()
    .optional(),
  relationship: z.string().min(1, "La relación familiar es requerida"),
});

/**
 * Complete parent registration schema (with child and profile info)
 */
export const completeParentRegistrationSchema = z.object({
  // User fields
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  email: z.string().email("Ingrese un email válido").toLowerCase().trim(),
  phone: z.string().min(1, "El teléfono es requerido"),
  password: passwordSchema,
  // Parent profile fields
  rut: z.string().min(1, "El RUT es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  region: z.string().min(1, "La región es requerida"),
  comuna: z.string().min(1, "La comuna es requerida"),
  relationship: z.string().min(1, "La relación familiar es requerida"),
  emergencyContact: z.string().min(1, "El contacto de emergencia es requerido"),
  emergencyPhone: z.string().min(1, "El teléfono de emergencia es requerido"),
  // Student fields
  childName: z.string().min(2, "El nombre del estudiante es requerido").trim(),
  childGrade: z.string().min(1, "El grado del estudiante es requerido"),
  // Institution
  institutionId: z.string().optional(),
  // Optional OAuth fields
  provider: z.string().optional(),
  isOAuthUser: z.boolean().optional(),
});

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type BaseUserData = z.infer<typeof baseUserSchema>;
export type AdminUserCreationData = z.infer<typeof adminUserCreationSchema>;
export type ParentRegistrationData = z.infer<typeof parentRegistrationSchema>;
export type CompleteParentRegistrationData = z.infer<
  typeof completeParentRegistrationSchema
>;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Standardizes password hashing across all user creation flows
 */
export async function hashUserPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error("Password is required for hashing");
  }
  return await hashPassword(password);
}

/**
 * Generates a random secure password for OAuth users
 */
export function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Normalizes role values to ensure consistency
 */
export function normalizeRole(
  role: string | ExtendedUserRole,
): ExtendedUserRole {
  const normalized = role.toUpperCase() as ExtendedUserRole;

  const validRoles: ExtendedUserRole[] = [
    "MASTER",
    "ADMIN",
    "PROFESOR",
    "PARENT",
    "PUBLIC",
  ];

  if (!validRoles.includes(normalized)) {
    throw new Error(
      `Invalid role: ${role}. Must be one of: ${validRoles.join(", ")}`,
    );
  }

  return normalized;
}

/**
 * Validates user creation data and returns standardized format
 */
export async function prepareUserData(
  data: BaseUserData,
  options: {
    hashPassword?: boolean;
    generatePasswordForOAuth?: boolean;
  } = {},
): Promise<BaseUserData & { password?: string }> {
  const { hashPassword: shouldHash = true, generatePasswordForOAuth = true } =
    options;

  let processedPassword = data.password;

  // Handle OAuth users
  if (data.isOAuthUser) {
    if (generatePasswordForOAuth && !processedPassword) {
      processedPassword = generateRandomPassword();
    }
  }

  // Hash password if required and present
  if (shouldHash && processedPassword) {
    processedPassword = await hashUserPassword(processedPassword);
  }

  // Normalize role
  const normalizedRole = normalizeRole(data.role);

  return {
    ...data,
    password: processedPassword,
    role: normalizedRole,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
  };
}

/**
 * Standard error handling for user creation
 */
export class UserCreationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = "USER_CREATION_FAILED",
    statusCode: number = 500,
    details?: any,
  ) {
    super(message);
    this.name = "UserCreationError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static userAlreadyExists(email: string): UserCreationError {
    return new UserCreationError(
      "El usuario con este email ya existe",
      "USER_ALREADY_EXISTS",
      409,
      { email },
    );
  }

  static invalidData(details: any): UserCreationError {
    return new UserCreationError(
      "Datos de entrada inválidos",
      "VALIDATION_ERROR",
      400,
      details,
    );
  }

  static insufficientPermissions(requiredRole: string): UserCreationError {
    return new UserCreationError(
      `No tienes permisos para crear usuarios ${requiredRole.toLowerCase()}`,
      "INSUFFICIENT_PERMISSIONS",
      403,
      { requiredRole },
    );
  }

  static adminLimitExceeded(current: number, max: number): UserCreationError {
    return new UserCreationError(
      "Límite de administradores alcanzado",
      "ADMIN_LIMIT_EXCEEDED",
      403,
      { current, max, remaining: Math.max(0, max - current) },
    );
  }
}

/**
 * Logs user creation activities for audit purposes
 */
export function logUserCreation(
  action: string,
  userData: Partial<BaseUserData>,
  createdBy?: string,
  success: boolean = true,
  error?: any,
): void {
  const logData = {
    action,
    timestamp: new Date().toISOString(),
    email: userData.email,
    role: userData.role,
    createdBy,
    success,
    error: error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
        }
      : undefined,
  };

  if (success) {
    console.log(`✅ User Creation: ${action}`, logData);
  } else {
    console.error(`❌ User Creation Failed: ${action}`, logData);
  }
}
