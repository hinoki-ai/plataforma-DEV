/**
 * Voting System Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const voteCategoryValidator = v.union(
  v.literal("GENERAL"),
  v.literal("ACADEMIC"),
  v.literal("ADMINISTRATIVE"),
  v.literal("SOCIAL"),
  v.literal("FINANCIAL"),
  v.literal("INFRASTRUCTURE"),
  v.literal("CURRICULUM"),
  v.literal("EVENTS"),
  v.literal("POLICIES"),
  v.literal("OTHER"),
);

// ==================== QUERIES ====================

export const getVotes = query({
  args: {
    isActive: v.optional(v.boolean()),
    category: v.optional(voteCategoryValidator),
  },
  handler: async (ctx, { isActive, category }) => {
    let allVotes;

    if (category) {
      allVotes = await ctx.db
        .query("votes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    } else {
      allVotes = await ctx.db.query("votes").collect();
    }

    if (isActive !== undefined) {
      allVotes = allVotes.filter((v) => v.isActive === isActive);
    }

    return allVotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getVoteById = query({
  args: { id: v.id("votes") },
  handler: async (ctx, { id }) => {
    const vote = await ctx.db.get(id);
    if (!vote) return null;

    // Get options with response counts
    const options = await ctx.db
      .query("voteOptions")
      .withIndex("by_voteId", (q) => q.eq("voteId", id))
      .collect();

    const optionsWithCounts = await Promise.all(
      options.map(async (option) => {
        const responses = await ctx.db
          .query("voteResponses")
          .withIndex("by_optionId", (q) => q.eq("optionId", option._id))
          .collect();

        return {
          ...option,
          voteCount: responses.length,
        };
      }),
    );

    return {
      ...vote,
      options: optionsWithCounts,
    };
  },
});

export const getUserVoteResponse = query({
  args: {
    voteId: v.id("votes"),
    userId: v.id("users"),
  },
  handler: async (ctx, { voteId, userId }) => {
    return await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q) =>
        q.eq("voteId", voteId).eq("userId", userId),
      )
      .first();
  },
});

// ==================== MUTATIONS ====================

export const createVote = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(voteCategoryValidator),
    endDate: v.number(),
    isActive: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    allowMultipleVotes: v.optional(v.boolean()),
    maxVotesPerUser: v.optional(v.number()),
    requireAuthentication: v.optional(v.boolean()),
    createdBy: v.id("users"),
    options: v.array(v.string()),
  },
  handler: async (ctx, { options, ...args }) => {
    const now = Date.now();

    const voteId = await ctx.db.insert("votes", {
      ...args,
      category: args.category ?? "GENERAL",
      isActive: true,
      isPublic: args.isPublic ?? true,
      allowMultipleVotes: args.allowMultipleVotes ?? false,
      requireAuthentication: args.requireAuthentication ?? true,
      createdAt: now,
      updatedAt: now,
    });

    // Create options
    await Promise.all(
      options.map((text) =>
        ctx.db.insert("voteOptions", {
          text,
          voteId,
          createdAt: now,
        }),
      ),
    );

    return voteId;
  },
});

export const castVote = mutation({
  args: {
    voteId: v.id("votes"),
    optionId: v.id("voteOptions"),
    userId: v.id("users"),
  },
  handler: async (ctx, { voteId, optionId, userId }) => {
    const vote = await ctx.db.get(voteId);
    if (!vote) throw new Error("Vote not found");

    // Get all existing responses for this user and vote
    const existingResponses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q) =>
        q.eq("voteId", voteId).eq("userId", userId),
      )
      .collect();

    // Check if user already voted and multiple votes are not allowed
    if (existingResponses.length > 0 && !vote.allowMultipleVotes) {
      throw new Error("User has already voted");
    }

    // Check max votes per user constraint
    if (
      vote.maxVotesPerUser &&
      existingResponses.length >= vote.maxVotesPerUser
    ) {
      throw new Error(
        `Maximum votes per user limit reached (${vote.maxVotesPerUser})`,
      );
    }

    return await ctx.db.insert("voteResponses", {
      voteId,
      optionId,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const deleteVote = mutation({
  args: { id: v.id("votes") },
  handler: async (ctx, { id }) => {
    // Delete all responses
    const responses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId", (q) => q.eq("voteId", id))
      .collect();
    await Promise.all(responses.map((r) => ctx.db.delete(r._id)));

    // Delete all options
    const options = await ctx.db
      .query("voteOptions")
      .withIndex("by_voteId", (q) => q.eq("voteId", id))
      .collect();
    await Promise.all(options.map((o) => ctx.db.delete(o._id)));

    // Delete vote
    await ctx.db.delete(id);
  },
});
