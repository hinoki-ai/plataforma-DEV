import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Institution and Team Management Schema
 *
 * Handles institution information, team members, and organizational structure.
 */

export const institutionInfo = defineTable({
  name: v.string(),
  mission: v.string(),
  vision: v.string(),
  address: v.string(),
  phone: v.string(),
  email: v.string(),
  website: v.string(),
  logoUrl: v.optional(v.string()),
  institutionType: v.union(
    v.literal("PRESCHOOL"),
    v.literal("BASIC_SCHOOL"),
    v.literal("HIGH_SCHOOL"),
    v.literal("TECHNICAL_INSTITUTE"),
    v.literal("TECHNICAL_CENTER"),
    v.literal("COLLEGE"),
    v.literal("UNIVERSITY"),
  ),
  supportedLevels: v.optional(v.any()), // JSON array
  customGrades: v.optional(v.any()), // JSON array
  customSubjects: v.optional(v.any()), // JSON array
  educationalConfig: v.optional(v.any()), // JSON object
  isActive: v.optional(v.boolean()),
  billingPlan: v.optional(v.string()),
  billingStatus: v.optional(
    v.union(
      v.literal("TRIAL"),
      v.literal("ACTIVE"),
      v.literal("PAST_DUE"),
      v.literal("CANCELLED"),
    ),
  ),
  billingPeriodEndsAt: v.optional(v.number()),
  billingSeats: v.optional(v.number()),
  billingMetadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_isActive", ["isActive"]);

export const teamMembers = defineTable({
  institutionId: v.id("institutionInfo"),
  name: v.string(),
  title: v.string(),
  description: v.string(),
  specialties: v.any(), // JSON array
  imageUrl: v.optional(v.string()),
  order: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_order", ["order"])
  .index("by_isActive", ["isActive"]);
