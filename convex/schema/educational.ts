import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Educational Core Schema
 *
 * Handles students, courses, academic progress, and educational activities.
 * Compliant with Chilean educational regulations and data protection standards.
 */

/**
 * Students Table - Decreto 67 Compliance
 *
 * Stores student personal and academic information according to Chilean educational standards.
 * Each student belongs to a specific institution and may be enrolled in multiple courses.
 *
 * Relationships:
 * - Belongs to: institutionInfo (1:1)
 * - Has many: courseStudents (1:N enrollment records)
 * - Has many: studentProgressReports (1:N)
 * - Has many: meetings (1:N parent-teacher meetings)
 * - Referenced by: parentProfiles (guardian relationships)
 *
 * @compliance Decreto 67 (Chilean Educational Standards), Ley 19.628 (Personal Data Protection)
 * @security PII data - encrypted storage required
 */
/**
 * Student Records
 *
 * Core student information including enrollment and progress tracking.
 *
 * Relationships:
 * - Belongs to: users (teacherId, parentId)
 * - Belongs to: institutionInfo (N:1)
 * - Has many: classAttendance, studentObservations, classGrades (1:N)
 * - Referenced by: courseStudents (many-to-many with courses)
 */
export const students = defineTable({
  institutionId: v.id("institutionInfo"),
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
  .index("by_institutionId", ["institutionId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_parentId", ["parentId"])
  .index("by_grade", ["grade"])
  .index("by_isActive", ["isActive"]);

/**
 * Courses Table - Decreto 67 Compliance
 *
 * Defines course structures within educational institutions according to Chilean curriculum standards.
 * Each course represents a specific grade, level, and section combination taught by a designated teacher.
 *
 * Relationships:
 * - Belongs to: institutionInfo (1:1)
 * - Belongs to: users (teacher - 1:1)
 * - Has many: courseStudents (1:N enrolled students)
 * - Has many: activities (1:N course activities)
 * - Has many: parentMeetingAttendance (1:N parent meetings)
 * - Referenced by: classContent (daily lesson content)
 *
 * @compliance Decreto 67 (Chilean Educational Standards), Circular N°30 (Class Book Requirements)
 * @curriculum Supports Chilean national curriculum structure (Básica/Media levels)
 */
/**
 * Course/Class Definitions
 *
 * Academic course and class group definitions.
 * Groups students by grade, section, and academic year.
 *
 * Relationships:
 * - Belongs to: users (teacherId)
 * - Belongs to: institutionInfo (N:1)
 * - Has many: courseStudents, classAttendance, classContent (1:N)
 *
 * @compliance Decreto 67 curriculum alignment
 */
export const courses = defineTable({
  institutionId: v.id("institutionInfo"),
  name: v.string(), // e.g., "8vo Básico A", "1ro Medio B"
  level: v.string(), // e.g., "BASICA", "MEDIA"
  grade: v.string(), // e.g., "8vo", "1ro Medio"
  section: v.string(), // e.g., "A", "B", "C"
  academicYear: v.number(), // e.g., 2025
  teacherId: v.id("users"), // Profesor jefe
  subjects: v.array(v.string()), // List of subjects taught in this course
  maxStudents: v.optional(v.number()),
  schedule: v.optional(
    v.array(
      v.object({
        dayOfWeek: v.union(
          v.literal("MONDAY"),
          v.literal("TUESDAY"),
          v.literal("WEDNESDAY"),
          v.literal("THURSDAY"),
          v.literal("FRIDAY"),
          v.literal("SATURDAY"),
          v.literal("SUNDAY"),
        ),
        startTime: v.string(), // HH:MM format
        endTime: v.string(), // HH:MM format
        location: v.optional(v.string()),
        subject: v.optional(v.string()),
      }),
    ),
  ),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_academicYear_active", ["academicYear", "isActive"])
  .index("by_level_grade_active", ["level", "grade", "isActive"])
  .index("by_institution_academicYear", ["institutionId", "academicYear"]);

export const courseStudents = defineTable({
  institutionId: v.id("institutionInfo"),
  courseId: v.id("courses"),
  studentId: v.id("students"),
  enrollmentDate: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_studentId", ["studentId"])
  .index("by_courseId_isActive", ["courseId", "isActive"]);

/**
 * Activities Table - Decreto 67 Compliance
 *
 * Records educational activities, events, and special sessions conducted within courses.
 * Supports various activity types including classes, workshops, excursions, and meetings.
 *
 * Relationships:
 * - Belongs to: institutionInfo (1:1)
 * - Belongs to: users (teacher - 1:1)
 * - Referenced by: curriculumCoverage (OA coverage tracking)
 *
 * @compliance Decreto 67 (Educational Activities Documentation), Circular N°30 (Activity Recording)
 * @categories Supports 6 activity categories: CLASS, EVENT, WORKSHOP, EXCURSION, MEETING, OTHER
 */
export const activities = defineTable({
  institutionId: v.id("institutionInfo"),
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
  .index("by_institutionId", ["institutionId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_scheduledDate", ["scheduledDate"])
  .index("by_institution_type_subject", ["institutionId", "type", "subject"])
  .index("by_grade_scheduledDate", ["grade", "scheduledDate"]);

export const studentProgressReports = defineTable({
  institutionId: v.id("institutionInfo"),
  studentId: v.id("students"),
  reportDate: v.number(),
  subject: v.string(),
  grade: v.string(),
  comments: v.string(),
  score: v.optional(v.float64()),
  teacherId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_studentId", ["studentId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_reportDate", ["reportDate"]);

/**
 * Parent-Teacher Meetings Table - Decreto 67 Compliance
 *
 * Records parent-teacher conferences and meetings as required by Chilean educational regulations.
 * Tracks meeting scheduling, attendance, outcomes, and follow-up actions.
 *
 * Relationships:
 * - Belongs to: institutionInfo (1:1)
 * - Belongs to: users (assignedTo - 1:1)
 * - Belongs to: students (optional - 1:1)
 * - Has many: parentMeetingAttendance (1:N attendance records)
 * - Referenced by: recordCertifications (certification tracking)
 *
 * @compliance Decreto 67 (Parent Communication Requirements), Circular N°30 (Meeting Documentation)
 * @types Supports 5 meeting types: PARENT_TEACHER, FOLLOW_UP, EMERGENCY, IEP_REVIEW, GRADE_CONFERENCE
 */
/**
 * Parent-Teacher Meetings
 *
 * Scheduled meetings between parents, teachers, and administrators.
 * Tracks meeting outcomes and follow-ups.
 *
 * Relationships:
 * - Belongs to: users (assignedTo)
 * - Belongs to: institutionInfo (N:1)
 * - References: students (optional)
 *
 * @compliance Chilean educational regulations for parent-teacher communication
 */
export const meetings = defineTable({
  institutionId: v.id("institutionInfo"),
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
  attachments: v.optional(
    v.union(
      v.object({
        type: v.literal("file"),
        url: v.string(),
        name: v.string(),
        size: v.number(),
        mimeType: v.string(),
      }),
      v.object({
        type: v.literal("link"),
        url: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
      }),
    ),
  ),
  source: v.union(v.literal("STAFF_CREATED"), v.literal("PARENT_REQUESTED")),
  reason: v.optional(v.string()),
  parentRequested: v.boolean(),
  studentId: v.optional(v.id("students")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_assignedTo_status", ["assignedTo", "status"])
  .index("by_studentId", ["studentId"])
  .index("by_scheduledDate_status", ["scheduledDate", "status"])
  .index("by_source_parentRequested", ["source", "parentRequested"]);

export const meetingTemplates = defineTable({
  institutionId: v.id("institutionInfo"),
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
}).index("by_institutionId", ["institutionId"]);

export const parentMeetingAttendance = defineTable({
  institutionId: v.id("institutionInfo"),
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
  .index("by_institutionId", ["institutionId"])
  .index("by_courseId", ["courseId"])
  .index("by_studentId", ["studentId"])
  .index("by_parentId", ["parentId"])
  .index("by_meetingDate", ["meetingDate"])
  .index("by_courseId_meetingDate", ["courseId", "meetingDate"]);

export const extraCurricularActivities = defineTable({
  institutionId: v.id("institutionInfo"),
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
  .index("by_institutionId", ["institutionId"])
  .index("by_instructorId", ["instructorId"])
  .index("by_category", ["category"])
  .index("by_isActive", ["isActive"]);

export const extraCurricularParticipants = defineTable({
  institutionId: v.id("institutionInfo"),
  activityId: v.id("extraCurricularActivities"),
  studentId: v.id("students"),
  courseId: v.id("courses"),
  enrollmentDate: v.number(),
  isActive: v.boolean(),
  attendance: v.optional(
    v.array(
      v.object({
        date: v.number(),
        status: v.union(
          v.literal("PRESENT"),
          v.literal("ABSENT"),
          v.literal("LATE"),
          v.literal("EXCUSED"),
        ),
        notes: v.optional(v.string()),
      }),
    ),
  ),
  performance: v.optional(v.string()), // Performance notes
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_activityId", ["activityId"])
  .index("by_studentId", ["studentId"])
  .index("by_courseId", ["courseId"])
  .index("by_isActive", ["isActive"]);
