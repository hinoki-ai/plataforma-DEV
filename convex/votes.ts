/**
 * Voting System Queries and Mutations
 */

import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { tenantMutation, tenantQuery, ensureInstitutionMatch } from "./tenancy";

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

export const getVotes = tenantQuery({
  args: {
    isActive: v.optional(v.boolean()),
    category: v.optional(voteCategoryValidator),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { isActive, category }, tenancy) => {
    let votes = await ctx.db
      .query("votes")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (category) {
      votes = votes.filter((vote: Doc<"votes">) => vote.category === category);
    }

    if (isActive !== undefined) {
      votes = votes.filter((vote: Doc<"votes">) => vote.isActive === isActive);
    }

    return votes.sort(
      (a: Doc<"votes">, b: Doc<"votes">) => b.createdAt - a.createdAt,
    );
  },
});

export const getVoteById = tenantQuery({
  args: { id: v.id("votes") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    const vote = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Vote not found",
    );

    const options = await ctx.db
      .query("voteOptions")
      .withIndex("by_voteId", (q: any) => q.eq("voteId", id))
      .collect();

    const optionsWithCounts = await Promise.all(
      options
        .filter(
          (option: Doc<"voteOptions">) =>
            option.institutionId === tenancy.institution._id,
        )
        .map(async (option: Doc<"voteOptions">) => {
          const responses = await ctx.db
            .query("voteResponses")
            .withIndex("by_optionId", (q: any) => q.eq("optionId", option._id))
            .collect();

          const scopedResponses = responses.filter(
            (response: Doc<"voteResponses">) =>
              response.institutionId === tenancy.institution._id,
          );

          return {
            ...option,
            voteCount: scopedResponses.length,
          };
        }),
    );

    return {
      ...vote,
      options: optionsWithCounts,
    };
  },
});

export const getUserVoteResponse = tenantQuery({
  args: {
    voteId: v.id("votes"),
    userId: v.id("users"),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { voteId, userId }, tenancy) => {
    const scopedVote = ensureInstitutionMatch(
      await ctx.db.get(voteId),
      tenancy,
      "Vote not found",
    );

    const effectiveUserId =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? tenancy.user._id
        : userId;

    if (
      !tenancy.isMaster &&
      tenancy.membershipRole !== "ADMIN" &&
      tenancy.membershipRole !== "STAFF" &&
      effectiveUserId !== tenancy.user._id
    ) {
      throw new Error("Cannot access votes for another user");
    }

    const response = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q: any) =>
        q.eq("voteId", scopedVote._id).eq("userId", effectiveUserId),
      )
      .first();

    if (!response) {
      return null;
    }

    if (response.institutionId !== tenancy.institution._id) {
      return null;
    }

    return response;
  },
});

// ==================== MUTATIONS ====================

export const createVote = tenantMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(voteCategoryValidator),
    endDate: v.number(),
    isActive: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    allowMultipleVotes: v.optional(v.boolean()),
    maxVotesPerUser: v.union(v.float64(), v.null()),
    requireAuthentication: v.optional(v.boolean()),
    createdBy: v.id("users"),
    options: v.array(v.string()),
  },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { options, ...args }, tenancy) => {
    const now = Date.now();

    // Create the vote data, filtering out null/undefined optional fields
    const voteData: any = {
      institutionId: tenancy.institution._id,
      title: args.title,
      endDate: args.endDate,
      createdBy: args.createdBy,
      category: args.category ?? "GENERAL",
      isActive: args.isActive ?? true,
      isPublic: args.isPublic ?? true,
      allowMultipleVotes: args.allowMultipleVotes ?? false,
      requireAuthentication: args.requireAuthentication ?? true,
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields
    if (args.description !== undefined) {
      voteData.description = args.description;
    }
    if (args.maxVotesPerUser !== undefined) {
      voteData.maxVotesPerUser = args.maxVotesPerUser;
    }

    if (!tenancy.isMaster && args.createdBy !== tenancy.user._id) {
      throw new Error("Votes must be created by the authenticated user");
    }

    const voteId = await ctx.db.insert("votes", voteData);

    // Create options
    await Promise.all(
      options.map((text: string) =>
        ctx.db.insert("voteOptions", {
          institutionId: tenancy.institution._id,
          text,
          voteId,
          createdAt: now,
        }),
      ),
    );

    return voteId;
  },
});

export const castVote = tenantMutation({
  args: {
    voteId: v.id("votes"),
    optionId: v.id("voteOptions"),
    userId: v.id("users"),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { voteId, optionId, userId }, tenancy) => {
    const vote = ensureInstitutionMatch(
      await ctx.db.get(voteId),
      tenancy,
      "Vote not found",
    );

    if (!tenancy.isMaster && userId !== tenancy.user._id) {
      throw new Error("Cannot cast vote for another user");
    }

    const option = await ctx.db.get(optionId);
    if (!option || option.voteId !== vote._id) {
      throw new Error("Invalid vote option");
    }

    if (option.institutionId !== tenancy.institution._id) {
      throw new Error("Vote option not available in this institution");
    }

    // Get all existing responses for this user and vote
    const existingResponses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q: any) =>
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
      institutionId: tenancy.institution._id,
      voteId,
      optionId,
      userId,
      createdAt: Date.now(),
    });
  },
});
export const deleteVote = tenantMutation({
  args: { id: v.id("votes") },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    const vote = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Vote not found",
    );

    const responses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId", (q: any) => q.eq("voteId", vote._id))
      .collect();
    await Promise.all(
      responses.map((response: Doc<"voteResponses">) =>
        ctx.db.delete(response._id),
      ),
    );

    const options = await ctx.db
      .query("voteOptions")
      .withIndex("by_voteId", (q: any) => q.eq("voteId", vote._id))
      .collect();
    await Promise.all(
      options.map((option: Doc<"voteOptions">) => ctx.db.delete(option._id)),
    );

    await ctx.db.delete(vote._id);
  },
});
