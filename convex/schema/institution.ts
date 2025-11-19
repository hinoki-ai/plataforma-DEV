import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Institution and Team Management Schema
 *
 * Handles institution information, team members, and organizational structure.
 */

/**
 * Institution Information
 *
 * Core institution/school profile and configuration.
 * Supports multi-tenant architecture with customizable educational settings.
 *
 * Relationships:
 * - Has many: Most tables reference institutionId
 * - Has many: teamMembers (1:N)
 *
 * @billing Stripe integration for subscription management
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
  supportedLevels: v.optional(v.array(v.string())), // Array of supported educational levels
  customGrades: v.optional(
    v.array(
      v.object({
        code: v.string(),
        name: v.string(),
        level: v.string(),
      }),
    ),
  ), // Custom grade definitions
  customSubjects: v.optional(
    v.array(
      v.object({
        code: v.string(),
        name: v.string(),
        category: v.optional(v.string()),
      }),
    ),
  ), // Custom subject definitions
  educationalConfig: v.optional(
    v.object({
      curriculumFramework: v.optional(v.string()),
      assessmentTypes: v.optional(v.array(v.string())),
      gradingScale: v.optional(
        v.object({
          minGrade: v.number(),
          maxGrade: v.number(),
          passingGrade: v.number(),
        }),
      ),
      maxCourses: v.optional(v.number()),
      maxSubjects: v.optional(v.number()),
      enabledFeatures: v.optional(v.any()),
    }),
  ), // Educational configuration
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
  billingMetadata: v.optional(
    v.object({
      stripeCustomerId: v.optional(v.string()),
      subscriptionId: v.optional(v.string()),
      lastPaymentDate: v.optional(v.number()),
      paymentMethod: v.optional(
        v.object({
          type: v.string(),
          last4: v.optional(v.string()),
        }),
      ),
    }),
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_isActive", ["isActive"]);

/**
 * Team Members
 *
 * Institution staff and faculty profiles.
 * Includes specialties and professional information.
 *
 * Relationships:
 * - Belongs to: institutionInfo (N:1)
 */
export const teamMembers = defineTable({
  institutionId: v.id("institutionInfo"),
  name: v.string(),
  title: v.string(),
  description: v.string(),
  specialties: v.array(v.string()), // Array of specialty areas
  imageUrl: v.optional(v.string()),
  order: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_order", ["order"])
  .index("by_isActive", ["isActive"]);
