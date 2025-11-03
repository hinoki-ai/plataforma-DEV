/**
 * Team Member Queries and Mutations
 */

import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { ensureInstitutionMatch, tenantMutation, tenantQuery } from "./tenancy";

// ==================== QUERIES ====================

export const getTeamMembers = tenantQuery({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { isActive }, tenancy) => {
    const members = (await ctx.db
      .query("teamMembers")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect()) as Doc<"teamMembers">[];

    const filtered =
      isActive === undefined
        ? members
        : members.filter((member) => member.isActive === isActive);

    return filtered.sort((a, b) => a.order - b.order);
  },
});

export const getTeamMemberById = tenantQuery({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }, tenancy) => {
    const member = await ctx.db.get(id);
    return ensureInstitutionMatch(member, tenancy, "Team member not found");
  },
});

// ==================== MUTATIONS ====================

export const createTeamMember = tenantMutation({
  args: {
    name: v.string(),
    title: v.string(),
    description: v.string(),
    specialties: v.any(),
    imageUrl: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();

    // Get the max order to append at the end
    const members = (await ctx.db
      .query("teamMembers")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect()) as Doc<"teamMembers">[];
    const maxOrder = members.reduce((max, m) => Math.max(max, m.order), -1);

    return await ctx.db.insert("teamMembers", {
      ...args,
      institutionId: tenancy.institution._id,
      order: args.order ?? maxOrder + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTeamMember = tenantMutation({
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
  handler: async (ctx, { id, ...updates }, tenancy) => {
    ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Team member not found",
    );
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteTeamMember = tenantMutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }, tenancy) => {
    ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Team member not found",
    );
    await ctx.db.delete(id);
  },
});

/**
 * Get team member statistics for admin dashboard
 */
export const getTeamMemberStats = tenantQuery({
  args: {},
  handler: async (ctx, _args, tenancy) => {
    const members = (await ctx.db
      .query("teamMembers")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect()) as Doc<"teamMembers">[];

    return {
      total: members.length,
      active: members.filter((m) => m.isActive).length,
    };
  },
});

/**
 * Toggle team member active status
 */
export const toggleTeamMemberStatus = tenantMutation({
  args: {
    id: v.id("teamMembers"),
    isActive: v.boolean(),
  },
  handler: async (ctx, { id, isActive }, tenancy) => {
    ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Team member not found",
    );
    await ctx.db.patch(id, {
      isActive,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});
