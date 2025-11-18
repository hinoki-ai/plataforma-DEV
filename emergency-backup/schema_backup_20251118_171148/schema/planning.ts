import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Planning and Calendar Schema
 *
 * Handles educational planning documents and calendar events.
 * Supports recurring events and complex scheduling.
 */

export const planningDocuments = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  content: v.string(),
  subject: v.string(),
  grade: v.string(),
  authorId: v.id("users"),
  attachments: v.optional(v.any()), // JSON field
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_authorId", ["authorId"])
  .index("by_subject", ["subject"])
  .index("by_grade", ["grade"])
  .index("by_updatedAt", ["updatedAt"]);

export const calendarEvents = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  description: v.optional(v.string()),
  startDate: v.number(),
  endDate: v.number(),
  category: v.union(
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
  ),
  priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
  level: v.string(),
  isRecurring: v.boolean(),
  isAllDay: v.boolean(),
  color: v.optional(v.string()),
  location: v.optional(v.string()),
  isActive: v.boolean(),
  attachments: v.optional(v.string()),
  metadata: v.optional(v.string()),
  createdBy: v.id("users"),
  updatedBy: v.id("users"),
  version: v.number(),
  attendeeIds: v.optional(v.array(v.id("users"))), // Many-to-many relation
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_startDate", ["startDate"])
  .index("by_endDate", ["endDate"])
  .index("by_category", ["category"])
  .index("by_priority", ["priority"])
  .index("by_isActive", ["isActive"])
  .index("by_createdBy", ["createdBy"])
  .index("by_isRecurring", ["isRecurring"])
  .index("by_date_category", ["startDate", "endDate", "category", "isActive"])
  .index("by_author_role", ["createdBy", "category", "isActive"])
  .index("by_priority_date", ["priority", "startDate", "isActive"]);

export const recurrenceRules = defineTable({
  institutionId: v.id("institutionInfo"),
  calendarEventId: v.id("calendarEvents"),
  pattern: v.union(
    v.literal("NONE"),
    v.literal("DAILY"),
    v.literal("WEEKLY"),
    v.literal("MONTHLY"),
    v.literal("YEARLY"),
    v.literal("CUSTOM"),
  ),
  interval: v.number(),
  daysOfWeek: v.string(),
  monthOfYear: v.optional(v.number()),
  weekOfMonth: v.optional(v.number()),
  endDate: v.optional(v.number()),
  occurrences: v.optional(v.number()),
  exceptions: v.string(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_calendarEventId", ["calendarEventId"]);

export const calendarEventTemplates = defineTable({
  institutionId: v.id("institutionInfo"),
  name: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  category: v.union(
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
  ),
  level: v.string(),
  color: v.optional(v.string()),
  duration: v.number(),
  isAllDay: v.boolean(),
  recurrence: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_category", ["category"])
  .index("by_createdBy", ["createdBy"]);
