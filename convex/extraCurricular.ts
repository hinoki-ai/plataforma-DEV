/**
 * Extra-curricular Activities Management
 * Chilean Educational System - Libro de Clases
 * Handles extra-curricular activities enrollment and attendance
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  EXTRA_CURRICULAR_CATEGORIES,
  EXTRA_CURRICULAR_CATEGORY_SCHEMA,
} from "./constants";
import {
  getAuthenticatedUser,
  validateEntityOwnership,
  now,
  filterActive,
} from "./validation";

// ==================== QUERIES ====================

/**
 * Get all extra-curricular activities, optionally filtered
 */
export const getExtraCurricularActivities = query({
  args: {
    category: v.optional(EXTRA_CURRICULAR_CATEGORY_SCHEMA),
    isActive: v.optional(v.boolean()),
    instructorId: v.optional(v.id("users")),
  },
  handler: async (ctx, { category, isActive, instructorId }) => {
    let activities = await ctx.db.query("extraCurricularActivities").collect();

    // Filter by category if provided
    if (category) {
      activities = activities.filter((a) => a.category === category);
    }

    // Filter by active status if provided
    if (isActive !== undefined) {
      activities = activities.filter((a) => a.isActive === isActive);
    }

    // Filter by instructor if provided
    if (instructorId) {
      activities = activities.filter((a) => a.instructorId === instructorId);
    }

    // Get instructor info
    const activitiesWithInstructor = await Promise.all(
      activities.map(async (activity) => {
        const instructor = activity.instructorId
          ? await ctx.db.get(activity.instructorId)
          : null;
        return {
          ...activity,
          instructor: instructor,
        };
      }),
    );

    // Sort by name
    return activitiesWithInstructor.sort((a, b) =>
      (a as any).name.localeCompare((b as any).name),
    );
  },
});

/**
 * Get activity by ID with participants
 */
export const getActivityById = query({
  args: { activityId: v.id("extraCurricularActivities") },
  handler: async (ctx, { activityId }) => {
    const activity = await ctx.db.get(activityId);
    if (!activity) {
      return null;
    }

    // Get participants
    const participants = await ctx.db
      .query("extraCurricularParticipants")
      .filter((q) => q.eq(q.field("activityId"), activityId))
      .collect();

    const activeParticipants = filterActive(participants);

    // Get full participant details
    const participantsWithDetails = await Promise.all(
      activeParticipants.map(async (participant) => {
        const student = await ctx.db.get(participant.studentId);
        const course = await ctx.db.get(participant.courseId);
        return {
          ...participant,
          student: student,
          course: course,
        };
      }),
    );

    // Get instructor info
    const instructor = activity.instructorId
      ? await ctx.db.get(activity.instructorId)
      : null;

    return {
      ...activity,
      instructor: instructor,
      participants: participantsWithDetails.filter((p) => p.student !== null),
      totalParticipants: activeParticipants.length,
    };
  },
});

/**
 * Get activities for a student
 */
export const getStudentActivities = query({
  args: {
    studentId: v.id("students"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { studentId, isActive }) => {
    let participations = await ctx.db
      .query("extraCurricularParticipants")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();

    // Filter by active status if provided
    if (isActive !== undefined) {
      participations = participations.filter((p) => p.isActive === isActive);
    }

    // Get activity details
    const activitiesWithDetails = await Promise.all(
      participations.map(async (participation) => {
        const activity = await ctx.db.get(participation.activityId);
        const course = await ctx.db.get(participation.courseId);
        return {
          ...participation,
          activity: activity,
          course: course,
        };
      }),
    );

    return activitiesWithDetails.filter((a) => a.activity !== null);
  },
});

/**
 * Get activities for a course
 */
export const getCourseActivities = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, { courseId }) => {
    const participations = await ctx.db
      .query("extraCurricularParticipants")
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .collect();

    const activeParticipations = filterActive(participations);

    // Get activity and student details
    const activitiesWithDetails = await Promise.all(
      activeParticipations.map(async (participation) => {
        const activity = await ctx.db.get(participation.activityId);
        const student = await ctx.db.get(participation.studentId);
        return {
          ...participation,
          activity: activity,
          student: student,
        };
      }),
    );

    return activitiesWithDetails.filter(
      (a) => a.activity !== null && a.student !== null,
    );
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new extra-curricular activity
 */
export const createActivity = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: EXTRA_CURRICULAR_CATEGORY_SCHEMA,
    schedule: v.optional(v.string()),
    instructorId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await getAuthenticatedUser(ctx);
    if (!user.currentInstitutionId) {
      throw new Error("User must be associated with an institution");
    }

    // Validate instructor if provided
    if (args.instructorId) {
      await validateEntityOwnership(
        ctx,
        args.instructorId,
        "Instructor",
        user.currentInstitutionId,
      );
    }

    const currentTime = now();

    return await ctx.db.insert("extraCurricularActivities", {
      institutionId: user.currentInstitutionId,
      name: args.name,
      description: args.description,
      category: args.category,
      schedule: args.schedule,
      instructorId: args.instructorId,
      location: args.location,
      maxParticipants: args.maxParticipants,
      isActive: true,
      createdAt: currentTime,
      updatedAt: currentTime,
    });
  },
});

/**
 * Update an activity
 */
export const updateActivity = mutation({
  args: {
    activityId: v.id("extraCurricularActivities"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    schedule: v.optional(v.string()),
    instructorId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { activityId, ...updates }) => {
    // Get authenticated user
    const user = await getAuthenticatedUser(ctx);
    if (!user.currentInstitutionId) {
      throw new Error("User must be associated with an institution");
    }

    // Validate activity exists and belongs to user's institution
    const activity = await validateEntityOwnership(
      ctx,
      activityId,
      "Activity",
      user.currentInstitutionId,
    );

    // Validate instructor if being updated
    if (updates.instructorId) {
      await validateEntityOwnership(
        ctx,
        updates.instructorId,
        "Instructor",
        user.currentInstitutionId,
      );
    }

    await ctx.db.patch(activityId, {
      ...updates,
      updatedAt: now(),
    });

    return await ctx.db.get(activityId);
  },
});

/**
 * Enroll a student in an activity
 */
export const enrollStudent = mutation({
  args: {
    activityId: v.id("extraCurricularActivities"),
    studentId: v.id("students"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { activityId, studentId, courseId }) => {
    // Get authenticated user
    const user = await getAuthenticatedUser(ctx);
    if (!user.currentInstitutionId) {
      throw new Error("User must be associated with an institution");
    }

    // Validate activity exists, is active, and belongs to user's institution
    const activity = await validateEntityOwnership(
      ctx,
      activityId,
      "Activity",
      user.currentInstitutionId,
    );
    if (!activity.isActive) {
      throw new Error("Activity is not active");
    }

    // Validate student and course exist and belong to user's institution
    await validateEntityOwnership(
      ctx,
      studentId,
      "Student",
      user.currentInstitutionId,
    );
    const course = await validateEntityOwnership(
      ctx,
      courseId,
      "Course",
      user.currentInstitutionId,
    );

    // Check if student is already enrolled
    const existingEnrollments = await ctx.db
      .query("extraCurricularParticipants")
      .filter((q) => q.eq(q.field("activityId"), activityId))
      .collect();

    const existing = existingEnrollments.find(
      (e) => e.studentId === studentId && e.isActive,
    );
    if (existing) {
      throw new Error("Student is already enrolled in this activity");
    }

    // Check capacity if maxParticipants is set
    const activeEnrollments = existingEnrollments.filter((e) => e.isActive);
    if (
      activity.maxParticipants &&
      activeEnrollments.length >= activity.maxParticipants
    ) {
      throw new Error("Activity has reached maximum capacity");
    }

    const currentTime = now();

    return await ctx.db.insert("extraCurricularParticipants", {
      institutionId: user.currentInstitutionId,
      activityId,
      studentId,
      courseId,
      enrollmentDate: currentTime,
      isActive: true,
      createdAt: currentTime,
      updatedAt: currentTime,
    });
  },
});

/**
 * Remove a student from an activity
 */
export const removeStudent = mutation({
  args: {
    activityId: v.id("extraCurricularActivities"),
    studentId: v.id("students"),
  },
  handler: async (ctx, { activityId, studentId }) => {
    const participations = await ctx.db
      .query("extraCurricularParticipants")
      .filter((q) => q.eq(q.field("activityId"), activityId))
      .collect();

    const participation = participations.find(
      (p) => p.studentId === studentId && p.isActive,
    );

    if (!participation) {
      throw new Error("Student is not enrolled in this activity");
    }

    // Soft delete: deactivate enrollment
    await ctx.db.patch(participation._id, {
      isActive: false,
      updatedAt: now(),
    });

    return { success: true };
  },
});

/**
 * Record activity attendance
 */
export const recordActivityAttendance = mutation({
  args: {
    participationId: v.id("extraCurricularParticipants"),
    date: v.number(),
    attended: v.boolean(),
    performance: v.optional(v.string()),
  },
  handler: async (ctx, { participationId, date, attended, performance }) => {
    const participation = await ctx.db.get(participationId);
    if (!participation) {
      throw new Error("Participation record not found");
    }

    // Get existing attendance array
    const attendance = (participation.attendance as any[]) || [];

    // Add new attendance record
    const newRecord = {
      date,
      attended,
      performance,
    };

    // Remove any existing record for this date
    const filteredAttendance = attendance.filter((a: any) => a.date !== date);

    // Add new record
    filteredAttendance.push(newRecord);

    // Sort by date descending
    filteredAttendance.sort((a: any, b: any) => b.date - a.date);

    await ctx.db.patch(participationId, {
      attendance: filteredAttendance,
      performance: performance || participation.performance,
      updatedAt: now(),
    });

    return await ctx.db.get(participationId);
  },
});

/**
 * Update activity performance notes
 */
export const updateActivityPerformance = mutation({
  args: {
    participationId: v.id("extraCurricularParticipants"),
    performance: v.string(),
  },
  handler: async (ctx, { participationId, performance }) => {
    const participation = await ctx.db.get(participationId);
    if (!participation) {
      throw new Error("Participation record not found");
    }

    await ctx.db.patch(participationId, {
      performance,
      updatedAt: now(),
    });

    return await ctx.db.get(participationId);
  },
});
