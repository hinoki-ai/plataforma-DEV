/**
 * Convex Adapter for NextAuth.js (Auth.js v5)
 * 
 * This adapter integrates Convex as the database backend for NextAuth authentication.
 * Based on: https://stack.convex.dev/nextauth-adapter
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ==================== USER OPERATIONS ====================

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user) return null;
    
    return {
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
      emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      role: user.role,
      isActive: user.isActive,
    };
  },
});

export const getUserById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id as Id<"users">);
    
    if (!user) return null;
    
    return {
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
      emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      role: user.role,
      isActive: user.isActive,
    };
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      image: args.image,
      emailVerified: args.emailVerified,
      role: "PARENT", // Default role for OAuth users
      isActive: true,
      isOAuthUser: true,
      password: undefined,
      phone: undefined,
      parentRole: undefined,
      status: "ACTIVE",
      provider: undefined,
      createdByAdmin: undefined,
      createdAt: now,
      updatedAt: now,
    });
    
    return userId;
  },
});

export const updateUser = mutation({
  args: {
    id: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = args.id as Id<"users">;
    const user = await ctx.db.get(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(userId, {
      email: args.email,
      name: args.name,
      image: args.image,
      emailVerified: args.emailVerified,
      updatedAt: Date.now(),
    });
    
    return userId;
  },
});

export const deleteUser = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id as Id<"users">);
  },
});

// ==================== ACCOUNT OPERATIONS ====================

export const linkAccount = mutation({
  args: {
    userId: v.string(),
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
    const accountId = await ctx.db.insert("accounts", {
      userId: args.userId as Id<"users">,
      type: args.type,
      provider: args.provider,
      providerAccountId: args.providerAccountId,
      refresh_token: args.refresh_token,
      access_token: args.access_token,
      expires_at: args.expires_at,
      token_type: args.token_type,
      scope: args.scope,
      id_token: args.id_token,
      session_state: args.session_state,
    });
    
    return accountId;
  },
});

export const getAccountByProvider = query({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, { provider, providerAccountId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_provider_providerAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .first();
    
    if (!account) return null;
    
    return {
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refresh_token ?? null,
      access_token: account.access_token ?? null,
      expires_at: account.expires_at ?? null,
      token_type: account.token_type ?? null,
      scope: account.scope ?? null,
      id_token: account.id_token ?? null,
      session_state: account.session_state ?? null,
    };
  },
});

export const deleteAccount = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, { provider, providerAccountId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_provider_providerAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .first();
    
    if (account) {
      await ctx.db.delete(account._id);
    }
  },
});

// ==================== SESSION OPERATIONS ====================

export const createSession = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      sessionToken: args.sessionToken,
      userId: args.userId as Id<"users">,
      expires: args.expires,
    });
    
    return sessionId;
  },
});

export const getSessionAndUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .first();
    
    if (!session) return null;
    
    // Check if session is expired
    if (session.expires < Date.now()) {
      return null;
    }
    
    const user = await ctx.db.get(session.userId);
    
    if (!user) return null;
    
    return {
      session: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: new Date(session.expires),
      },
      user: {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        role: user.role,
        isActive: user.isActive,
      },
    };
  },
});

export const updateSession = mutation({
  args: {
    sessionToken: v.string(),
    expires: v.optional(v.number()),
  },
  handler: async (ctx, { sessionToken, expires }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .first();
    
    if (!session) {
      throw new Error("Session not found");
    }
    
    if (expires) {
      await ctx.db.patch(session._id, { expires });
    }
    
    return session._id;
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

// ==================== VERIFICATION TOKEN OPERATIONS ====================

export const createVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    const tokenId = await ctx.db.insert("verificationTokens", {
      identifier: args.identifier,
      token: args.token,
      expires: args.expires,
    });
    
    return tokenId;
  },
});

export const useVerificationToken = query({
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
    
    if (!verificationToken) return null;
    
    // Check if token is expired
    if (verificationToken.expires < Date.now()) {
      return null;
    }
    
    return {
      identifier: verificationToken.identifier,
      token: verificationToken.token,
      expires: new Date(verificationToken.expires),
    };
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
