/**
 * AI Assistant Schema
 *
 * Schema for the AI assistant functionality including vector search
 * for document chunks and conversation history.
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
});
