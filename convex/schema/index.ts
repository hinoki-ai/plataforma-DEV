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
export * from "./auth";

// Institution and Team Management
export * from "./institution";

// Educational Core (Students, Courses, Activities)
export * from "./educational";

// Libro de Clases (Chilean Class Book)
export * from "./libro_clases";

// Convivencia Escolar (School Coexistence)
export * from "./convivencia";

// Planning and Calendar
export * from "./planning";

// Media and Communication
export * from "./media";
