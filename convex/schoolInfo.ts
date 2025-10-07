/**
 * School Information Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const getSchoolInfo = query({
  args: {},
  handler: async (ctx) => {
    // There should only be one school info record
    const schools = await ctx.db.query("schoolInfo").collect();
    return schools[0] || null;
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
    const existing = await ctx.db.query("schoolInfo").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("schoolInfo", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
