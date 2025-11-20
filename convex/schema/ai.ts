/**
 * Cognito AI Assistant Schema
 *
 * Schema for the Cognito AI assistant functionality including vector search
 * for document chunks and conversation history with Groq/Llama integration.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pages = defineTable({
  url: v.string(),
  title: v.optional(v.string()),
  content: v.string(),
  embedding: v.array(v.float64()),
  chunkIdx: v.number(),
  createdAt: v.optional(v.number()),
})
  .index("by_url", ["url"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI text-embedding-3-large dimensions
    filterFields: [], // No filters needed for basic search
  });
