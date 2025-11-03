/**
 * Media (Photos & Videos) Queries and Mutations
 */

import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { ensureInstitutionMatch, tenantMutation, tenantQuery } from "./tenancy";

// ==================== PHOTO QUERIES ====================

export const getPhotos = tenantQuery({
  args: {
    uploadedBy: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { uploadedBy, limit }, tenancy) => {
    let queryBuilder = ctx.db
      .query("photos")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      );

    if (uploadedBy) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("uploadedBy", uploadedBy),
      );
    }

    const photos = (await queryBuilder.collect()) as Doc<"photos">[];
    photos.sort((a, b) => b.createdAt - a.createdAt);

    return limit ? photos.slice(0, limit) : photos;
  },
});

export const getPhotoById = tenantQuery({
  args: { id: v.id("photos") },
  handler: async (ctx, { id }, tenancy) => {
    const photo = await ctx.db.get(id);
    return ensureInstitutionMatch(photo, tenancy, "Photo not found");
  },
});

// ==================== VIDEO QUERIES ====================

export const getVideos = tenantQuery({
  args: {
    uploadedBy: v.optional(v.id("users")),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { uploadedBy, category, isPublic, limit }, tenancy) => {
    let queryBuilder = ctx.db
      .query("videos")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      );

    if (uploadedBy) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("uploadedBy", uploadedBy),
      );
    }

    if (category) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("category", category),
      );
    }

    if (isPublic !== undefined) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("isPublic", isPublic),
      );
    }

    const videos = (await queryBuilder.collect()) as Doc<"videos">[];
    videos.sort((a, b) => b.createdAt - a.createdAt);
    return limit ? videos.slice(0, limit) : videos;
  },
});

export const getVideoById = tenantQuery({
  args: { id: v.id("videos") },
  handler: async (ctx, { id }, tenancy) => {
    const video = await ctx.db.get(id);
    return ensureInstitutionMatch(video, tenancy, "Video not found");
  },
});

// ==================== VIDEO CAPSULE QUERIES ====================

export const getActiveVideoCapsule = tenantQuery({
  args: {},
  handler: async (ctx, _args, tenancy) => {
    const capsule = await ctx.db
      .query("videoCapsules")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq("isActive", true))
      .first();
    return capsule;
  },
});

// ==================== PHOTO MUTATIONS ====================

export const createPhoto = tenantMutation({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    return await ctx.db.insert("photos", {
      ...args,
      institutionId: tenancy.institution._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deletePhoto = tenantMutation({
  args: { id: v.id("photos") },
  handler: async (ctx, { id }, tenancy) => {
    ensureInstitutionMatch(await ctx.db.get(id), tenancy, "Photo not found");
    await ctx.db.delete(id);
  },
});

// ==================== VIDEO MUTATIONS ====================

export const createVideo = tenantMutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    return await ctx.db.insert("videos", {
      ...args,
      isPublic: args.isPublic ?? false,
      institutionId: tenancy.institution._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateVideo = tenantMutation({
  args: {
    id: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }, tenancy) => {
    ensureInstitutionMatch(await ctx.db.get(id), tenancy, "Video not found");
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteVideo = tenantMutation({
  args: { id: v.id("videos") },
  handler: async (ctx, { id }, tenancy) => {
    ensureInstitutionMatch(await ctx.db.get(id), tenancy, "Video not found");
    await ctx.db.delete(id);
  },
});

// ==================== VIDEO CAPSULE MUTATIONS ====================

export const updateVideoCapsule = tenantMutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args, tenancy) => {
    const existing = await ctx.db
      .query("videoCapsules")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .first();
    const now = Date.now();

    if (existing) {
      ensureInstitutionMatch(existing, tenancy, "Video capsule not found");
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("videoCapsules", {
        ...args,
        institutionId: tenancy.institution._id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
