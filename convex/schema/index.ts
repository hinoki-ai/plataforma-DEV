/**
 * Convex Schema Index
 *
 * Centralized export of all schema modules for the Plataforma Astral
 * Educational Management System.
 *
 * This file aggregates all domain-specific schema definitions into a single
 * export for use in the main schema.ts file.
 */

// Authentication and User Management
import * as authSchema from "./auth";
export * from "./auth";

// Institution and Team Management
import * as institutionSchema from "./institution";
export * from "./institution";

// Educational Core (Students, Courses, Activities)
import * as educationalSchema from "./educational";
export * from "./educational";

// Libro de Clases (Chilean Class Book)
import * as libroClasesSchema from "./libro_clases";
export * from "./libro_clases";

// Convivencia Escolar (School Coexistence)
import * as convivenciaSchema from "./convivencia";
export * from "./convivencia";

// Planning and Calendar
import * as planningSchema from "./planning";
export * from "./planning";

// Media and Communication
import * as mediaSchema from "./media";
export * from "./media";

// AI Assistant
import * as aiSchema from "./ai";
export * from "./ai";

// Export combined schema object for use in defineSchema
export const schemaObject = {
  ...authSchema,
  ...institutionSchema,
  ...educationalSchema,
  ...libroClasesSchema,
  ...convivenciaSchema,
  ...planningSchema,
  ...mediaSchema,
  ...aiSchema,
};
