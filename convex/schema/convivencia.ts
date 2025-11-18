import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convivencia Escolar (School Coexistence) Schema
 *
 * Implements Chilean school coexistence regulations and disciplinary systems.
 * Tracks behavioral norms, disciplinary cases, corrective measures, and recognitions.
 */

export const convivenciaNormas = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  description: v.string(),
  category: v.union(
    v.literal("VALORES"),
    v.literal("DISCIPLINA"),
    v.literal("APRENDIZAJE"),
    v.literal("RESPONSABILIDAD"),
    v.literal("TECNOLOGIA"),
    v.literal("PARTICIPACION"),
    v.literal("OTRO"),
  ),
  status: v.union(
    v.literal("ACTIVE"),
    v.literal("INACTIVE"),
    v.literal("REVIEW"),
  ),
  examples: v.optional(v.array(v.string())),
  importance: v.union(v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_status", ["status"])
  .index("by_category", ["category"])
  .index("by_institutionId_status", ["institutionId", "status"]);

export const convivenciaDisciplina = defineTable({
  institutionId: v.id("institutionInfo"),
  studentId: v.id("students"),
  courseId: v.id("courses"),
  normaId: v.optional(v.id("convivenciaNormas")),
  date: v.number(),
  description: v.string(),
  severity: v.union(
    v.literal("LEVE"),
    v.literal("GRAVE"),
    v.literal("GRAVISIMA"),
  ),
  medidaId: v.optional(v.id("convivenciaMedidas")),
  status: v.union(
    v.literal("PENDING"),
    v.literal("IN_PROGRESS"),
    v.literal("RESOLVED"),
    v.literal("CLOSED"),
  ),
  actionTaken: v.optional(v.string()),
  notes: v.optional(v.string()),
  reportedBy: v.id("users"),
  assignedTo: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_status", ["status"])
  .index("by_severity", ["severity"])
  .index("by_studentId_date", ["studentId", "date"]);

export const convivenciaMedidas = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  description: v.string(),
  category: v.union(
    v.literal("PREVENTIVA"),
    v.literal("FORMATIVA"),
    v.literal("CORRECTIVA"),
    v.literal("SANCIONADORA"),
    v.literal("APOYO"),
    v.literal("OTRA"),
  ),
  applicableTo: v.union(
    v.literal("LEVE"),
    v.literal("GRAVE"),
    v.literal("GRAVISIMA"),
    v.literal("ALL"),
  ),
  status: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
  criteria: v.optional(v.string()),
  duration: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_status", ["status"])
  .index("by_category", ["category"])
  .index("by_applicableTo", ["applicableTo"]);

export const convivenciaReconocimientos = defineTable({
  institutionId: v.id("institutionInfo"),
  studentId: v.id("students"),
  courseId: v.id("courses"),
  type: v.string(),
  title: v.string(),
  description: v.string(),
  category: v.union(
    v.literal("ACADEMICO"),
    v.literal("COMPORTAMENTO"),
    v.literal("PARTICIPACION"),
    v.literal("SOLIDARIDAD"),
    v.literal("SUPERACION"),
    v.literal("OTRO"),
  ),
  date: v.number(),
  awardedBy: v.id("users"),
  notes: v.optional(v.string()),
  isPublic: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_category", ["category"])
  .index("by_studentId_date", ["studentId", "date"]);

export const convivenciaActasApoderados = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.optional(v.id("courses")),
  meetingDate: v.number(),
  meetingNumber: v.number(),
  title: v.string(),
  content: v.string(),
  attendees: v.array(v.string()),
  topics: v.array(v.string()),
  agreements: v.optional(v.array(v.string())),
  relatedTo: v.optional(
    v.union(
      v.literal("NORMAS"),
      v.literal("DISCIPLINA"),
      v.literal("MEDIDAS"),
      v.literal("RECONOCIMIENTOS"),
      v.literal("GENERAL"),
    ),
  ),
  createdBy: v.id("users"),
  isPublic: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_meetingDate", ["meetingDate"])
  .index("by_relatedTo", ["relatedTo"]);

export const convivenciaActasAlumnos = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.optional(v.id("courses")),
  meetingDate: v.number(),
  meetingNumber: v.number(),
  title: v.string(),
  content: v.string(),
  attendees: v.array(v.string()),
  topics: v.array(v.string()),
  agreements: v.optional(v.array(v.string())),
  relatedTo: v.optional(
    v.union(
      v.literal("NORMAS"),
      v.literal("DISCIPLINA"),
      v.literal("MEDIDAS"),
      v.literal("RECONOCIMIENTOS"),
      v.literal("GENERAL"),
    ),
  ),
  createdBy: v.id("users"),
  isPublic: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_meetingDate", ["meetingDate"])
  .index("by_relatedTo", ["relatedTo"]);
