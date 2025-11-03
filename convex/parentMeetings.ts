/**
 * Parent Meeting Attendance Management
 * Chilean Educational System - Libro de Clases
 * Handles tracking of parent attendance at official parent meetings
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

/**
 * Get attendance records for a parent meeting
 */
export const getMeetingAttendance = query({
  args: {
    courseId: v.id("courses"),
    meetingDate: v.number(),
  },
  handler: async (ctx, { courseId, meetingDate }) => {
    const attendanceRecords = await ctx.db
      .query("parentMeetingAttendance")
      .withIndex("by_courseId_meetingDate", (q) =>
        q.eq("courseId", courseId).eq("meetingDate", meetingDate),
      )
      .collect();

    // Get full details for each record
    const recordsWithDetails = await Promise.all(
      attendanceRecords.map(async (record) => {
        const student = await ctx.db.get(record.studentId);
        const parent = await ctx.db.get(record.parentId);
        const registeredBy = await ctx.db.get(record.registeredBy);
        return {
          ...record,
          student: student,
          parent: parent,
          registeredBy: registeredBy,
        };
      }),
    );

    return recordsWithDetails.filter((r) => r.student !== null);
  },
});

/**
 * Get all parent meeting attendance for a course
 */
export const getCourseMeetingAttendance = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, { courseId }) => {
    const attendanceRecords = await ctx.db
      .query("parentMeetingAttendance")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Get full details
    const recordsWithDetails = await Promise.all(
      attendanceRecords.map(async (record) => {
        const student = await ctx.db.get(record.studentId);
        const parent = await ctx.db.get(record.parentId);
        const registeredBy = await ctx.db.get(record.registeredBy);
        return {
          ...record,
          student: student,
          parent: parent,
          registeredBy: registeredBy,
        };
      }),
    );

    // Sort by meeting date descending
    return recordsWithDetails
      .filter((r) => r.student !== null)
      .sort((a, b) => b.meetingDate - a.meetingDate);
  },
});

/**
 * Get parent meeting attendance for a specific student
 */
export const getStudentMeetingAttendance = query({
  args: {
    studentId: v.id("students"),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, { studentId, courseId }) => {
    let attendanceRecords = await ctx.db
      .query("parentMeetingAttendance")
      .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
      .collect();

    // Filter by course if provided
    if (courseId) {
      attendanceRecords = attendanceRecords.filter(
        (r) => r.courseId === courseId,
      );
    }

    // Get full details
    const recordsWithDetails = await Promise.all(
      attendanceRecords.map(async (record) => {
        const parent = await ctx.db.get(record.parentId);
        const course = await ctx.db.get(record.courseId);
        const registeredBy = await ctx.db.get(record.registeredBy);
        return {
          ...record,
          parent: parent,
          course: course,
          registeredBy: registeredBy,
        };
      }),
    );

    // Sort by meeting date descending
    return recordsWithDetails.sort((a, b) => b.meetingDate - a.meetingDate);
  },
});

/**
 * Get agreements from parent meetings
 */
export const getMeetingAgreements = query({
  args: {
    courseId: v.id("courses"),
    meetingDate: v.optional(v.number()),
  },
  handler: async (ctx, { courseId, meetingDate }) => {
    let attendanceRecords = await ctx.db
      .query("parentMeetingAttendance")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Filter by meeting date if provided
    if (meetingDate !== undefined) {
      attendanceRecords = attendanceRecords.filter(
        (r) => r.meetingDate === meetingDate,
      );
    }

    // Filter records with agreements
    const recordsWithAgreements = attendanceRecords.filter(
      (r) => r.agreements && r.agreements.trim().length > 0,
    );

    // Get full details
    const agreements = await Promise.all(
      recordsWithAgreements.map(async (record) => {
        const student = await ctx.db.get(record.studentId);
        const parent = await ctx.db.get(record.parentId);
        return {
          meetingDate: record.meetingDate,
          meetingNumber: record.meetingNumber,
          student: student,
          parent: parent,
          agreements: record.agreements,
          observations: record.observations,
        };
      }),
    );

    return agreements.filter((a) => a.student !== null);
  },
});

/**
 * Get meeting statistics for a course
 */
export const getMeetingStatistics = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, { courseId }) => {
    // Get all enrolled students
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive", (q) =>
        q.eq("courseId", courseId).eq("isActive", true),
      )
      .collect();

    // Get all attendance records for this course
    const attendanceRecords = await ctx.db
      .query("parentMeetingAttendance")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Calculate statistics
    const totalStudents = enrollments.length;
    const totalMeetings = new Set(attendanceRecords.map((r) => r.meetingDate))
      .size;

    // Count attendance per student
    const studentAttendance = new Map<Id<"students">, number>();
    for (const record of attendanceRecords) {
      if (record.attended) {
        const current = studentAttendance.get(record.studentId) || 0;
        studentAttendance.set(record.studentId, current + 1);
      }
    }

    // Calculate average attendance rate
    const attendanceRates = Array.from(studentAttendance.values());
    const averageAttendance =
      attendanceRates.length > 0
        ? attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length
        : 0;

    return {
      totalStudents,
      totalMeetings,
      averageAttendance:
        Math.round((averageAttendance / totalMeetings) * 100) / 100,
      attendanceByMeeting: attendanceRecords.reduce(
        (acc, record) => {
          const key = record.meetingDate.toString();
          if (!acc[key]) {
            acc[key] = { attended: 0, total: 0 };
          }
          if (record.attended) {
            acc[key].attended++;
          }
          acc[key].total++;
          return acc;
        },
        {} as Record<string, { attended: number; total: number }>,
      ),
    };
  },
});

// ==================== MUTATIONS ====================

/**
 * Record parent meeting attendance
 */
export const recordMeetingAttendance = mutation({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
    parentId: v.id("users"),
    meetingDate: v.number(),
    meetingNumber: v.number(),
    attended: v.boolean(),
    representativeName: v.optional(v.string()),
    relationship: v.optional(v.string()),
    signature: v.optional(v.string()),
    observations: v.optional(v.string()),
    agreements: v.optional(v.string()),
    registeredBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate course exists
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Validate student exists and is enrolled
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.institutionId !== course.institutionId) {
      throw new Error("Student and course must belong to the same institution");
    }

    // Check enrollment
    const enrollment = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    const isEnrolled = enrollment.some(
      (e) => e.studentId === args.studentId && e.isActive,
    );
    if (!isEnrolled) {
      throw new Error("Student is not enrolled in this course");
    }

    // Validate parent is the student's parent
    if (student.parentId !== args.parentId) {
      throw new Error("Parent does not match student's registered parent");
    }

    // Validate registeredBy is a teacher or admin
    const registrar = await ctx.db.get(args.registeredBy);
    if (
      !registrar ||
      (registrar.role !== "PROFESOR" && registrar.role !== "ADMIN")
    ) {
      throw new Error("Only teachers or admins can record meeting attendance");
    }

    // Check if record already exists
    const existing = await ctx.db
      .query("parentMeetingAttendance")
      .withIndex("by_courseId_meetingDate", (q) =>
        q.eq("courseId", args.courseId).eq("meetingDate", args.meetingDate),
      )
      .collect();

    const existingRecord = existing.find(
      (r) =>
        r.studentId === args.studentId && r.meetingDate === args.meetingDate,
    );

    const now = Date.now();

    if (existingRecord) {
      // Update existing record
      await ctx.db.patch(existingRecord._id, {
        attended: args.attended,
        representativeName: args.representativeName,
        relationship: args.relationship,
        signature: args.signature,
        observations: args.observations,
        agreements: args.agreements,
        updatedAt: now,
      });
      return existingRecord._id;
    } else {
      // Create new record
      return await ctx.db.insert("parentMeetingAttendance", {
        institutionId: course.institutionId,
        courseId: args.courseId,
        studentId: args.studentId,
        parentId: args.parentId,
        meetingDate: args.meetingDate,
        meetingNumber: args.meetingNumber,
        attended: args.attended,
        representativeName: args.representativeName,
        relationship: args.relationship,
        signature: args.signature,
        observations: args.observations,
        agreements: args.agreements,
        registeredBy: args.registeredBy,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Bulk record meeting attendance for multiple students
 */
export const bulkRecordMeetingAttendance = mutation({
  args: {
    courseId: v.id("courses"),
    meetingDate: v.number(),
    meetingNumber: v.number(),
    attendanceRecords: v.array(
      v.object({
        studentId: v.id("students"),
        parentId: v.id("users"),
        attended: v.boolean(),
        representativeName: v.optional(v.string()),
        relationship: v.optional(v.string()),
        signature: v.optional(v.string()),
        observations: v.optional(v.string()),
        agreements: v.optional(v.string()),
      }),
    ),
    registeredBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const now = Date.now();
    const results = [];
    const errors = [];

    for (const record of args.attendanceRecords) {
      try {
        // Check if record exists
        const existing = await ctx.db
          .query("parentMeetingAttendance")
          .withIndex("by_courseId_meetingDate", (q) =>
            q.eq("courseId", args.courseId).eq("meetingDate", args.meetingDate),
          )
          .collect();

        const existingRecord = existing.find(
          (r) => r.studentId === record.studentId,
        );

        if (existingRecord) {
          await ctx.db.patch(existingRecord._id, {
            attended: record.attended,
            representativeName: record.representativeName,
            relationship: record.relationship,
            signature: record.signature,
            observations: record.observations,
            agreements: record.agreements,
            updatedAt: now,
          });
          results.push({ studentId: record.studentId, action: "updated" });
        } else {
          const attendanceId = await ctx.db.insert("parentMeetingAttendance", {
            institutionId: course.institutionId,
            courseId: args.courseId,
            studentId: record.studentId,
            parentId: record.parentId,
            meetingDate: args.meetingDate,
            meetingNumber: args.meetingNumber,
            attended: record.attended,
            representativeName: record.representativeName,
            relationship: record.relationship,
            signature: record.signature,
            observations: record.observations,
            agreements: record.agreements,
            registeredBy: args.registeredBy,
            createdAt: now,
            updatedAt: now,
          });
          results.push({ studentId: record.studentId, action: "created" });
        }
      } catch (error: any) {
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    return { results, errors };
  },
});

/**
 * Update meeting agreement/observations
 */
export const updateMeetingRecord = mutation({
  args: {
    attendanceId: v.id("parentMeetingAttendance"),
    observations: v.optional(v.string()),
    agreements: v.optional(v.string()),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, { attendanceId, ...updates }) => {
    const record = await ctx.db.get(attendanceId);
    if (!record) {
      throw new Error("Meeting attendance record not found");
    }

    await ctx.db.patch(attendanceId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(attendanceId);
  },
});
