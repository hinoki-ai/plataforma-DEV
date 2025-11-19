import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Libro de Clases (Chilean Class Book) Schema
 *
 * Implements the official Chilean educational record-keeping system.
 * Compliant with Decreto 67 and Circular N°30 digital signature requirements.
 */

export const classAttendance = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.id("courses"),
  studentId: v.id("students"),
  date: v.number(), // Timestamp of the day
  status: v.union(
    v.literal("PRESENTE"), // Present
    v.literal("AUSENTE"), // Absent
    v.literal("ATRASADO"), // Late
    v.literal("JUSTIFICADO"), // Justified absence
    v.literal("RETIRADO"), // Early departure
  ),
  subject: v.optional(v.string()), // Optional: specific subject
  period: v.optional(v.string()), // Optional: class period (1st, 2nd, etc.)
  observation: v.optional(v.string()), // Notes about attendance
  registeredBy: v.id("users"), // Teacher who registered
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_studentId", ["studentId"])
  .index("by_date", ["date"])
  .index("by_courseId_date", ["courseId", "date"])
  .index("by_studentId_date", ["studentId", "date"]);

export const learningObjectives = defineTable({
  institutionId: v.id("institutionInfo"),
  code: v.string(), // OA code (e.g., "OA01", "OA02")
  subject: v.string(), // Subject/Asignatura
  level: v.string(), // Educational level (BASICA, MEDIA)
  grade: v.string(), // Grade level (e.g., "1ro", "2do", "3ro Medio")
  description: v.string(), // Full description of the OA
  unit: v.optional(v.string()), // Curriculum unit
  semester: v.union(
    v.literal("PRIMER_SEMESTRE"),
    v.literal("SEGUNDO_SEMESTRE"),
    v.literal("ANUAL"),
  ),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_subject", ["subject"])
  .index("by_level", ["level"])
  .index("by_grade", ["grade"])
  .index("by_subject_level", ["subject", "level", "grade"])
  .index("by_code", ["code"])
  .index("by_isActive", ["isActive"]);

export const evaluationIndicators = defineTable({
  institutionId: v.id("institutionInfo"),
  learningObjectiveId: v.id("learningObjectives"),
  code: v.string(), // Indicator code (e.g., "IE01")
  description: v.string(), // Description of the indicator
  evaluationCriteria: v.optional(v.string()), // Evaluation criteria
  level: v.union(
    v.literal("INICIAL"), // Initial level
    v.literal("BASICO"), // Basic level
    v.literal("INTERMEDIO"), // Intermediate level
    v.literal("AVANZADO"), // Advanced level
  ),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_learningObjectiveId", ["learningObjectiveId"])
  .index("by_code", ["code"])
  .index("by_level", ["level"])
  .index("by_isActive", ["isActive"]);

export const classContentOA = defineTable({
  institutionId: v.id("institutionInfo"),
  classContentId: v.id("classContent"),
  learningObjectiveId: v.id("learningObjectives"),
  evaluationIndicatorIds: v.optional(v.array(v.id("evaluationIndicators"))), // Linked indicators
  coverage: v.optional(
    v.union(
      v.literal("PARCIAL"), // Partial coverage
      v.literal("COMPLETA"), // Complete coverage
    ),
  ), // Coverage level of the OA in this class
  createdAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_classContentId", ["classContentId"])
  .index("by_learningObjectiveId", ["learningObjectiveId"]);

export const curriculumCoverage = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.id("courses"),
  subject: v.string(),
  learningObjectiveId: v.id("learningObjectives"),
  firstCoveredDate: v.optional(v.number()), // First time this OA was covered
  lastCoveredDate: v.optional(v.number()), // Last time this OA was covered
  timesCovered: v.number(), // Number of times this OA has been covered
  coverageStatus: v.union(
    v.literal("NO_INICIADO"), // Not started
    v.literal("EN_PROGRESO"), // In progress
    v.literal("CUBIERTO"), // Covered
    v.literal("REFORZADO"), // Reinforced
  ),
  period: v.union(
    v.literal("PRIMER_SEMESTRE"),
    v.literal("SEGUNDO_SEMESTRE"),
    v.literal("ANUAL"),
  ),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_subject", ["subject"])
  .index("by_learningObjectiveId", ["learningObjectiveId"])
  .index("by_coverageStatus", ["coverageStatus"])
  .index("by_courseId_subject", ["courseId", "subject"]);

export const digitalSignatures = defineTable({
  institutionId: v.id("institutionInfo"),
  recordType: v.union(
    v.literal("CLASS_CONTENT"),
    v.literal("ATTENDANCE"),
    v.literal("OBSERVATION"),
    v.literal("GRADE"),
    v.literal("MEETING"),
    v.literal("PARENT_MEETING"),
  ),
  recordId: v.string(), // ID of the signed record (can be classContent._id, etc.)
  signedBy: v.id("users"), // User who signed
  signatureData: v.string(), // Signature data (hash, biometric, or digital signature)
  signatureMethod: v.union(
    v.literal("ELECTRONIC"), // Electronic signature
    v.literal("BIOMETRIC"), // Biometric signature
    v.literal("DIGITAL_CERTIFICATE"), // Digital certificate
  ),
  ipAddress: v.optional(v.string()), // IP address when signed
  userAgent: v.optional(v.string()), // Browser/user agent
  isCertified: v.boolean(), // Whether the signature is certified/validated
  certifiedBy: v.optional(v.id("users")), // Admin who certified the signature
  certifiedAt: v.optional(v.number()), // When it was certified
  notes: v.optional(v.string()), // Additional notes
  createdAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_recordType_recordId", ["recordType", "recordId"])
  .index("by_signedBy", ["signedBy"])
  .index("by_isCertified", ["isCertified"])
  .index("by_createdAt", ["createdAt"]);

export const recordCertifications = defineTable({
  institutionId: v.id("institutionInfo"),
  recordType: v.union(
    v.literal("CLASS_CONTENT"),
    v.literal("ATTENDANCE"),
    v.literal("OBSERVATION"),
    v.literal("GRADE"),
    v.literal("MEETING"),
    v.literal("PARENT_MEETING"),
    v.literal("PERIOD"), // Period closure certification
  ),
  recordId: v.string(), // ID of the certified record
  period: v.optional(
    v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
  ),
  certifiedBy: v.id("users"), // Admin/Director who certified
  certificationDate: v.number(), // When it was certified
  certificationType: v.union(
    v.literal("DAILY"), // Daily certification
    v.literal("WEEKLY"), // Weekly certification
    v.literal("MONTHLY"), // Monthly certification
    v.literal("PERIOD_CLOSURE"), // Period closure certification
  ),
  status: v.union(
    v.literal("PENDING"), // Pending certification
    v.literal("CERTIFIED"), // Certified
    v.literal("REJECTED"), // Rejected
  ),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_recordType_recordId", ["recordType", "recordId"])
  .index("by_certifiedBy", ["certifiedBy"])
  .index("by_status", ["status"])
  .index("by_period", ["period"])
  .index("by_certificationDate", ["certificationDate"]);

export const recordLocks = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.id("courses"),
  period: v.union(
    v.literal("PRIMER_SEMESTRE"),
    v.literal("SEGUNDO_SEMESTRE"),
    v.literal("ANUAL"),
  ),
  recordType: v.union(
    v.literal("ATTENDANCE"),
    v.literal("GRADE"),
    v.literal("CLASS_CONTENT"),
    v.literal("ALL"), // All record types
  ),
  lockedBy: v.id("users"), // Admin/Director who locked
  lockedAt: v.number(), // When it was locked
  reason: v.optional(v.string()), // Reason for locking
  isLocked: v.boolean(), // Whether it's currently locked
  unlockedBy: v.optional(v.id("users")), // Who unlocked it (if applicable)
  unlockedAt: v.optional(v.number()), // When it was unlocked
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_period", ["period"])
  .index("by_isLocked", ["isLocked"])
  .index("by_courseId_period", ["courseId", "period"]);

export const classContent = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.id("courses"),
  date: v.number(),
  subject: v.string(), // Subject/Asignatura
  topic: v.string(), // Topic/Tema
  objectives: v.string(), // Learning objectives (text field, kept for compatibility)
  content: v.string(), // Content taught
  activities: v.optional(v.string()), // Activities performed
  resources: v.optional(v.string()), // Materials/resources used
  homework: v.optional(v.string()), // Homework assigned
  period: v.optional(v.string()), // Class period
  teacherId: v.id("users"),
  isSigned: v.boolean(), // Whether teacher has signed this entry
  signedAt: v.optional(v.number()), // When it was signed
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_date", ["date"])
  .index("by_subject", ["subject"])
  .index("by_courseId_date", ["courseId", "date"])
  .index("by_isSigned", ["isSigned"]);

export const studentObservations = defineTable({
  institutionId: v.id("institutionInfo"),
  studentId: v.id("students"),
  courseId: v.id("courses"),
  date: v.number(),
  type: v.union(
    v.literal("POSITIVA"), // Positive observation
    v.literal("NEGATIVA"), // Negative observation
    v.literal("NEUTRA"), // Neutral observation
  ),
  category: v.union(
    v.literal("COMPORTAMIENTO"), // Behavior
    v.literal("RENDIMIENTO"), // Academic performance
    v.literal("ASISTENCIA"), // Attendance
    v.literal("PARTICIPACION"), // Participation
    v.literal("RESPONSABILIDAD"), // Responsibility
    v.literal("CONVIVENCIA"), // Coexistence
    v.literal("OTRO"), // Other
  ),
  observation: v.string(), // The observation text
  subject: v.optional(v.string()), // Related subject if applicable
  severity: v.optional(
    v.union(v.literal("LEVE"), v.literal("GRAVE"), v.literal("GRAVISIMA")),
  ), // For negative observations
  actionTaken: v.optional(v.string()), // Actions taken
  notifyParent: v.boolean(), // Whether to notify parent
  parentNotified: v.boolean(), // Whether parent was notified
  parentSignature: v.optional(v.string()), // Parent acknowledgment
  teacherId: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_studentId", ["studentId"])
  .index("by_courseId", ["courseId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_date", ["date"])
  .index("by_type", ["type"])
  .index("by_studentId_date", ["studentId", "date"]);

export const classGrades = defineTable({
  institutionId: v.id("institutionInfo"),
  studentId: v.id("students"),
  courseId: v.id("courses"),
  subject: v.string(),
  evaluationType: v.union(
    v.literal("PRUEBA"), // Test
    v.literal("TRABAJO"), // Assignment
    v.literal("EXAMEN"), // Exam
    v.literal("PRESENTACION"), // Presentation
    v.literal("PROYECTO"), // Project
    v.literal("TAREA"), // Homework
    v.literal("PARTICIPACION"), // Participation
    v.literal("OTRO"), // Other
  ),
  evaluationName: v.string(), // Name of the evaluation
  date: v.number(),
  grade: v.float64(), // Grade (1.0 - 7.0 in Chile)
  maxGrade: v.float64(), // Maximum possible grade
  percentage: v.optional(v.float64()), // Percentage weight
  comments: v.optional(v.string()),
  period: v.union(
    v.literal("PRIMER_SEMESTRE"),
    v.literal("SEGUNDO_SEMESTRE"),
    v.literal("ANUAL"),
  ),
  teacherId: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_studentId", ["studentId"])
  .index("by_courseId", ["courseId"])
  .index("by_subject", ["subject"])
  .index("by_date", ["date"])
  .index("by_studentId_subject", ["studentId", "subject"]);
