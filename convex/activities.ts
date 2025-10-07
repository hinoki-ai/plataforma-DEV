/**
 * Activity Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const activityTypeValidator = v.union(
  v.literal("CLASS"),
  v.literal("EVENT"),
  v.literal("WORKSHOP"),
  v.literal("EXCURSION"),
  v.literal("MEETING"),
  v.literal("OTHER"),
);

// ==================== QUERIES ====================

export const getActivities = query({
  args: {
    teacherId: v.optional(v.id("users")),
    type: v.optional(activityTypeValidator),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, { teacherId, type, subject, grade }) => {
    let allActivities;

    if (teacherId) {
      allActivities = await ctx.db
        .query("activities")
        .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
        .collect();
    } else if (type) {
      allActivities = await ctx.db
        .query("activities")
        .withIndex("by_type", (q) => q.eq("type", type))
        .collect();
    } else if (subject) {
      allActivities = await ctx.db
        .query("activities")
        .withIndex("by_subject", (q) => q.eq("subject", subject))
        .collect();
    } else if (grade) {
      allActivities = await ctx.db
        .query("activities")
        .withIndex("by_grade", (q) => q.eq("grade", grade))
        .collect();
    } else {
      allActivities = await ctx.db.query("activities").collect();
    }

    return allActivities.sort((a, b) => b.scheduledDate - a.scheduledDate);
  },
});

export const getActivityById = query({
  args: { id: v.id("activities") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ==================== MUTATIONS ====================

export const createActivity = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: activityTypeValidator,
    subject: v.string(),
    grade: v.string(),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    duration: v.number(),
    teacherId: v.id("users"),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    materials: v.optional(v.string()),
    objectives: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateActivity = mutation({
  args: {
    id: v.id("activities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(activityTypeValidator),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    scheduledTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    materials: v.optional(v.string()),
    objectives: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteActivity = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
