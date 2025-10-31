import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { validateRUT } from "./rut-utils";

// Common validation patterns
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s\-_.,()\u00C0-\u017F]+$/; // Includes Spanish characters
const FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(input: string | null | undefined): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ol",
      "ul",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "div",
    ],
    ALLOWED_ATTR: ["class"],
    FORBID_ATTR: ["style", "onclick", "onload", "onerror"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
  });
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) {
    if (input === null || input === undefined) {
      throw new Error("Input cannot be null or undefined");
    }
    return "";
  }
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML brackets
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/data:/gi, "") // Remove data: URLs
    .replace(/alert\(/gi, "") // Remove alert calls
    .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace unsafe chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .slice(0, 255); // Limit length
}

// File upload validation schema
export const fileUploadSchema = z.object({
  files: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Nombre de archivo requerido")
          .max(255, "Nombre de archivo muy largo")
          .refine(
            (name) => FILENAME_REGEX.test(sanitizeFilename(name)),
            "Nombre de archivo contiene caracteres no válidos",
          ),
        size: z
          .number()
          .min(1, "Archivo vacío")
          .max(10 * 1024 * 1024, "Archivo excede el límite de 10MB"),
        type: z.enum(
          [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
          ],
          "Tipo de archivo no permitido",
        ),
      }),
    )
    .max(5, "Máximo 5 archivos permitidos"),
});

// Planning document validation schema
export const planningDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Título requerido")
    .max(200, "Título muy largo")
    .transform(sanitizeText)
    .refine(
      (title) => title.length > 0,
      "Título no puede estar vacío después de sanitización",
    ),

  content: z
    .string()
    .min(1, "Contenido requerido")
    .max(50000, "Contenido muy largo")
    .transform(sanitizeHTML)
    .refine(
      (content) => content.length > 0,
      "Contenido no puede estar vacío después de sanitización",
    ),

  subject: z
    .string()
    .min(1, "Materia requerida")
    .max(100, "Materia muy larga")
    .transform(sanitizeText)
    .refine(
      (subject) => SAFE_TEXT_REGEX.test(subject),
      "Materia contiene caracteres no válidos",
    ),

  grade: z
    .string()
    .min(1, "Grado requerido")
    .max(50, "Grado muy largo")
    .transform(sanitizeText)
    .refine(
      (grade) => SAFE_TEXT_REGEX.test(grade),
      "Grado contiene caracteres no válidos",
    ),

  attachments: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Nombre de archivo requerido")
          .max(255, "Nombre muy largo"),
        url: z.string().url("URL no válida"),
        size: z.number().positive("Tamaño debe ser positivo"),
        type: z.string().min(1, "Tipo de archivo requerido"),
      }),
    )
    .optional()
    .nullable(),
});

// User authentication validation schema
export const authSchema = z.object({
  email: z
    .string()
    .min(1, "Email requerido")
    .max(320, "Email muy largo") // RFC 5321 limit
    .email("Email no válido")
    .transform((email) => email.toLowerCase().trim())
    .refine((email) => EMAIL_REGEX.test(email), "Formato de email no válido"),

  password: z
    .string()
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .max(128, "Contraseña muy larga")
    .refine(
      (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
      "Contraseña debe contener al menos una minúscula, una mayúscula y un número",
    ),
});

// Reservation validation schema
export const reservationSchema = z.object({
  studentName: z
    .string()
    .min(1, "Nombre del estudiante requerido")
    .max(100, "Nombre muy largo")
    .transform(sanitizeText)
    .refine(
      (name) => SAFE_TEXT_REGEX.test(name),
      "Nombre contiene caracteres no válidos",
    ),

  studentGrade: z
    .string()
    .min(1, "Grado del estudiante requerido")
    .max(50, "Grado muy largo")
    .transform(sanitizeText),

  guardianName: z
    .string()
    .min(1, "Nombre del apoderado requerido")
    .max(100, "Nombre muy largo")
    .transform(sanitizeText)
    .refine(
      (name) => SAFE_TEXT_REGEX.test(name),
      "Nombre contiene caracteres no válidos",
    ),

  guardianEmail: z
    .string()
    .min(1, "Email del apoderado requerido")
    .email("Email no válido")
    .transform((email) => email.toLowerCase().trim()),

  guardianPhone: z
    .string()
    .min(8, "Teléfono muy corto")
    .max(15, "Teléfono muy largo")
    .regex(/^[+]?[0-9\s-()]+$/, "Teléfono contiene caracteres no válidos")
    .transform((phone) => phone.replace(/\s/g, "")), // Remove spaces

  preferredDate: z
    .string()
    .datetime("Fecha no válida")
    .refine((date) => new Date(date) > new Date(), "La fecha debe ser futura"),

  preferredTime: z
    .string()
    .min(1, "Hora requerida")
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora no válido (HH:MM)",
    ),

  reason: z
    .string()
    .min(10, "Motivo debe tener al menos 10 caracteres")
    .max(1000, "Motivo muy largo")
    .transform(sanitizeHTML),
});

// Validation middleware for API routes
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<T> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`,
        );
        throw new Error(`Validation errors: ${errors.join(", ")}`);
      }
      throw new Error("Invalid request body");
    }
  };
}

// Validation for FormData
export function validateFormData<T>(schema: z.ZodSchema<T>) {
  return (formData: FormData): T => {
    try {
      const data: Record<string, any> = {};

      formData.forEach((value, key) => {
        if (data[key]) {
          // Handle multiple values (convert to array)
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          data[key] = value;
        }
      });

      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`,
        );
        throw new Error(`Validation errors: ${errors.join(", ")}`);
      }
      throw new Error("Invalid form data");
    }
  };
}

// Team member validation schema
export const TeamMemberSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre requerido")
    .max(100, "Nombre muy largo")
    .transform(sanitizeText)
    .refine(
      (name) => name.length > 0,
      "Nombre no puede estar vacío después de sanitización",
    ),

  title: z
    .string()
    .min(1, "Título/Cargo requerido")
    .max(100, "Título muy largo")
    .transform(sanitizeText),

  description: z
    .string()
    .min(10, "Descripción debe tener al menos 10 caracteres")
    .max(2000, "Descripción muy larga")
    .transform(sanitizeHTML),

  specialties: z
    .array(z.string().min(1).max(100).transform(sanitizeText))
    .min(1, "Al menos una especialidad requerida")
    .max(10, "Máximo 10 especialidades"),

  imageUrl: z
    .string()
    .url("URL de imagen no válida")
    .max(500, "URL de imagen muy larga")
    .optional()
    .or(z.literal("")),

  order: z
    .number()
    .min(0, "Orden debe ser positivo")
    .max(100, "Orden muy alto"),

  isActive: z.boolean(),
});

export type PlanningDocumentInput = z.infer<typeof planningDocumentSchema>;
export type AuthInput = z.infer<typeof authSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type TeamMemberInput = z.infer<typeof TeamMemberSchema>;

/**
 * Role-aware validation utilities
 * Part of Stage 3: Business Logic Unification
 */

import { UserRole } from "@/lib/prisma-compat-types";
export type ExtendedUserRole = UserRole;

/**
 * Get validation schema based on user role
 */
export function getRoleAwareValidation(
  baseSchema: z.ZodSchema,
  userRole: ExtendedUserRole,
  context: "create" | "update" | "delete" = "create",
): z.ZodSchema {
  const schema = baseSchema;

  // Master and Admin users have the most permissive validation
  if (userRole === "MASTER" || userRole === "ADMIN") {
    return schema;
  }

  // Professors have moderate restrictions
  if (userRole === "PROFESOR") {
    // Add additional validation for professors if needed
    return schema;
  }

  // Parent/Centro Consejo users have the most restrictions
  if (userRole === "PARENT") {
    // Add more restrictive validation for parents
    return schema;
  }

  return schema;
}

/**
 * Validate file upload based on user role
 */
export function validateFileUpload(
  file: File,
  userRole: ExtendedUserRole,
  context: "planning" | "meeting" | "team" | "general" = "general",
): { valid: boolean; error?: string } {
  // Base file validation
  const baseValidation = fileUploadSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!baseValidation.success) {
    return {
      valid: false,
      error: baseValidation.error.issues[0]?.message || "Invalid file",
    };
  }

  // Role-based file size limits
  let maxSizeByRole: number;
  switch (userRole) {
    case "MASTER":
    case "ADMIN":
      maxSizeByRole = 50 * 1024 * 1024; // 50MB for masters and admins
      break;
    case "PROFESOR":
      maxSizeByRole = 25 * 1024 * 1024; // 25MB for teachers
      break;
    default:
      maxSizeByRole = 10 * 1024 * 1024; // 10MB for others
  }

  if (file.size > maxSizeByRole) {
    const maxSizeMB = Math.round(maxSizeByRole / (1024 * 1024));
    return {
      valid: false,
      error: `Archivo muy grande. Máximo ${maxSizeMB}MB para tu rol.`,
    };
  }

  // Context-specific validations
  if (
    context === "planning" &&
    userRole !== "MASTER" &&
    userRole !== "ADMIN" &&
    userRole !== "PROFESOR"
  ) {
    return {
      valid: false,
      error: "No tienes permisos para subir archivos de planificación.",
    };
  }

  return { valid: true };
}

/**
 * Validate data access based on role
 */
export function validateDataAccess(
  data: { createdBy?: string; isPublic?: boolean; authorId?: string },
  userRole: ExtendedUserRole,
  userId: string,
  operation: "read" | "write" | "delete" = "read",
): { allowed: boolean; reason?: string } {
  // Masters and Admins can access everything
  if (userRole === "MASTER" || userRole === "ADMIN") {
    return { allowed: true };
  }

  // Public data is readable by everyone
  if (operation === "read" && data.isPublic) {
    return { allowed: true };
  }

  // Users can access their own data
  const ownerId = data.createdBy || data.authorId;
  if (ownerId === userId) {
    return { allowed: true };
  }

  // Professors can read other professors' public content
  if (userRole === "PROFESOR" && operation === "read" && data.isPublic) {
    return { allowed: true };
  }

  // Default deny
  return {
    allowed: false,
    reason: `No tienes permisos para ${operation === "read" ? "ver" : operation === "write" ? "editar" : "eliminar"} este contenido.`,
  };
}

/**
 * RUT validation using módulo 11 algorithm
 */
export const rutValidation = z
  .string()
  .min(1, "El RUT es requerido")
  .refine((rut) => {
    const result = validateRUT(rut);
    return result.valid;
  }, "RUT inválido")
  .transform((rut) => {
    // Normalize and format RUT for storage
    const result = validateRUT(rut);
    return result.normalized || rut;
  });

/**
 * Common validation rules that can be shared across schemas
 */
export const commonValidationRules = {
  email: z.string().email("Email no válido").toLowerCase(),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Teléfono no válido")
    .optional(),
  rut: rutValidation,
  name: z
    .string()
    .min(2, "Nombre muy corto")
    .max(100, "Nombre muy largo")
    .transform(sanitizeText),
  description: z
    .string()
    .min(10, "Descripción muy corta")
    .max(2000, "Descripción muy larga")
    .transform(sanitizeHTML),
  title: z
    .string()
    .min(3, "Título muy corto")
    .max(200, "Título muy largo")
    .transform(sanitizeText),
  url: z
    .string()
    .url("URL no válida")
    .max(500, "URL muy larga")
    .optional()
    .or(z.literal("")),
  date: z.coerce.date(),
  positiveNumber: z.number().min(0, "Debe ser un número positivo"),
  boolean: z.boolean(),
  textContent: z.string().transform(sanitizeText),
  htmlContent: z.string().transform(sanitizeHTML),
};
