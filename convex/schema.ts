import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Plataforma Astral Educational Management System
 * Migrated from Prisma schema on 2025-01-07
 */

export default defineSchema({
  // ==================== AUTHENTICATION MODELS ====================

  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
    password: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("MASTER"),
      v.literal("ADMIN"),
      v.literal("PROFESOR"),
      v.literal("PARENT"),
      v.literal("PUBLIC"),
    ),
    isActive: v.boolean(),
    parentRole: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("ACTIVE"),
        v.literal("INACTIVE"),
        v.literal("SUSPENDED"),
      ),
    ),
    provider: v.optional(v.string()),
    isOAuthUser: v.boolean(),
    clerkId: v.optional(v.string()),
    createdByAdmin: v.optional(v.string()),
    institutionId: v.optional(v.id("institutionInfo")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"])
    .index("by_createdByAdmin", ["createdByAdmin"])
    .index("by_institutionId", ["institutionId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_clerkId", ["clerkId"]),

  // ==================== PLANNING & DOCUMENTS ====================

  planningDocuments: defineTable({
    title: v.string(),
    content: v.string(),
    subject: v.string(),
    grade: v.string(),
    authorId: v.id("users"),
    attachments: v.optional(v.any()), // JSON field
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_authorId", ["authorId"])
    .index("by_subject", ["subject"])
    .index("by_grade", ["grade"])
    .index("by_updatedAt", ["updatedAt"]),

  // ==================== INSTITUTION INFORMATION ====================

  institutionInfo: defineTable({
    name: v.string(),
    mission: v.string(),
    vision: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.string(),
    logoUrl: v.optional(v.string()),
    institutionType: v.union(
      v.literal("PRESCHOOL"),
      v.literal("BASIC_SCHOOL"),
      v.literal("HIGH_SCHOOL"),
      v.literal("TECHNICAL_INSTITUTE"),
      v.literal("TECHNICAL_CENTER"),
      v.literal("COLLEGE"),
      v.literal("UNIVERSITY"),
    ),
    supportedLevels: v.optional(v.any()), // JSON array
    customGrades: v.optional(v.any()), // JSON array
    customSubjects: v.optional(v.any()), // JSON array
    educationalConfig: v.optional(v.any()), // JSON object
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_isActive", ["isActive"]),

  // ==================== TEAM MEMBERS ====================

  teamMembers: defineTable({
    name: v.string(),
    title: v.string(),
    description: v.string(),
    specialties: v.any(), // JSON array
    imageUrl: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_isActive", ["isActive"]),

  // ==================== STUDENTS ====================

  students: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.number(),
    grade: v.string(),
    enrollmentDate: v.number(),
    medicalInfo: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    allergies: v.optional(v.string()),
    specialNeeds: v.optional(v.string()),
    attendanceRate: v.optional(v.float64()),
    academicProgress: v.optional(v.float64()),
    teacherId: v.id("users"),
    parentId: v.id("users"),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacherId", ["teacherId"])
    .index("by_parentId", ["parentId"])
    .index("by_grade", ["grade"])
    .index("by_isActive", ["isActive"]),

  // ==================== PARENT PROFILES ====================

  parentProfiles: defineTable({
    userId: v.id("users"),
    rut: v.string(),
    address: v.string(),
    region: v.string(),
    comuna: v.string(),
    relationship: v.string(), // padre, madre, apoderado, tutor, abuelo, otro
    emergencyContact: v.string(),
    emergencyPhone: v.string(),
    registrationComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_rut", ["rut"]),

  // ==================== MEETINGS ====================

  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    studentName: v.string(),
    studentGrade: v.string(),
    guardianName: v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    duration: v.number(),
    location: v.string(),
    status: v.union(
      v.literal("SCHEDULED"),
      v.literal("CONFIRMED"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("CANCELLED"),
      v.literal("RESCHEDULED"),
    ),
    type: v.union(
      v.literal("PARENT_TEACHER"),
      v.literal("FOLLOW_UP"),
      v.literal("EMERGENCY"),
      v.literal("IEP_REVIEW"),
      v.literal("GRADE_CONFERENCE"),
    ),
    assignedTo: v.id("users"),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
    followUpRequired: v.boolean(),
    attachments: v.optional(v.any()), // JSON
    source: v.union(v.literal("STAFF_CREATED"), v.literal("PARENT_REQUESTED")),
    reason: v.optional(v.string()),
    parentRequested: v.boolean(),
    studentId: v.optional(v.id("students")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_assignedTo", ["assignedTo"])
    .index("by_studentId", ["studentId"])
    .index("by_scheduledDate", ["scheduledDate"])
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_parentRequested", ["parentRequested"]),

  meetingTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    type: v.union(
      v.literal("PARENT_TEACHER"),
      v.literal("FOLLOW_UP"),
      v.literal("EMERGENCY"),
      v.literal("IEP_REVIEW"),
      v.literal("GRADE_CONFERENCE"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ==================== CALENDAR EVENTS ====================

  calendarEvents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    category: v.union(
      v.literal("ACADEMIC"),
      v.literal("HOLIDAY"),
      v.literal("SPECIAL"),
      v.literal("PARENT"),
      v.literal("ADMINISTRATIVE"),
      v.literal("EXAM"),
      v.literal("MEETING"),
      v.literal("VACATION"),
      v.literal("EVENT"),
      v.literal("DEADLINE"),
      v.literal("OTHER"),
    ),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    level: v.string(),
    isRecurring: v.boolean(),
    isAllDay: v.boolean(),
    color: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.boolean(),
    attachments: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
    version: v.number(),
    attendeeIds: v.optional(v.array(v.id("users"))), // Many-to-many relation
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_startDate", ["startDate"])
    .index("by_endDate", ["endDate"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_isActive", ["isActive"])
    .index("by_createdBy", ["createdBy"])
    .index("by_isRecurring", ["isRecurring"])
    .index("by_date_category", ["startDate", "endDate", "category", "isActive"])
    .index("by_author_role", ["createdBy", "category", "isActive"])
    .index("by_priority_date", ["priority", "startDate", "isActive"]),

  recurrenceRules: defineTable({
    calendarEventId: v.id("calendarEvents"),
    pattern: v.union(
      v.literal("NONE"),
      v.literal("DAILY"),
      v.literal("WEEKLY"),
      v.literal("MONTHLY"),
      v.literal("YEARLY"),
      v.literal("CUSTOM"),
    ),
    interval: v.number(),
    daysOfWeek: v.string(),
    monthOfYear: v.optional(v.number()),
    weekOfMonth: v.optional(v.number()),
    endDate: v.optional(v.number()),
    occurrences: v.optional(v.number()),
    exceptions: v.string(),
  }).index("by_calendarEventId", ["calendarEventId"]),

  calendarEventTemplates: defineTable({
    name: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("ACADEMIC"),
      v.literal("HOLIDAY"),
      v.literal("SPECIAL"),
      v.literal("PARENT"),
      v.literal("ADMINISTRATIVE"),
      v.literal("EXAM"),
      v.literal("MEETING"),
      v.literal("VACATION"),
      v.literal("EVENT"),
      v.literal("DEADLINE"),
      v.literal("OTHER"),
    ),
    level: v.string(),
    color: v.optional(v.string()),
    duration: v.number(),
    isAllDay: v.boolean(),
    recurrence: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_createdBy", ["createdBy"]),

  // ==================== MEDIA ====================

  photos: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.string(),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uploadedBy", ["uploadedBy"])
    .index("by_createdAt", ["createdAt"]),

  videos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    thumbnail: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.any()), // JSON array
    isPublic: v.boolean(),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uploadedBy", ["uploadedBy"])
    .index("by_category", ["category"])
    .index("by_isPublic", ["isPublic"]),

  videoCapsules: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  // ==================== VOTING SYSTEM ====================

  votes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("GENERAL"),
      v.literal("ACADEMIC"),
      v.literal("ADMINISTRATIVE"),
      v.literal("SOCIAL"),
      v.literal("FINANCIAL"),
      v.literal("INFRASTRUCTURE"),
      v.literal("CURRICULUM"),
      v.literal("EVENTS"),
      v.literal("POLICIES"),
      v.literal("OTHER"),
    ),
    endDate: v.number(),
    isActive: v.boolean(),
    isPublic: v.boolean(),
    allowMultipleVotes: v.boolean(),
    maxVotesPerUser: v.optional(v.number()),
    requireAuthentication: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"])
    .index("by_endDate", ["endDate"]),

  voteOptions: defineTable({
    text: v.string(),
    voteId: v.id("votes"),
    createdAt: v.number(),
  }).index("by_voteId", ["voteId"]),

  voteResponses: defineTable({
    voteId: v.id("votes"),
    optionId: v.id("voteOptions"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_voteId", ["voteId"])
    .index("by_optionId", ["optionId"])
    .index("by_userId", ["userId"])
    .index("by_voteId_userId", ["voteId", "userId"]),

  // ==================== STUDENT PROGRESS ====================

  studentProgressReports: defineTable({
    studentId: v.id("students"),
    reportDate: v.number(),
    subject: v.string(),
    grade: v.string(),
    comments: v.string(),
    score: v.optional(v.float64()),
    teacherId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_studentId", ["studentId"])
    .index("by_teacherId", ["teacherId"])
    .index("by_reportDate", ["reportDate"]),

  // ==================== ACTIVITIES ====================

  activities: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("CLASS"),
      v.literal("EVENT"),
      v.literal("WORKSHOP"),
      v.literal("EXCURSION"),
      v.literal("MEETING"),
      v.literal("OTHER"),
    ),
    subject: v.string(),
    grade: v.string(),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    duration: v.number(),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    materials: v.optional(v.string()),
    objectives: v.optional(v.string()),
    notes: v.optional(v.string()),
    teacherId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacherId", ["teacherId"])
    .index("by_scheduledDate", ["scheduledDate"])
    .index("by_type", ["type"])
    .index("by_subject", ["subject"])
    .index("by_grade", ["grade"]),

  // ==================== NOTIFICATIONS ====================

  // ==================== DOCUMENT STORAGE ====================

  documents: defineTable({
    name: v.string(),
    originalName: v.string(),
    fileId: v.id("_storage"),
    type: v.string(), // "pdf", "document", etc.
    category: v.string(), // "reglamento", "plan", "manual", "protocolo", etc.
    number: v.optional(v.number()), // for numbered documents
    size: v.number(),
    mimeType: v.string(),
    uploadedBy: v.id("users"),
    isPublic: v.boolean(), // public access or role-based
    downloadCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_uploadedBy", ["uploadedBy"])
    .index("by_isPublic", ["isPublic"])
    .index("by_createdAt", ["createdAt"]),

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("INFO"),
      v.literal("SUCCESS"),
      v.literal("WARNING"),
      v.literal("ERROR"),
      v.literal("SYSTEM"),
    ),
    category: v.optional(
      v.union(
        v.literal("MEETING"),
        v.literal("VOTING"),
        v.literal("SYSTEM"),
        v.literal("ACADEMIC"),
        v.literal("ADMINISTRATIVE"),
        v.literal("PERSONAL"),
      ),
    ),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    actionUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    senderId: v.id("users"),
    recipientId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_recipientId", ["recipientId"])
    .index("by_read", ["read"])
    .index("by_createdAt", ["createdAt"])
    .index("by_expiresAt", ["expiresAt"])
    .index("by_recipientId_read", ["recipientId", "read"]),

  // ==================== LIBRO DE CLASES (Chilean Class Book) ====================

  // Cursos/Clases - Class/Course definitions
  courses: defineTable({
    name: v.string(), // e.g., "8vo Básico A", "1ro Medio B"
    level: v.string(), // e.g., "BASICA", "MEDIA"
    grade: v.string(), // e.g., "8vo", "1ro Medio"
    section: v.string(), // e.g., "A", "B", "C"
    academicYear: v.number(), // e.g., 2025
    teacherId: v.id("users"), // Profesor jefe
    subjects: v.array(v.string()), // List of subjects taught in this course
    maxStudents: v.optional(v.number()),
    schedule: v.optional(v.any()), // JSON with class schedule
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacherId", ["teacherId"])
    .index("by_academicYear", ["academicYear"])
    .index("by_level", ["level"])
    .index("by_grade", ["grade"])
    .index("by_isActive", ["isActive"])
    .index("by_academicYear_grade", ["academicYear", "grade", "isActive"]),

  // Estudiantes en Cursos - Student enrollment in courses
  courseStudents: defineTable({
    courseId: v.id("courses"),
    studentId: v.id("students"),
    enrollmentDate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_studentId", ["studentId"])
    .index("by_courseId_isActive", ["courseId", "isActive"]),

  // Asistencia Diaria - Daily attendance records
  classAttendance: defineTable({
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
    .index("by_courseId", ["courseId"])
    .index("by_studentId", ["studentId"])
    .index("by_date", ["date"])
    .index("by_courseId_date", ["courseId", "date"])
    .index("by_studentId_date", ["studentId", "date"]),

  // Registro de Contenidos y Objetivos - Daily lesson content
  classContent: defineTable({
    courseId: v.id("courses"),
    date: v.number(),
    subject: v.string(), // Subject/Asignatura
    topic: v.string(), // Topic/Tema
    objectives: v.string(), // Learning objectives
    content: v.string(), // Content taught
    activities: v.optional(v.string()), // Activities performed
    resources: v.optional(v.string()), // Materials/resources used
    homework: v.optional(v.string()), // Homework assigned
    period: v.optional(v.string()), // Class period
    teacherId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_teacherId", ["teacherId"])
    .index("by_date", ["date"])
    .index("by_subject", ["subject"])
    .index("by_courseId_date", ["courseId", "date"]),

  // Observaciones del Estudiante - Student behavioral observations (Chilean standard)
  studentObservations: defineTable({
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
    .index("by_studentId", ["studentId"])
    .index("by_courseId", ["courseId"])
    .index("by_teacherId", ["teacherId"])
    .index("by_date", ["date"])
    .index("by_type", ["type"])
    .index("by_studentId_date", ["studentId", "date"]),

  // Registro de Evaluaciones - Grades/evaluation records
  classGrades: defineTable({
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
    .index("by_studentId", ["studentId"])
    .index("by_courseId", ["courseId"])
    .index("by_subject", ["subject"])
    .index("by_date", ["date"])
    .index("by_studentId_subject", ["studentId", "subject"]),

  // Asistencia a Reuniones de Apoderados - Parent meeting attendance
  parentMeetingAttendance: defineTable({
    courseId: v.id("courses"),
    studentId: v.id("students"),
    parentId: v.id("users"),
    meetingDate: v.number(),
    meetingNumber: v.number(), // Meeting number (1st, 2nd, 3rd, etc. of the year)
    attended: v.boolean(),
    representativeName: v.optional(v.string()), // Name of person who attended
    relationship: v.optional(v.string()), // Relationship to student
    signature: v.optional(v.string()), // Digital signature/confirmation
    observations: v.optional(v.string()),
    agreements: v.optional(v.string()), // Agreements made in the meeting
    registeredBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_studentId", ["studentId"])
    .index("by_parentId", ["parentId"])
    .index("by_meetingDate", ["meetingDate"])
    .index("by_courseId_meetingDate", ["courseId", "meetingDate"]),

  // Actividades Extra-programáticas - Extra-curricular activities
  extraCurricularActivities: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("DEPORTIVA"), // Sports
      v.literal("ARTISTICA"), // Arts
      v.literal("CULTURAL"), // Cultural
      v.literal("CIENTIFICA"), // Scientific
      v.literal("SOCIAL"), // Social
      v.literal("ACADEMICA"), // Academic
      v.literal("OTRA"), // Other
    ),
    schedule: v.optional(v.string()), // Activity schedule
    instructorId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_instructorId", ["instructorId"])
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"]),

  // Participación en Actividades Extra-programáticas
  extraCurricularParticipants: defineTable({
    activityId: v.id("extraCurricularActivities"),
    studentId: v.id("students"),
    courseId: v.id("courses"),
    enrollmentDate: v.number(),
    isActive: v.boolean(),
    attendance: v.optional(v.any()), // JSON array of attendance records
    performance: v.optional(v.string()), // Performance notes
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_activityId", ["activityId"])
    .index("by_studentId", ["studentId"])
    .index("by_courseId", ["courseId"])
    .index("by_isActive", ["isActive"]),
});
