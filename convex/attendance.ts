/**
 * Class Attendance Management
 * Chilean Educational System - Libro de Clases
 * Handles daily attendance recording and reporting
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  ATTENDANCE_STATUS_VALUES,
  ATTENDANCE_STATUS_SCHEMA,
  type AttendanceStatus,
} from "./constants";
import {
  getAuthenticatedUser,
  validateTeacherRole,
  validateDateNotInFuture,
  now,
  validateEntityOwnership,
} from "./validation";

// ==================== QUERIES ====================

/**
 * Get attendance records for a specific date and course
 */
export const getAttendanceByDate = query({
  args: {
    courseId: v.id("courses"),
    date: v.number(), // Timestamp for the day (start of day)
  },
  handler: async (ctx, { courseId, date }) => {
    // Get all attendance records for this course and date
    const attendanceRecords = await ctx.db
      .query("classAttendance")
      .withIndex("by_courseId_date")
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .filter((q) => q.eq(q.field("date"), date))
      .collect();

    // Get enrolled students for this course
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive")
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Build map of student attendance
    const attendanceMap = new Map<Id<"students">, Id<"classAttendance">>();
    for (const record of attendanceRecords) {
      attendanceMap.set(record.studentId, record._id as Id<"classAttendance">);
    }

    // Return attendance for all enrolled students
    const result = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        const attendanceId = attendanceMap.get(enrollment.studentId);
        const attendance = attendanceId ? await ctx.db.get(attendanceId) : null;

        return {
          studentId: enrollment.studentId,
          student: student,
          attendance: attendance,
          isEnrolled: true,
        };
      }),
    );

    return result.filter((r) => r.student !== null);
  },
});

/**
 * Get attendance for a student within a date range
 */
export const getStudentAttendance = query({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { studentId, courseId, startDate, endDate }) => {
    let records = await ctx.db
      .query("classAttendance")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();

    // Filter by course
    records = records.filter((r) => r.courseId === courseId);

    // Filter by date range if provided
    if (startDate !== undefined) {
      records = records.filter((r) => r.date >= startDate);
    }
    if (endDate !== undefined) {
      records = records.filter((r) => r.date <= endDate);
    }

    // Sort by date descending
    return records.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get a summarized attendance view for a student across all courses
 */
export const getStudentAttendanceSummary = query({
  args: {
    studentId: v.id("students"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { studentId, startDate, endDate }) => {
    let records = await ctx.db
      .query("classAttendance")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();

    if (startDate !== undefined) {
      records = records.filter((r) => r.date >= startDate);
    }

    if (endDate !== undefined) {
      records = records.filter((r) => r.date <= endDate);
    }

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      justified: 0,
      earlyDeparture: 0,
      total: records.length,
    };

    for (const record of records) {
      switch (record.status as AttendanceStatus) {
        case "PRESENTE":
          summary.present += 1;
          break;
        case "AUSENTE":
          summary.absent += 1;
          break;
        case "ATRASADO":
          summary.late += 1;
          break;
        case "JUSTIFICADO":
          summary.justified += 1;
          break;
        case "RETIRADO":
          summary.earlyDeparture += 1;
          break;
        default:
          break;
      }
    }

    const attendanceRate =
      summary.total > 0
        ? ((summary.present + summary.justified) / summary.total) * 100
        : null;

    const lastUpdated = records.length
      ? Math.max(
          ...records.map(
            (record) => record.updatedAt ?? record.createdAt ?? record.date,
          ),
        )
      : null;

    return {
      ...summary,
      attendanceRate,
      lastUpdated,
    };
  },
});

/**
 * Generate attendance report for a course
 */
export const getAttendanceReport = query({
  args: {
    courseId: v.id("courses"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { courseId, startDate, endDate }) => {
    // Get all attendance records in date range
    const allRecords = await ctx.db
      .query("classAttendance")
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .collect();

    const recordsInRange = allRecords.filter(
      (r) => r.date >= startDate && r.date <= endDate,
    );

    // Get enrolled students
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive")
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate attendance stats per student
    const studentStats = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        if (!student) return null;

        const studentRecords = recordsInRange.filter(
          (r) => r.studentId === enrollment.studentId,
        );

        const present = studentRecords.filter(
          (r) => r.status === "PRESENTE",
        ).length;
        const absent = studentRecords.filter(
          (r) => r.status === "AUSENTE",
        ).length;
        const late = studentRecords.filter(
          (r) => r.status === "ATRASADO",
        ).length;
        const justified = studentRecords.filter(
          (r) => r.status === "JUSTIFICADO",
        ).length;
        const earlyDeparture = studentRecords.filter(
          (r) => r.status === "RETIRADO",
        ).length;

        const total = studentRecords.length;
        const attendanceRate =
          total > 0 ? ((present + justified) / total) * 100 : 0;

        return {
          studentId: enrollment.studentId,
          student: {
            firstName: student.firstName,
            lastName: student.lastName,
          },
          present,
          absent,
          late,
          justified,
          earlyDeparture,
          total,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
        };
      }),
    );

    return {
      courseId,
      startDate,
      endDate,
      totalDays: recordsInRange.length,
      students: studentStats.filter((s) => s !== null),
    };
  },
});

// ==================== MUTATIONS ====================

/**
 * Record attendance for multiple students at once
 */
export const recordAttendance = mutation({
  args: {
    courseId: v.id("courses"),
    date: v.number(),
    attendanceRecords: v.array(
      v.object({
        studentId: v.id("students"),
        status: ATTENDANCE_STATUS_SCHEMA,
        subject: v.optional(v.string()),
        period: v.optional(v.string()),
        observation: v.optional(v.string()),
      }),
    ),
    registeredBy: v.id("users"),
  },
  handler: async (ctx, { courseId, date, attendanceRecords, registeredBy }) => {
    // Validate date (cannot be in the future)
    validateDateNotInFuture(date);

    // Validate course exists and get authenticated user
    const user = await getAuthenticatedUser(ctx);
    if (!user.currentInstitutionId) {
      throw new Error("User must be associated with an institution");
    }
    const course = await validateEntityOwnership(
      ctx,
      courseId,
      "Course",
      user.currentInstitutionId,
    );

    // Validate registeredBy is a teacher
    const teacher = await ctx.db.get(registeredBy);
    if (!teacher) {
      throw new Error("Teacher not found");
    }
    validateTeacherRole(teacher);

    const currentTime = now();
    const results = [];

    for (const record of attendanceRecords) {
      // Check if attendance already exists for this student/date
      const existing = await ctx.db
        .query("classAttendance")
        .withIndex("by_studentId_date")
        .filter((q) => q.eq(q.field("studentId"), record.studentId))
        .filter((q) => q.eq(q.field("date"), date))
        .first();

      if (existing) {
        // Update existing record
        await ctx.db.patch(existing._id, {
          status: record.status,
          subject: record.subject,
          period: record.period,
          observation: record.observation,
          registeredBy: registeredBy,
          updatedAt: now(),
        });
        results.push({ studentId: record.studentId, action: "updated" });
      } else {
        // Create new record
        const attendanceId = await ctx.db.insert("classAttendance", {
          institutionId: course.institutionId,
          courseId,
          studentId: record.studentId,
          date,
          status: record.status,
          subject: record.subject,
          period: record.period,
          observation: record.observation,
          registeredBy,
          createdAt: now(),
          updatedAt: now(),
        });
        results.push({ studentId: record.studentId, action: "created" });
      }
    }

    return { success: true, results };
  },
});

/**
 * Update a single attendance record
 */
export const updateAttendanceRecord = mutation({
  args: {
    attendanceId: v.id("classAttendance"),
    status: v.optional(ATTENDANCE_STATUS_SCHEMA),
    subject: v.optional(v.string()),
    period: v.optional(v.string()),
    observation: v.optional(v.string()),
  },
  handler: async (ctx, { attendanceId, ...updates }) => {
    const attendance = await ctx.db.get(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    await ctx.db.patch(attendanceId, {
      ...updates,
      updatedAt: now(),
    });

    return await ctx.db.get(attendanceId);
  },
});

/**
 * Bulk update attendance status for multiple students
 */
export const bulkUpdateAttendance = mutation({
  args: {
    courseId: v.id("courses"),
    date: v.number(),
    studentIds: v.array(v.id("students")),
    status: ATTENDANCE_STATUS_SCHEMA,
    registeredBy: v.id("users"),
  },
  handler: async (
    ctx,
    { courseId, date, studentIds, status, registeredBy },
  ) => {
    const currentTime = now();
    const results = [];

    for (const studentId of studentIds) {
      // Check if record exists
      const existing = await ctx.db
        .query("classAttendance")
        .withIndex("by_studentId_date")
        .filter((q) => q.eq(q.field("studentId"), studentId))
        .filter((q) => q.eq(q.field("date"), date))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          status,
          registeredBy,
          updatedAt: now(),
        });
        results.push({ studentId, action: "updated" });
      } else {
        // Get course to retrieve institutionId
        const course = await ctx.db.get(courseId);
        if (!course) {
          throw new Error("Course not found");
        }
        await ctx.db.insert("classAttendance", {
          institutionId: course.institutionId,
          courseId,
          studentId,
          date,
          status,
          registeredBy,
          createdAt: now(),
          updatedAt: now(),
        });
        results.push({ studentId, action: "created" });
      }
    }

    return { success: true, results };
  },
});
