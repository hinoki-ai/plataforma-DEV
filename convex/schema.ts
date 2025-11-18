import { defineSchema } from "convex/server";
import { schemaObject } from "./schema/index";

/**
 * Convex Schema for Plataforma Astral Educational Management System
 *
 * This schema has been modularized for better maintainability.
 * All table definitions are organized by domain in the ./schema/ directory.
 *
 * Total tables: 45
 * Total indexes: 212 (avg ~4.7 per table)
 * Total lines: Reduced from 1236 to ~20 lines in main file
 *
 * @see ./schema/ for domain-specific schema definitions
 */

export default defineSchema(schemaObject);
