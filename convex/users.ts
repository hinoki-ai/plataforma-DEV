/**
 * User Queries and Mutations
 * Handles user authentication and management
 */

import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// ==================== QUERIES ====================

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

/**
 * Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

/**
 * Get all users with optional role filter
 */
export const getUsers = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("MASTER"),
        v.literal("ADMIN"),
        v.literal("PROFESOR"),
        v.literal("PARENT"),
        v.literal("PUBLIC"),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { role, isActive }) => {
    let allUsers;

    if (role !== undefined) {
      allUsers = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", role))
        .collect();
    } else {
      allUsers = await ctx.db.query("users").collect();
    }

    if (isActive !== undefined) {
      return allUsers.filter((u) => u.isActive === isActive);
    }

    return allUsers;
  },
});

/**
 * Get user count by role
 */
export const getUserCountByRole = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const counts = {
      MASTER: 0,
      ADMIN: 0,
      PROFESOR: 0,
      PARENT: 0,
      PUBLIC: 0,
      total: users.length,
    };

    users.forEach((user) => {
      if (user.role in counts) {
        counts[user.role as keyof typeof counts]++;
      }
    });

    return counts;
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new user (internal mutation)
 */
export const createUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    password: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("MASTER"),
      v.literal("ADMIN"),
      v.literal("PROFESOR"),
      v.literal("PARENT"),
      v.literal("PUBLIC"),
    ),
    image: v.optional(v.string()),
    provider: v.optional(v.string()),
    isOAuthUser: v.optional(v.boolean()),
    createdByAdmin: v.optional(v.string()),
    parentRole: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("ACTIVE"),
        v.literal("INACTIVE"),
        v.literal("SUSPENDED"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await ctx.db.insert("users", {
      ...args,
      isActive: true,
      isOAuthUser: args.isOAuthUser ?? false,
      status: args.status ?? "ACTIVE",
      emailVerified: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Create a new user (public action for admin/master user creation)
 */
export const createUserAction: any = action({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    password: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("MASTER"),
      v.literal("ADMIN"),
      v.literal("PROFESOR"),
      v.literal("PARENT"),
      v.literal("PUBLIC"),
    ),
    image: v.optional(v.string()),
    provider: v.optional(v.string()),
    isOAuthUser: v.optional(v.boolean()),
    createdByAdmin: v.optional(v.string()),
    parentRole: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("ACTIVE"),
        v.literal("INACTIVE"),
        v.literal("SUSPENDED"),
      ),
    ),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    // Check if user already exists
    const existingUser = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Use the internal mutation to create the user
    return await ctx.runMutation(api.users.createUser, args);
  },
});

/**
 * Update user
 */
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("MASTER"),
        v.literal("ADMIN"),
        v.literal("PROFESOR"),
        v.literal("PARENT"),
        v.literal("PUBLIC"),
      ),
    ),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("ACTIVE"),
        v.literal("INACTIVE"),
        v.literal("SUSPENDED"),
      ),
    ),
    parentRole: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const user = await ctx.db.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    // If updating email, check for duplicates
    if (updates.email && updates.email !== user.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existingUser) {
        throw new Error("Email already in use");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Delete user
 */
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/**
 * Authenticate user (verify credentials)
 */
export const authenticateUser = query({
  args: {
    email: v.string(),
    passwordHash: v.string(), // Pre-hashed password
  },
  handler: async (ctx, { email, passwordHash }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user || !user.password) {
      return null;
    }

    // Password comparison should be done on the client side before calling
    if (user.password !== passwordHash) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
  },
});

/**
 * Update user's last login
 */
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get user statistics for admin dashboard
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      profesores: users.filter((u) => u.role === "PROFESOR").length,
      parents: users.filter((u) => u.role === "PARENT").length,
      recent: users.filter((u) => u.createdAt >= thirtyDaysAgo).length,
    };
  },
});

/**
 * Get staff users (ADMIN + PROFESOR) with email
 */
export const getStaffUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => (u.role === "ADMIN" || u.role === "PROFESOR") && u.email)
      .map((u) => ({ email: u.email, name: u.name }));
  },
});
