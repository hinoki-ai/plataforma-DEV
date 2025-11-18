import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Media and Communication Schema
 *
 * Handles photos, videos, documents, voting systems, and notifications.
 */

export const photos = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  url: v.string(),
  uploadedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_uploadedBy", ["uploadedBy"])
  .index("by_createdAt", ["createdAt"]);

export const videos = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  description: v.optional(v.string()),
  url: v.string(),
  thumbnail: v.optional(v.string()),
  category: v.optional(v.string()),
  tags: v.optional(v.any()), // JSON array
  isPublic: v.boolean(),
  uploadedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_uploadedBy", ["uploadedBy"])
  .index("by_category", ["category"])
  .index("by_isPublic", ["isPublic"]);

export const videoCapsules = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  description: v.optional(v.string()),
  url: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_isActive", ["isActive"]);

export const votes = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  description: v.optional(v.string()),
  category: v.union(
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
  ),
  endDate: v.number(),
  isActive: v.boolean(),
  isPublic: v.boolean(),
  allowMultipleVotes: v.boolean(),
  maxVotesPerUser: v.optional(v.union(v.float64(), v.null())),
  requireAuthentication: v.boolean(),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_createdBy", ["createdBy"])
  .index("by_category", ["category"])
  .index("by_isActive", ["isActive"])
  .index("by_endDate", ["endDate"]);

export const voteOptions = defineTable({
  institutionId: v.id("institutionInfo"),
  text: v.string(),
  voteId: v.id("votes"),
  createdAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_voteId", ["voteId"]);

export const voteResponses = defineTable({
  institutionId: v.id("institutionInfo"),
  voteId: v.id("votes"),
  optionId: v.id("voteOptions"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_voteId", ["voteId"])
  .index("by_optionId", ["optionId"])
  .index("by_userId", ["userId"])
  .index("by_voteId_userId", ["voteId", "userId"]);

export const documents = defineTable({
  institutionId: v.id("institutionInfo"),
  name: v.string(),
  originalName: v.string(),
  fileId: v.id("_storage"),
  type: v.string(), // "pdf", "document", etc.
  category: v.string(), // "reglamento", "plan", "manual", "protocolo", etc.
  number: v.optional(v.number()), // for numbered documents
  size: v.number(),
  mimeType: v.string(),
  uploadedBy: v.id("users"),
  isPublic: v.boolean(), // public access or role-based
  downloadCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_category", ["category"])
  .index("by_uploadedBy", ["uploadedBy"])
  .index("by_isPublic", ["isPublic"])
  .index("by_createdAt", ["createdAt"]);

export const notifications = defineTable({
  institutionId: v.id("institutionInfo"),
  title: v.string(),
  message: v.string(),
  type: v.union(
    v.literal("INFO"),
    v.literal("SUCCESS"),
    v.literal("WARNING"),
    v.literal("ERROR"),
    v.literal("SYSTEM"),
  ),
  category: v.optional(
    v.union(
      v.literal("MEETING"),
      v.literal("VOTING"),
      v.literal("SYSTEM"),
      v.literal("ACADEMIC"),
      v.literal("ADMINISTRATIVE"),
      v.literal("PERSONAL"),
    ),
  ),
  priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
  read: v.boolean(),
  readAt: v.optional(v.number()),
  actionUrl: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  senderId: v.id("users"),
  recipientId: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_institutionId", ["institutionId"])
  .index("by_recipientId", ["recipientId"])
  .index("by_read", ["read"])
  .index("by_createdAt", ["createdAt"])
  .index("by_expiresAt", ["expiresAt"])
  .index("by_recipientId_read", ["recipientId", "read"]);
