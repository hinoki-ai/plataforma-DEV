/**
 * Create admin user - Run this from Convex dashboard
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdminUser = mutation({
  args: {
    email: v.string(),
    password: v.string(), // Pre-hashed with bcrypt
    name: v.string(),
  },
  handler: async (ctx, { email, password, name }) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Create admin user
    const userId = await ctx.db.insert("users", {
      email,
      password,
      name,
      role: "ADMIN",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, email, name, role: "ADMIN" };
  },
});
