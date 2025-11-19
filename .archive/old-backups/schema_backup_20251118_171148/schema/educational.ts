import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Educational Core Schema
 *
 * Handles students, courses, academic progress, and educational activities.
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
  schedule: v.optional(v.any()), // JSON with class schedule
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_teacherId", ["teacherId"])
  .index("by_academicYear", ["academicYear"])
  .index("by_level", ["level"])
  .index("by_grade", ["grade"])
  .index("by_isActive", ["isActive"])
  .index("by_academicYear_grade", ["academicYear", "grade", "isActive"]);

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
  .index("by_type", ["type"])
  .index("by_subject", ["subject"])
  .index("by_grade", ["grade"]);

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
  attachments: v.optional(v.any()), // JSON
  source: v.union(v.literal("STAFF_CREATED"), v.literal("PARENT_REQUESTED")),
  reason: v.optional(v.string()),
  parentRequested: v.boolean(),
  studentId: v.optional(v.id("students")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_assignedTo", ["assignedTo"])
  .index("by_studentId", ["studentId"])
  .index("by_scheduledDate", ["scheduledDate"])
  .index("by_status", ["status"])
  .index("by_source", ["source"])
  .index("by_parentRequested", ["parentRequested"]);

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
  attendance: v.optional(v.any()), // JSON array of attendance records
  performance: v.optional(v.string()), // Performance notes
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_activityId", ["activityId"])
  .index("by_studentId", ["studentId"])
  .index("by_courseId", ["courseId"])
  .index("by_isActive", ["isActive"]);
