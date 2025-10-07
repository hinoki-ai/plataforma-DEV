/**
 * Team Member Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const getTeamMembers = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { isActive }) => {
    let members = await ctx.db.query("teamMembers").collect();

    if (isActive !== undefined) {
      members = members.filter((m) => m.isActive === isActive);
    }

    return members.sort((a, b) => a.order - b.order);
  },
});

export const getTeamMemberById = query({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ==================== MUTATIONS ====================

export const createTeamMember = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    description: v.string(),
    specialties: v.any(),
    imageUrl: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the max order to append at the end
    const members = await ctx.db.query("teamMembers").collect();
    const maxOrder = members.reduce((max, m) => Math.max(max, m.order), -1);

    return await ctx.db.insert("teamMembers", {
      ...args,
      order: args.order ?? maxOrder + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTeamMember = mutation({
  args: {
    id: v.id("teamMembers"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    specialties: v.optional(v.any()),
    imageUrl: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteTeamMember = mutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/**
 * Get team member statistics for admin dashboard
 */
export const getTeamMemberStats = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("teamMembers").collect();

    return {
      total: members.length,
      active: members.filter(m => m.isActive).length,
    };
  },
});
