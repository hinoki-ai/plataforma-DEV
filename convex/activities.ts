/**
 * Activity Queries and Mutations
 */

import { v } from "convex/values";
import { tenantMutation, tenantQuery, ensureInstitutionMatch } from "./tenancy";

const activityTypeValidator = v.union(
  v.literal("CLASS"),
  v.literal("EVENT"),
  v.literal("WORKSHOP"),
  v.literal("EXCURSION"),
  v.literal("MEETING"),
  v.literal("OTHER"),
);

// ==================== QUERIES ====================

export const getActivities = tenantQuery({
  args: {
    teacherId: v.optional(v.id("users")),
    type: v.optional(activityTypeValidator),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, { teacherId, type, subject, grade }, tenancy) => {
    let queryBuilder = ctx.db
      .query("activities")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      );

    if (teacherId) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("teacherId", teacherId),
      );
    }

    if (type) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("type", type));
    }

    if (subject) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("subject", subject));
    }

    if (grade) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("grade", grade));
    }

    const allActivities = await queryBuilder.collect();
    return allActivities.sort(
      (a: any, b: any) => b.scheduledDate - a.scheduledDate,
    );
  },
});

export const getActivityById = tenantQuery({
  args: { id: v.id("activities") },
  handler: async (ctx, { id }, tenancy) => {
    const activity = await ctx.db.get(id);
    return ensureInstitutionMatch(activity, tenancy, "Activity not found");
  },
});

// ==================== MUTATIONS ====================

export const createActivity = tenantMutation({
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
  roles: ["ADMIN", "PROFESOR", "STAFF", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    return await ctx.db.insert("activities", {
      ...args,
      institutionId: tenancy.institution._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateActivity = tenantMutation({
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
  roles: ["ADMIN", "PROFESOR", "STAFF", "MASTER"],
  handler: async (ctx, { id, ...updates }, tenancy) => {
    const existing = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Activity not found",
    );

    const canEditAll =
      tenancy.isMaster ||
      tenancy.membershipRole === "ADMIN" ||
      tenancy.membershipRole === "STAFF";

    if (!canEditAll && existing.teacherId !== tenancy.user._id) {
      throw new Error("No permission to update this activity");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteActivity = tenantMutation({
  args: { id: v.id("activities") },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    ensureInstitutionMatch(await ctx.db.get(id), tenancy, "Activity not found");

    if (
      !(
        tenancy.isMaster ||
        tenancy.membershipRole === "ADMIN" ||
        tenancy.membershipRole === "STAFF"
      )
    ) {
      throw new Error("No permission to delete activities");
    }

    await ctx.db.delete(id);
  },
});
