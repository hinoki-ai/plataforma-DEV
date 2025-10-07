/**
 * Calendar Event Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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
  v.literal("OTHER")
);

const priorityValidator = v.union(
  v.literal("LOW"),
  v.literal("MEDIUM"),
  v.literal("HIGH")
);

// ==================== QUERIES ====================

export const getCalendarEvents = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(eventCategoryValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { startDate, endDate, category, isActive }) => {
    let allEvents;

    if (category) {
      allEvents = await ctx.db
        .query("calendarEvents")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    } else {
      allEvents = await ctx.db.query("calendarEvents").collect();
    }

    // Filter by active status
    if (isActive !== undefined) {
      allEvents = allEvents.filter((e) => e.isActive === isActive);
    }

    // Filter by date range
    if (startDate) {
      allEvents = allEvents.filter((e) => e.endDate >= startDate);
    }
    if (endDate) {
      allEvents = allEvents.filter((e) => e.startDate <= endDate);
    }

    return allEvents.sort((a, b) => a.startDate - b.startDate);
  },
});

export const getCalendarEventById = query({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getUpcomingEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    const now = Date.now();
    let events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_startDate")
      .collect();

    events = events
      .filter((e) => e.startDate >= now && e.isActive)
      .sort((a, b) => a.startDate - b.startDate);

    return limit ? events.slice(0, limit) : events;
  },
});

// ==================== MUTATIONS ====================

export const createCalendarEvent = mutation({
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
  handler: async (ctx, args) => {
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
      version: 1,
      attendeeIds: args.attendeeIds,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCalendarEvent = mutation({
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
    updatedBy: v.id("users"),
  },
  handler: async (ctx, { id, updatedBy, ...updates }) => {
    const event = await ctx.db.get(id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedBy,
      version: event.version + 1,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const deleteCalendarEvent = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, { id }) => {
    // Delete associated recurrence rule if exists
    const rule = await ctx.db
      .query("recurrenceRules")
      .withIndex("by_calendarEventId", (q) => q.eq("calendarEventId", id))
      .first();
    
    if (rule) {
      await ctx.db.delete(rule._id);
    }

    await ctx.db.delete(id);
  },
});
