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
  roles: ["ADMIN", "PROFESOR", "PARENT", "MASTER"],
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
  roles: ["ADMIN", "PROFESOR", "PARENT", "MASTER"],
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
  roles: ["ADMIN", "PROFESOR", "PARENT", "MASTER"],
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
      effectiveUserId !== tenancy.user._id
    ) {
      throw new Error("Cannot access votes for another user");
    }

    const responses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q: any) =>
        q.eq("voteId", scopedVote._id).eq("userId", effectiveUserId),
      )
      .collect();

    const scopedResponses = responses.filter(
      (response: Doc<"voteResponses">) =>
        response.institutionId === tenancy.institution._id,
    );

    if (scopedResponses.length === 0) {
      return null;
    }

    // Return the first response for backward compatibility, or modify to return all
    // For now, we'll return the first one but the API should handle multiple
    return scopedResponses[0];
  },
});

export const getUserVoteResponses = tenantQuery({
  args: {
    voteId: v.id("votes"),
    userId: v.id("users"),
  },
  roles: ["ADMIN", "PROFESOR", "PARENT", "MASTER"],
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
      effectiveUserId !== tenancy.user._id
    ) {
      throw new Error("Cannot access votes for another user");
    }

    const responses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q: any) =>
        q.eq("voteId", scopedVote._id).eq("userId", effectiveUserId),
      )
      .collect();

    return responses.filter(
      (response: Doc<"voteResponses">) =>
        response.institutionId === tenancy.institution._id,
    );
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
  roles: ["ADMIN", "MASTER", "PROFESOR"],
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

export const updateVote = tenantMutation({
  args: {
    id: v.id("votes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(voteCategoryValidator),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    allowMultipleVotes: v.optional(v.boolean()),
    maxVotesPerUser: v.union(v.float64(), v.null(), v.optional(v.any())), // Relaxed type to handle undefined
    requireAuthentication: v.optional(v.boolean()),
    options: v.optional(v.array(v.string())),
  },
  roles: ["ADMIN", "MASTER", "PROFESOR"],
  handler: async (ctx, { id, options, ...args }, tenancy) => {
    const vote = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Vote not found",
    );

    const now = Date.now();
    const updateData: any = { ...args, updatedAt: now };

    // Clean up undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    // Handle options update
    if (options !== undefined) {
      // Check if there are any responses
      const responses = await ctx.db
        .query("voteResponses")
        .withIndex("by_voteId", (q: any) => q.eq("voteId", vote._id))
        .collect();

      const hasResponses = responses.some(
        (r: Doc<"voteResponses">) => r.institutionId === tenancy.institution._id,
      );

      if (hasResponses) {
        // If there are responses, we can't easily change options without invalidating votes
        // For now, we'll throw an error if options are being changed
        // We could implement a more sophisticated check to see if options actually changed
        const currentOptions = await ctx.db
          .query("voteOptions")
          .withIndex("by_voteId", (q: any) => q.eq("voteId", vote._id))
          .collect();
        
        const currentOptionTexts = currentOptions
          .filter((o: Doc<"voteOptions">) => o.institutionId === tenancy.institution._id)
          .map((o: Doc<"voteOptions">) => o.text)
          .sort();
        
        const newOptionTexts = [...options].sort();
        
        const optionsChanged = 
          currentOptionTexts.length !== newOptionTexts.length ||
          !currentOptionTexts.every((val, index) => val === newOptionTexts[index]);

        if (optionsChanged) {
           throw new Error("Cannot modify options after voting has started");
        }
      } else {
        // No responses, safe to replace options
        const currentOptions = await ctx.db
          .query("voteOptions")
          .withIndex("by_voteId", (q: any) => q.eq("voteId", vote._id))
          .collect();

        // Delete old options
        await Promise.all(
          currentOptions.map((opt: Doc<"voteOptions">) => ctx.db.delete(opt._id))
        );

        // Create new options
        await Promise.all(
          options.map((text: string) =>
            ctx.db.insert("voteOptions", {
              institutionId: tenancy.institution._id,
              text,
              voteId: vote._id,
              createdAt: now,
            }),
          ),
        );
      }
    }

    await ctx.db.patch(vote._id, updateData);
    return vote._id;
  },
});

export const castVote = tenantMutation({
  args: {
    voteId: v.id("votes"),
    optionId: v.id("voteOptions"),
    userId: v.id("users"),
  },
  roles: ["ADMIN", "PROFESOR", "PARENT", "MASTER"],
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
    
    // Check if user already voted for THIS option (prevent duplicate votes for same option if that's desired?)
    // Usually in multiple choice, you can't vote for the same option twice.
    const hasVotedForOption = existingResponses.some(r => r.optionId === optionId);
    if (hasVotedForOption) {
        throw new Error("You have already voted for this option");
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

export const castVotes = tenantMutation({
  args: {
    voteId: v.id("votes"),
    optionIds: v.array(v.id("voteOptions")),
    userId: v.id("users"),
  },
  roles: ["ADMIN", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { voteId, optionIds, userId }, tenancy) => {
    const vote = ensureInstitutionMatch(
      await ctx.db.get(voteId),
      tenancy,
      "Vote not found",
    );

    if (!tenancy.isMaster && userId !== tenancy.user._id) {
      throw new Error("Cannot cast vote for another user");
    }

    // Validate all options
    for (const optionId of optionIds) {
        const option = await ctx.db.get(optionId);
        if (!option || option.voteId !== vote._id) {
            throw new Error(`Invalid vote option: ${optionId}`);
        }
        if (option.institutionId !== tenancy.institution._id) {
            throw new Error("Vote option not available in this institution");
        }
    }

    // Get all existing responses for this user and vote
    const existingResponses = await ctx.db
      .query("voteResponses")
      .withIndex("by_voteId_userId", (q: any) =>
        q.eq("voteId", voteId).eq("userId", userId),
      )
      .collect();

    // Check if user already voted and multiple votes are not allowed
    // If multiple votes are NOT allowed, user can only vote ONCE (one option).
    // So if optionIds.length > 1 and !allowMultipleVotes, fail.
    if (!vote.allowMultipleVotes && (existingResponses.length > 0 || optionIds.length > 1)) {
      throw new Error("User has already voted or multiple votes not allowed");
    }

    // Check max votes per user constraint
    if (
      vote.maxVotesPerUser &&
      (existingResponses.length + optionIds.length) > vote.maxVotesPerUser
    ) {
      throw new Error(
        `Maximum votes per user limit reached (${vote.maxVotesPerUser})`,
      );
    }

    // Check for duplicates in new votes
    const uniqueOptionIds = new Set(optionIds);
    if (uniqueOptionIds.size !== optionIds.length) {
        throw new Error("Duplicate options selected");
    }

    // Check if user already voted for any of these options
    for (const optionId of optionIds) {
        if (existingResponses.some(r => r.optionId === optionId)) {
            throw new Error("You have already voted for one of these options");
        }
    }

    // Insert votes
    const results = [];
    for (const optionId of optionIds) {
        const id = await ctx.db.insert("voteResponses", {
            institutionId: tenancy.institution._id,
            voteId,
            optionId,
            userId,
            createdAt: Date.now(),
        });
        results.push(id);
    }

    return results;
  },
});

export const deleteVote = tenantMutation({
  args: { id: v.id("votes") },
  roles: ["ADMIN", "MASTER", "PROFESOR"],
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
