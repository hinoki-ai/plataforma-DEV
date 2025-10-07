/**
 * Authentication-related queries and mutations
 * Handles OAuth accounts and sessions
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== ACCOUNT QUERIES ====================

export const getAccountByProvider = query({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, { provider, providerAccountId }) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_provider_providerAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .first();
  },
});

export const getAccountsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ==================== SESSION QUERIES ====================

export const getSessionByToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .first();
  },
});

export const getSessionsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ==================== ACCOUNT MUTATIONS ====================

export const createAccount = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", args);
  },
});

export const deleteAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ==================== SESSION MUTATIONS ====================

export const createSession = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", args);
  },
});

export const updateSession = mutation({
  args: {
    sessionToken: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, { sessionToken, expires }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, { expires });
    return await ctx.db.get(session._id);
  },
});

export const deleteSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const deleteExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sessions = await ctx.db.query("sessions").collect();
    
    const expired = sessions.filter((s) => s.expires < now);
    await Promise.all(expired.map((s) => ctx.db.delete(s._id)));
    
    return expired.length;
  },
});

// ==================== VERIFICATION TOKEN ====================

export const getVerificationToken = query({
  args: {
    identifier: v.string(),
    token: v.string(),
  },
  handler: async (ctx, { identifier, token }) => {
    return await ctx.db
      .query("verificationTokens")
      .withIndex("by_identifier_token", (q) =>
        q.eq("identifier", identifier).eq("token", token)
      )
      .first();
  },
});

export const createVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("verificationTokens", args);
  },
});

export const deleteVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
  },
  handler: async (ctx, { identifier, token }) => {
    const verificationToken = await ctx.db
      .query("verificationTokens")
      .withIndex("by_identifier_token", (q) =>
        q.eq("identifier", identifier).eq("token", token)
      )
      .first();

    if (verificationToken) {
      await ctx.db.delete(verificationToken._id);
    }
  },
});
