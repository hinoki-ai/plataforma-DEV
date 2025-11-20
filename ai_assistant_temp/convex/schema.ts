import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pages: defineTable({
    url: v.string(),
    title: v.optional(v.string()),
    content: v.string(),
    embedding: v.array(v.float64()),
    chunkIdx: v.number(),
    createdAt: v.optional(v.number()),
  }).searchIndex("byEmbedding", { vector: "embedding" }),
});
