import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Authentication and User Management Schema
 *
 * Handles user authentication, roles, and institution memberships.
 * Integrates with Clerk for OAuth authentication.
 */

export const users = defineTable({
  name: v.optional(v.string()),
  email: v.string(),
  emailVerified: v.optional(v.number()),
  image: v.optional(v.string()),
  password: v.optional(v.string()),
  phone: v.optional(v.string()),
  role: v.union(
    v.literal("MASTER"),
    v.literal("ADMIN"),
    v.literal("PROFESOR"),
    v.literal("PARENT"),
    v.literal("PUBLIC"),
  ),
  isActive: v.boolean(),
  parentRole: v.optional(v.string()),
  status: v.optional(
    v.union(
      v.literal("PENDING"),
      v.literal("ACTIVE"),
      v.literal("INACTIVE"),
      v.literal("SUSPENDED"),
    ),
  ),
  provider: v.optional(v.string()),
  isOAuthUser: v.boolean(),
  clerkId: v.optional(v.string()),
  createdByAdmin: v.optional(v.string()),
  currentInstitutionId: v.optional(v.id("institutionInfo")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_email", ["email"])
  .index("by_role", ["role"])
  .index("by_isActive", ["isActive"])
  .index("by_createdByAdmin", ["createdByAdmin"])
  .index("by_currentInstitutionId", ["currentInstitutionId"])
  .index("by_createdAt", ["createdAt"])
  .index("by_clerkId", ["clerkId"]);

export const institutionMemberships = defineTable({
  institutionId: v.optional(v.id("institutionInfo")),
  userId: v.id("users"),
  role: v.union(
    v.literal("ADMIN"),
    v.literal("PROFESOR"),
    v.literal("PARENT"),
    v.literal("STAFF"),
    v.literal("MENTOR"),
  ),
  status: v.union(
    v.literal("INVITED"),
    v.literal("ACTIVE"),
    v.literal("SUSPENDED"),
    v.literal("LEFT"),
  ),
  invitedBy: v.optional(v.id("users")),
  joinedAt: v.optional(v.number()),
  leftAt: v.optional(v.number()),
  lastAccessAt: v.optional(v.number()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_userId", ["userId"])
  .index("by_user_institution", ["userId", "institutionId"]);

export const parentProfiles = defineTable({
  institutionId: v.id("institutionInfo"),
  userId: v.id("users"),
  rut: v.string(),
  address: v.string(),
  region: v.string(),
  comuna: v.string(),
  relationship: v.string(), // padre, madre, apoderado, tutor, abuelo, otro
  emergencyContact: v.string(),
  emergencyPhone: v.string(),
  secondaryEmergencyContact: v.optional(v.string()),
  secondaryEmergencyPhone: v.optional(v.string()),
  tertiaryEmergencyContact: v.optional(v.string()),
  tertiaryEmergencyPhone: v.optional(v.string()),
  registrationComplete: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_userId", ["userId"])
  .index("by_rut", ["rut"]);
