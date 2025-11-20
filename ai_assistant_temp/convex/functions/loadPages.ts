import { action, internalMutation } from "convex/server";
import { v } from "convex/values";
import { embed } from "../lib/ai";
import { internal } from "../_generated/api";

export const savePage = internalMutation({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
    content: v.string(),
    embedding: v.array(v.float64()),
    chunkIdx: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const ingest = action({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
    text: v.string(),
    chunkIdx: v.number(),
  },
  handler: async (ctx, { url, title, text, chunkIdx }) => {
    // Compute embedding using Convex-provided embed wrapper
    const vector = await embed(ctx, "text-embedding-3-large", text);

    // Save to DB
    await ctx.runMutation(internal.functions.loadPages.savePage, {
      url,
      title,
      content: text,
      embedding: vector,
      chunkIdx,
    });

    return { ok: true };
  },
});
