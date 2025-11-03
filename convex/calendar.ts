/**
 * Calendar Event Queries and Mutations
 */

import { v } from "convex/values";
import { ensureInstitutionMatch, tenantMutation, tenantQuery } from "./tenancy";

const eventCategoryValidator = v.union(
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
);

const priorityValidator = v.union(
  v.literal("LOW"),
  v.literal("MEDIUM"),
  v.literal("HIGH"),
);

// ==================== QUERIES ====================

export const getCalendarEvents = tenantQuery({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(eventCategoryValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { startDate, endDate, category, isActive }, tenancy) => {
    // Get all events for this institution first (using the institution index)
    let events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_institutionId", (q) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    // Apply filters in memory (this is much better than loading all events from all institutions)
    if (category !== undefined) {
      events = events.filter((event) => event.category === category);
    }

    if (isActive !== undefined) {
      events = events.filter((event) => event.isActive === isActive);
    }

    if (startDate !== undefined) {
      events = events.filter((event) => event.endDate >= startDate);
    }

    if (endDate !== undefined) {
      events = events.filter((event) => event.startDate <= endDate);
    }

    return events.sort((a, b) => a.startDate - b.startDate);
  },
});

export const getCalendarEventById = tenantQuery({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, { id }, tenancy) => {
    const event = await ctx.db.get(id);
    return ensureInstitutionMatch(event, tenancy, "Event not found");
  },
});

export const getUpcomingEvents = tenantQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }, tenancy) => {
    const now = Date.now();
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    const upcoming = events
      .filter((event: any) => event.startDate >= now && event.isActive)
      .sort((a: any, b: any) => a.startDate - b.startDate);

    return limit ? upcoming.slice(0, limit) : upcoming;
  },
});

// ==================== MUTATIONS ====================

export const createCalendarEvent = tenantMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    category: eventCategoryValidator,
    priority: v.optional(priorityValidator),
    level: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    isAllDay: v.optional(v.boolean()),
    color: v.optional(v.string()),
    location: v.optional(v.string()),
    createdBy: v.id("users"),
    attendeeIds: v.optional(v.array(v.id("users"))),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    if (!tenancy.isMaster && args.createdBy !== tenancy.user._id) {
      throw new Error("You can only create events for your own account");
    }

    const now = Date.now();

    return await ctx.db.insert("calendarEvents", {
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      category: args.category,
      priority: args.priority ?? "MEDIUM",
      level: args.level ?? "both",
      isRecurring: args.isRecurring ?? false,
      isAllDay: args.isAllDay ?? false,
      color: args.color,
      location: args.location,
      isActive: true,
      createdBy: args.createdBy,
      updatedBy: args.createdBy,
      attendeeIds: args.attendeeIds,
      version: 1,
      createdAt: now,
      updatedAt: now,
      institutionId: tenancy.institution._id,
    });
  },
});

export const updateCalendarEvent = tenantMutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(eventCategoryValidator),
    priority: v.optional(priorityValidator),
    level: v.optional(v.string()),
    isAllDay: v.optional(v.boolean()),
    color: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { id, updatedBy, ...updates }, tenancy) => {
    const existing = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Event not found",
    );

    const actor = updatedBy ?? tenancy.user._id;
    if (!tenancy.isMaster && actor !== tenancy.user._id) {
      throw new Error("Invalid updater for event");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedBy: actor,
      version: existing.version + 1,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const deleteCalendarEvent = tenantMutation({
  args: { id: v.id("calendarEvents") },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    ensureInstitutionMatch(await ctx.db.get(id), tenancy, "Event not found");

    const recurrenceRule = await ctx.db
      .query("recurrenceRules")
      .withIndex("by_calendarEventId", (q: any) => q.eq("calendarEventId", id))
      .first();

    if (
      recurrenceRule &&
      recurrenceRule.institutionId === tenancy.institution._id
    ) {
      await ctx.db.delete(recurrenceRule._id);
    }

    await ctx.db.delete(id);
  },
});
