/**
 * Media (Photos & Videos) Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== PHOTO QUERIES ====================

export const getPhotos = query({
  args: {
    uploadedBy: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { uploadedBy, limit }) => {
    let allPhotos;

    if (uploadedBy) {
      allPhotos = await ctx.db
        .query("photos")
        .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", uploadedBy))
        .collect();
    } else {
      allPhotos = await ctx.db.query("photos").collect();
    }

    allPhotos.sort((a, b) => b.createdAt - a.createdAt);

    return limit ? allPhotos.slice(0, limit) : allPhotos;
  },
});

export const getPhotoById = query({
  args: { id: v.id("photos") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ==================== VIDEO QUERIES ====================

export const getVideos = query({
  args: {
    uploadedBy: v.optional(v.id("users")),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { uploadedBy, category, isPublic, limit }) => {
    let allVideos;

    if (uploadedBy) {
      allVideos = await ctx.db
        .query("videos")
        .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", uploadedBy))
        .collect();
    } else if (category) {
      allVideos = await ctx.db
        .query("videos")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    } else {
      allVideos = await ctx.db.query("videos").collect();
    }

    if (isPublic !== undefined) {
      allVideos = allVideos.filter((v) => v.isPublic === isPublic);
    }

    allVideos.sort((a, b) => b.createdAt - a.createdAt);
    return limit ? allVideos.slice(0, limit) : allVideos;
  },
});

export const getVideoById = query({
  args: { id: v.id("videos") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ==================== VIDEO CAPSULE QUERIES ====================

export const getActiveVideoCapsule = query({
  args: {},
  handler: async (ctx) => {
    const capsule = await ctx.db
      .query("videoCapsules")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .first();
    return capsule;
  },
});

// ==================== PHOTO MUTATIONS ====================

export const createPhoto = mutation({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("photos", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deletePhoto = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ==================== VIDEO MUTATIONS ====================

export const createVideo = mutation({
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
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("videos", {
      ...args,
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateVideo = mutation({
  args: {
    id: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteVideo = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ==================== VIDEO CAPSULE MUTATIONS ====================

export const updateVideoCapsule = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("videoCapsules").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("videoCapsules", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
