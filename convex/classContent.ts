/**
 * Class Content and Lesson Recording
 * Chilean Educational System - Libro de Clases
 * Handles daily lesson content, objectives, and activities
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

/**
 * Get class content for a specific date and course
 */
export const getClassContentByDate = query({
  args: {
    courseId: v.id("courses"),
    date: v.number(), // Timestamp for the day
  },
  handler: async (ctx, { courseId, date }) => {
    const content = await ctx.db
      .query("classContent")
      .withIndex("by_courseId_date", (q) =>
        q.eq("courseId", courseId).eq("date", date),
      )
      .collect();

    // Get teacher info for each content entry
    const contentWithTeachers = await Promise.all(
      content.map(async (entry) => {
        const teacher = await ctx.db.get(entry.teacherId);
        return {
          ...entry,
          teacher: teacher,
        };
      }),
    );

    return contentWithTeachers;
  },
});

/**
 * Get content by subject for a course
 */
export const getContentBySubject = query({
  args: {
    courseId: v.id("courses"),
    subject: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { courseId, subject, startDate, endDate }) => {
    let content = await ctx.db
      .query("classContent")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Filter by subject
    content = content.filter((c) => c.subject === subject);

    // Filter by date range if provided
    if (startDate !== undefined) {
      content = content.filter((c) => c.date >= startDate);
    }
    if (endDate !== undefined) {
      content = content.filter((c) => c.date <= endDate);
    }

    // Sort by date descending
    return content.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get all content for a course within a date range
 */
export const getCourseContent = query({
  args: {
    courseId: v.id("courses"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { courseId, startDate, endDate }) => {
    let content = await ctx.db
      .query("classContent")
      .withIndex("by_courseId_date", (q) => q.eq("courseId", courseId))
      .collect();

    // Filter by date range if provided
    if (startDate !== undefined) {
      content = content.filter((c) => c.date >= startDate);
    }
    if (endDate !== undefined) {
      content = content.filter((c) => c.date <= endDate);
    }

    // Sort by date descending
    return content.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get content by teacher
 */
export const getContentByTeacher = query({
  args: {
    teacherId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { teacherId, startDate, endDate }) => {
    let content = await ctx.db
      .query("classContent")
      .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
      .collect();

    // Filter by date range if provided
    if (startDate !== undefined) {
      content = content.filter((c) => c.date >= startDate);
    }
    if (endDate !== undefined) {
      content = content.filter((c) => c.date <= endDate);
    }

    // Sort by date descending
    return content.sort((a, b) => b.date - a.date);
  },
});

// ==================== MUTATIONS ====================

/**
 * Create new class content entry
 */
export const createClassContent = mutation({
  args: {
    courseId: v.id("courses"),
    date: v.number(),
    subject: v.string(),
    topic: v.string(),
    objectives: v.string(),
    content: v.string(),
    activities: v.optional(v.string()),
    resources: v.optional(v.string()),
    homework: v.optional(v.string()),
    period: v.optional(v.string()),
    teacherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate date (cannot be in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recordDate = new Date(args.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate > today) {
      throw new Error("Cannot record content for future dates");
    }

    // Validate course exists
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Validate teacher exists and is PROFESOR
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.role !== "PROFESOR") {
      throw new Error("Only teachers can record class content");
    }

    // Validate subject is in course subjects
    if (!course.subjects.includes(args.subject)) {
      throw new Error(
        `Subject ${args.subject} is not part of this course's subjects`,
      );
    }

    const now = Date.now();

    return await ctx.db.insert("classContent", {
      courseId: args.courseId,
      date: args.date,
      subject: args.subject,
      topic: args.topic,
      objectives: args.objectives,
      content: args.content,
      activities: args.activities,
      resources: args.resources,
      homework: args.homework,
      period: args.period,
      teacherId: args.teacherId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update class content entry
 */
export const updateClassContent = mutation({
  args: {
    contentId: v.id("classContent"),
    topic: v.optional(v.string()),
    objectives: v.optional(v.string()),
    content: v.optional(v.string()),
    activities: v.optional(v.string()),
    resources: v.optional(v.string()),
    homework: v.optional(v.string()),
    period: v.optional(v.string()),
  },
  handler: async (ctx, { contentId, ...updates }) => {
    const content = await ctx.db.get(contentId);
    if (!content) {
      throw new Error("Class content not found");
    }

    await ctx.db.patch(contentId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(contentId);
  },
});

/**
 * Delete class content entry
 */
export const deleteClassContent = mutation({
  args: { contentId: v.id("classContent") },
  handler: async (ctx, { contentId }) => {
    const content = await ctx.db.get(contentId);
    if (!content) {
      throw new Error("Class content not found");
    }

    await ctx.db.delete(contentId);
    return { success: true };
  },
});
