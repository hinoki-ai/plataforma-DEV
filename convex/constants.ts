/**
 * Shared constants and types for Convex functions
 * Chilean Educational System - Common values and enums
 */

import { v } from "convex/values";

// ==================== ATTENDANCE STATUS ====================

export const ATTENDANCE_STATUS_VALUES = [
  "PRESENTE",
  "AUSENTE",
  "ATRASADO",
  "JUSTIFICADO",
  "RETIRADO",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS_VALUES)[number];

export const ATTENDANCE_STATUS_SCHEMA = v.union(
  v.literal("PRESENTE"),
  v.literal("AUSENTE"),
  v.literal("ATRASADO"),
  v.literal("JUSTIFICADO"),
  v.literal("RETIRADO"),
);

// ==================== EXTRA-CURRICULAR CATEGORIES ====================

export const EXTRA_CURRICULAR_CATEGORIES = [
  "DEPORTIVA",
  "ARTISTICA",
  "CULTURAL",
  "CIENTIFICA",
  "SOCIAL",
  "ACADEMICA",
  "OTRA",
] as const;

export type ExtraCurricularCategory =
  (typeof EXTRA_CURRICULAR_CATEGORIES)[number];

export const EXTRA_CURRICULAR_CATEGORY_SCHEMA = v.union(
  v.literal("DEPORTIVA"),
  v.literal("ARTISTICA"),
  v.literal("CULTURAL"),
  v.literal("CIENTIFICA"),
  v.literal("SOCIAL"),
  v.literal("ACADEMICA"),
  v.literal("OTRA"),
);

// ==================== SEMESTER PERIODS ====================

export const SEMESTER_VALUES = [
  "PRIMER_SEMESTRE",
  "SEGUNDO_SEMESTRE",
  "ANUAL",
] as const;

export type Semester = (typeof SEMESTER_VALUES)[number];

export const SEMESTER_SCHEMA = v.union(
  v.literal("PRIMER_SEMESTRE"),
  v.literal("SEGUNDO_SEMESTRE"),
  v.literal("ANUAL"),
);

// ==================== EVALUATION LEVELS ====================

export const EVALUATION_LEVELS = [
  "INICIAL",
  "BASICO",
  "INTERMEDIO",
  "AVANZADO",
] as const;

export type EvaluationLevel = (typeof EVALUATION_LEVELS)[number];

export const EVALUATION_LEVEL_SCHEMA = v.union(
  v.literal("INICIAL"),
  v.literal("BASICO"),
  v.literal("INTERMEDIO"),
  v.literal("AVANZADO"),
);

// ==================== COVERAGE STATUS ====================

export const COVERAGE_STATUS_VALUES = [
  "NO_INICIADO",
  "EN_PROGRESO",
  "CUBIERTO",
  "REFORZADO",
] as const;

export type CoverageStatus = (typeof COVERAGE_STATUS_VALUES)[number];

export const COVERAGE_STATUS_SCHEMA = v.union(
  v.literal("NO_INICIADO"),
  v.literal("EN_PROGRESO"),
  v.literal("CUBIERTO"),
  v.literal("REFORZADO"),
);

// ==================== COVERAGE TYPES ====================

export const COVERAGE_TYPES = ["PARCIAL", "COMPLETA"] as const;

export type CoverageType = (typeof COVERAGE_TYPES)[number];

export const COVERAGE_TYPE_SCHEMA = v.union(
  v.literal("PARCIAL"),
  v.literal("COMPLETA"),
);

// ==================== MEETING TYPES ====================

export const MEETING_TYPES = [
  "PARENT_TEACHER",
  "FOLLOW_UP",
  "EMERGENCY",
  "IEP_REVIEW",
  "GRADE_CONFERENCE",
] as const;

export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_TYPE_SCHEMA = v.union(
  v.literal("PARENT_TEACHER"),
  v.literal("FOLLOW_UP"),
  v.literal("EMERGENCY"),
  v.literal("IEP_REVIEW"),
  v.literal("GRADE_CONFERENCE"),
);

// ==================== OBSERVATION TYPES ====================

export const OBSERVATION_TYPES = ["POSITIVA", "NEGATIVA", "NEUTRA"] as const;

export type ObservationType = (typeof OBSERVATION_TYPES)[number];

export const OBSERVATION_TYPE_SCHEMA = v.union(
  v.literal("POSITIVA"),
  v.literal("NEGATIVA"),
  v.literal("NEUTRA"),
);

// ==================== OBSERVATION CATEGORIES ====================

export const OBSERVATION_CATEGORIES = [
  "COMPORTAMIENTO",
  "RENDIMIENTO",
  "ASISTENCIA",
  "PARTICIPACION",
  "RESPONSABILIDAD",
  "CONVIVENCIA",
  "OTRA",
] as const;

export type ObservationCategory = (typeof OBSERVATION_CATEGORIES)[number];

export const OBSERVATION_CATEGORY_SCHEMA = v.union(
  v.literal("COMPORTAMIENTO"),
  v.literal("RENDIMIENTO"),
  v.literal("ASISTENCIA"),
  v.literal("PARTICIPACION"),
  v.literal("RESPONSABILIDAD"),
  v.literal("CONVIVENCIA"),
  v.literal("OTRA"),
);
