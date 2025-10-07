/**
 * Planning Document Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const getPlanningDocuments = query({
  args: {
    authorId: v.optional(v.id("users")),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, { authorId, subject, grade }) => {
    let allDocs;

    if (authorId) {
      allDocs = await ctx.db
        .query("planningDocuments")
        .withIndex("by_authorId", (q) => q.eq("authorId", authorId))
        .collect();
    } else if (subject) {
      allDocs = await ctx.db
        .query("planningDocuments")
        .withIndex("by_subject", (q) => q.eq("subject", subject))
        .collect();
    } else if (grade) {
      allDocs = await ctx.db
        .query("planningDocuments")
        .withIndex("by_grade", (q) => q.eq("grade", grade))
        .collect();
    } else {
      allDocs = await ctx.db.query("planningDocuments").collect();
    }

    return allDocs.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getPlanningDocumentById = query({
  args: { id: v.id("planningDocuments") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;

    // Populate author information
    const author = await ctx.db.get(doc.authorId);
    if (!author) return null;

    return {
      ...doc,
      author: {
        id: author._id,
        name: author.name || author.email,
        email: author.email,
      },
    };
  },
});

// ==================== MUTATIONS ====================

export const createPlanningDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    subject: v.string(),
    grade: v.string(),
    authorId: v.id("users"),
    attachments: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("planningDocuments", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePlanningDocument = mutation({
  args: {
    id: v.id("planningDocuments"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
    attachments: v.optional(v.any()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deletePlanningDocument = mutation({
  args: { id: v.id("planningDocuments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/**
 * Get document statistics for admin dashboard
 */
export const getDocumentStats = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("planningDocuments").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      total: docs.length,
      recent: docs.filter((d) => d.createdAt >= sevenDaysAgo).length,
    };
  },
});

/**
 * Get recent documents count (last 7 days)
 */
export const getRecentDocumentsCount = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("planningDocuments").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return docs.filter((d) => d.updatedAt >= sevenDaysAgo).length;
  },
});
