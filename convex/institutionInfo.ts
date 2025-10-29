import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

export const getSchoolInfo = query({
  args: {},
  handler: async (ctx) => {
    // Get the first institution info record (assuming single institution setup)
    const institutionInfo = await ctx.db.query("institutionInfo").first();
    return institutionInfo;
  },
});

export const getAllInstitutions = query({
  args: {},
  handler: async (ctx) => {
    const institutions = await ctx.db.query("institutionInfo").collect();
    return institutions;
  },
});

export const getInstitutionById = query({
  args: { institutionId: v.id("institutionInfo") },
  handler: async (ctx, args) => {
    const institution = await ctx.db.get(args.institutionId);
    return institution;
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
      v.literal("TECHNICAL_INSTITUTE"),
      v.literal("TECHNICAL_CENTER"),
      v.literal("UNIVERSITY"),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if institution info already exists
    const existing = await ctx.db.query("institutionInfo").first();

    const now = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new record
      const newId = await ctx.db.insert("institutionInfo", {
        ...args,
        createdAt: now,
        updatedAt: now,
        isActive: args.isActive ?? true,
      });
      return newId;
    }
  },
});

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
      v.literal("TECHNICAL_INSTITUTE"),
      v.literal("TECHNICAL_CENTER"),
      v.literal("UNIVERSITY"),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("institutionInfo", {
      ...args,
      createdAt: now,
      updatedAt: now,
      isActive: args.isActive ?? true,
    });
  },
});

export const updateInstitution = mutation({
  args: {
    id: v.id("institutionInfo"),
    name: v.optional(v.string()),
    mission: v.optional(v.string()),
    vision: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    institutionType: v.optional(
      v.union(
        v.literal("PRESCHOOL"),
        v.literal("BASIC_SCHOOL"),
        v.literal("HIGH_SCHOOL"),
        v.literal("TECHNICAL_INSTITUTE"),
        v.literal("TECHNICAL_CENTER"),
        v.literal("UNIVERSITY"),
      ),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateFields } = args;
    await ctx.db.patch(id, {
      ...updateFields,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteInstitution = mutation({
  args: { institutionId: v.id("institutionInfo") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.institutionId);
    return args.institutionId;
  },
});
