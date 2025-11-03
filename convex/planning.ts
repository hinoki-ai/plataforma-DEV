/**
 * Planning Document Queries and Mutations
 */

import { v } from "convex/values";
import { tenantQuery, tenantMutation } from "./tenancy";

// ==================== QUERIES ====================

export const getPlanningDocuments = tenantQuery({
  args: {
    authorId: v.optional(v.id("users")),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, { authorId, subject, grade }, tenancy) => {
    let queryBuilder = ctx.db
      .query("planningDocuments")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      );

    if (authorId) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("authorId", authorId));
    }

    if (subject) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("subject", subject));
    }

    if (grade) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("grade", grade));
    }

    const allDocs = await queryBuilder.collect();
    return allDocs.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  },
});

export const getPlanningDocumentById = tenantQuery({
  args: { id: v.id("planningDocuments") },
  handler: async (ctx, { id }, tenancy) => {
    const doc = await ctx.db.get(id);
    if (!doc || doc.institutionId !== tenancy.institution._id) return null;

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

export const createPlanningDocument = tenantMutation({
  args: {
    title: v.string(),
    content: v.string(),
    subject: v.string(),
    grade: v.string(),
    authorId: v.id("users"),
    attachments: v.optional(v.any()),
  },
  roles: ["ADMIN", "PROFESOR", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    return await ctx.db.insert("planningDocuments", {
      ...args,
      institutionId: tenancy.institution._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePlanningDocument = tenantMutation({
  args: {
    id: v.id("planningDocuments"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
    attachments: v.optional(v.any()),
  },
  roles: ["ADMIN", "PROFESOR", "STAFF", "MASTER"],
  handler: async (ctx, { id, ...updates }, tenancy) => {
    const existing = await ctx.db.get(id);
    if (!existing || existing.institutionId !== tenancy.institution._id) {
      throw new Error("Planning document not found");
    }

    const canEditAll =
      tenancy.isMaster ||
      tenancy.membershipRole === "ADMIN" ||
      tenancy.membershipRole === "STAFF";

    if (!canEditAll && existing.authorId !== tenancy.user._id) {
      throw new Error("No permission to edit this document");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deletePlanningDocument = tenantMutation({
  args: { id: v.id("planningDocuments") },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    const existing = await ctx.db.get(id);
    if (!existing || existing.institutionId !== tenancy.institution._id) {
      throw new Error("Planning document not found");
    }

    const canDeleteAll =
      tenancy.isMaster ||
      tenancy.membershipRole === "ADMIN" ||
      tenancy.membershipRole === "STAFF";

    if (!canDeleteAll) {
      throw new Error("No permission to delete planning documents");
    }

    await ctx.db.delete(id);
  },
});

/**
 * Get document statistics for admin dashboard
 */
export const getDocumentStats = tenantQuery({
  args: {},
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, _args, tenancy) => {
    const docs = await ctx.db
      .query("planningDocuments")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      total: docs.length,
      recent: docs.filter((d: any) => d.createdAt >= sevenDaysAgo).length,
    };
  },
});

/**
 * Get recent documents count (last 7 days)
 */
export const getRecentDocumentsCount = tenantQuery({
  args: {},
  handler: async (ctx, _args, tenancy) => {
    const docs = await ctx.db
      .query("planningDocuments")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return docs.filter((d: any) => d.updatedAt >= sevenDaysAgo).length;
  },
});
