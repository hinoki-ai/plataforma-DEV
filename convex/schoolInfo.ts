/**
 * Institution Information Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const getSchoolInfo = query({
  args: {},
  handler: async (ctx) => {
    // Legacy support: return first institution info record
    const institutions = await ctx.db.query("institutionInfo").collect();
    return institutions[0] || null;
  },
});

/**
 * Get all institutions (for multi-institution support)
 */
export const getAllInstitutions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("institutionInfo")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * Get institution by ID
 */
export const getInstitutionById = query({
  args: { institutionId: v.id("institutionInfo") },
  handler: async (ctx, { institutionId }) => {
    return await ctx.db.get(institutionId);
  },
});

// ==================== MUTATIONS ====================

export const createOrUpdateSchoolInfo = mutation({
  args: {
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
      v.literal("COLLEGE"),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("institutionInfo").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("institutionInfo", {
        ...args,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Create a new institution
 */
export const createInstitution = mutation({
  args: {
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
      v.literal("COLLEGE"),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("institutionInfo", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});
