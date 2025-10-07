/**
 * Meeting Queries and Mutations
 * Handles parent-teacher meetings
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

/**
 * Get all meetings with pagination and filtering
 */
export const getMeetings = query({
  args: {
    filter: v.optional(v.object({
      status: v.optional(v.string()),
      type: v.optional(v.string()),
    })),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    parentRequested: v.optional(v.boolean()),
  },
  handler: async (ctx, { filter, page = 1, limit = 20, assignedTo, parentRequested }) => {
    let allMeetings = await ctx.db.query("meetings").collect();

    // Apply filters
    if (filter?.status) {
      allMeetings = allMeetings.filter(m => m.status === filter.status);
    }
    if (filter?.type) {
      allMeetings = allMeetings.filter(m => m.type === filter.type);
    }
    if (assignedTo) {
      allMeetings = allMeetings.filter(m => m.assignedTo === assignedTo);
    }
    if (parentRequested !== undefined) {
      allMeetings = allMeetings.filter(m => m.parentRequested === parentRequested);
    }

    // Sort by date descending
    allMeetings.sort((a, b) => b.scheduledDate - a.scheduledDate);

    // Pagination
    const total = allMeetings.length;
    const skip = (page - 1) * limit;
    const meetings = allMeetings.slice(skip, skip + limit);

    // Get teacher info for each meeting
    const meetingsWithTeacher = await Promise.all(
      meetings.map(async (meeting) => {
        const teacher = await ctx.db.get(meeting.assignedTo);
        return {
          ...meeting,
          teacher: teacher ? {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
          } : null,
        };
      })
    );

    return {
      meetings: meetingsWithTeacher,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },
});

/**
 * Get meeting by ID
 */
export const getMeetingById = query({
  args: { id: v.id("meetings") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Get meetings for a teacher
 */
export const getMeetingsByTeacher = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    return await ctx.db
      .query("meetings")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", teacherId))
      .collect();
  },
});

/**
 * Get meetings for a student
 */
export const getMeetingsByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, { studentId }) => {
    return await ctx.db
      .query("meetings")
      .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
      .collect();
  },
});

/**
 * Get upcoming meetings
 */
export const getUpcomingMeetings = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    let meetings = await ctx.db.query("meetings").collect();

    meetings = meetings.filter((m) => m.scheduledDate >= now);

    if (userId) {
      meetings = meetings.filter((m) => m.assignedTo === userId);
    }

    return meetings.sort((a, b) => a.scheduledDate - b.scheduledDate);
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new meeting
 */
export const createMeeting = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    studentName: v.string(),
    studentGrade: v.string(),
    guardianName: v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    type: v.union(
      v.literal("PARENT_TEACHER"),
      v.literal("FOLLOW_UP"),
      v.literal("EMERGENCY"),
      v.literal("IEP_REVIEW"),
      v.literal("GRADE_CONFERENCE")
    ),
    assignedTo: v.id("users"),
    reason: v.optional(v.string()),
    parentRequested: v.optional(v.boolean()),
    studentId: v.optional(v.id("students")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("meetings", {
      ...args,
      status: "SCHEDULED",
      duration: args.duration ?? 30,
      location: args.location ?? "Sala de Reuniones",
      followUpRequired: false,
      parentRequested: args.parentRequested ?? false,
      source: args.parentRequested ? "PARENT_REQUESTED" : "STAFF_CREATED",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update meeting
 */
export const updateMeeting = mutation({
  args: {
    id: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    scheduledTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("SCHEDULED"),
        v.literal("CONFIRMED"),
        v.literal("IN_PROGRESS"),
        v.literal("COMPLETED"),
        v.literal("CANCELLED"),
        v.literal("RESCHEDULED")
      )
    ),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
    followUpRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const meeting = await ctx.db.get(id);
    if (!meeting) {
      throw new Error("Meeting not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Delete meeting
 */
export const deleteMeeting = mutation({
  args: { id: v.id("meetings") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/**
 * Cancel meeting
 */
export const cancelMeeting = mutation({
  args: {
    id: v.id("meetings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    await ctx.db.patch(id, {
      status: "CANCELLED",
      notes: reason,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get meetings by guardian email
 */
export const getMeetingsByGuardian = query({
  args: { guardianEmail: v.string() },
  handler: async (ctx, { guardianEmail }) => {
    const meetings = await ctx.db.query("meetings").collect();
    const filtered = meetings
      .filter(m => m.guardianEmail === guardianEmail)
      .sort((a, b) => b.scheduledDate - a.scheduledDate);

    // Get teacher names
    const withTeachers = await Promise.all(
      filtered.map(async (meeting) => {
        const teacher = await ctx.db.get(meeting.assignedTo);
        return {
          ...meeting,
          teacherName: teacher?.name || 'Profesor asignado',
        };
      })
    );

    return withTeachers;
  },
});

/**
 * Get meeting statistics for admin dashboard
 */
export const getMeetingStats = query({
  args: {},
  handler: async (ctx) => {
    const meetings = await ctx.db.query("meetings").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      total: meetings.length,
      upcoming: meetings.filter(m => m.scheduledDate >= now).length,
      recent: meetings.filter(m => m.createdAt >= sevenDaysAgo).length,
    };
  },
});
