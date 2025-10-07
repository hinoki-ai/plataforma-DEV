// Application-wide constants
export const APP_NAME = "Manitos Pintadas";
export const APP_DESCRIPTION =
  "Sistema de gestión y comunicación para Manitos Pintadas";

// User roles
export const USER_ROLES = {
  MASTER: "master",
  ADMIN: "admin",
  PROFESOR: "profesor",
  PARENT: "parent",
  PUBLIC: "public",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Navigation routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN: "/admin",
  PROFESOR: "/profesor",
  PUBLIC: {
    EQUIPO_MULTIDISCIPLINARIO: "/public/equipo-multidisciplinario",
  },
} as const;

// Educational subjects for planning documents - LEGACY
// For new implementations, use getSubjectsForCurrentInstitution() from educational-system.ts
export const SUBJECTS = [
  "Lenguaje y Comunicación",
  "Matemáticas",
  "Historia, Geografía y Ciencias Sociales",
  "Ciencias Naturales",
  "Inglés",
  "Educación Física",
  "Artes Visuales",
  "Música",
  "Tecnología",
  "Orientación",
  "Religión",
] as const;

// Chilean educational grades - LEGACY for Basic School
// For new implementations, use getGradesForCurrentInstitution() from educational-system.ts
export const GRADES = [
  "1° Básico",
  "2° Básico",
  "3° Básico",
  "4° Básico",
  "5° Básico",
  "6° Básico",
  "7° Básico",
  "8° Básico",
] as const;

// Meeting status labels
export const MEETING_STATUS_LABELS = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
} as const;

// Form validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
} as const;

export const SCHOOL_CONFIG = {
  RBD: process.env.SCHOOL_RBD || "XXXXXXX",
  PHONE: process.env.SCHOOL_PHONE || "+569XXXXXXXX",
  EMAIL: process.env.SCHOOL_EMAIL || "contacto@manitospintadas.cl",
  ADDRESS: process.env.SCHOOL_ADDRESS || "Dirección de la escuela",
  WEBSITE: process.env.SCHOOL_WEBSITE || "https://manitospintadas.cl",
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  MAX_FILES: 3,
} as const;

export const AUTH_CONFIG = {
  MAGIC_LINK_EXPIRY: 15 * 60 * 1000, // 15 minutes
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
} as const;
