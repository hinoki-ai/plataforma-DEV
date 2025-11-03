/**
 * User Queries and Mutations
 * Handles user authentication and management
 *
 * ⚠️ DEPRECATED: User management has been migrated to Clerk
 * This file is kept for backward compatibility and data migration purposes.
 * New user operations should use the Clerk API directly.
 */

import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import {
  hashUserPassword,
  logUserCreation,
  UserCreationError,
  type BaseUserData,
} from "../src/lib/user-creation";

const ROLE_VALUES = [
  "MASTER",
  "ADMIN",
  "PROFESOR",
  "PARENT",
  "PUBLIC",
] as const;

type RoleValue = (typeof ROLE_VALUES)[number];

function normalizeRole(role: unknown, fallback: RoleValue): RoleValue {
  return ROLE_VALUES.includes(role as RoleValue)
    ? (role as RoleValue)
    : fallback;
}

function extractPrimaryEmail(data: any): string | null {
  const primaryId = data?.primary_email_address_id;
  const emails: any[] = data?.email_addresses ?? [];
  const primary = emails.find((item) => item.id === primaryId) ?? emails[0];
  return primary?.email_address ?? null;
}

function extractUserName(data: any): string | null {
  const first = data?.first_name ?? "";
  const last = data?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  if (full.length > 0) return full;
  return data?.username ?? null;
}

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

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const currentSession = query({
  args: { version: v.optional(v.number()) },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !user.isActive) {
      return null;
    }

    const needsRegistration = await requiresParentRegistration(ctx, user);

    return {
      user: {
        id: user._id,
        clerkId: identity.subject,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        role: user.role,
        needsRegistration,
        isOAuthUser: user.isOAuthUser ?? false,
      },
      expires: undefined,
    };
  },
});

export const syncFromClerk = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkId = data?.id as string | undefined;
    const email = extractPrimaryEmail(data);

    if (!clerkId || !email) {
      console.warn("Clerk sync missing identifiers", { clerkId, email });
      return;
    }

    const name = extractUserName(data);
    const image = data?.image_url ?? null;
    const now = Date.now();
    const metadataRole =
      data?.public_metadata?.role ?? data?.private_metadata?.role;
    const isOAuthUser = Array.isArray(data?.external_accounts)
      ? data.external_accounts.length > 0
      : false;
    const isBanned = Boolean(data?.banned);

    const existingByClerk = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingByClerk) {
      const normalizedRole = normalizeRole(
        metadataRole,
        existingByClerk.role as RoleValue,
      );
      await ctx.db.patch(existingByClerk._id, {
        email,
        name: name ?? existingByClerk.name,
        image: image ?? existingByClerk.image,
        role: normalizedRole,
        isOAuthUser,
        isActive: !isBanned,
        updatedAt: now,
      });
      return;
    }

    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingByEmail) {
      const normalizedRole = normalizeRole(
        metadataRole,
        existingByEmail.role as RoleValue,
      );
      await ctx.db.patch(existingByEmail._id, {
        clerkId,
        name: name ?? existingByEmail.name,
        image: image ?? existingByEmail.image,
        role: normalizedRole,
        isOAuthUser,
        isActive: !isBanned,
        updatedAt: now,
      });
      return;
    }

    const normalizedRole = normalizeRole(metadataRole, "PUBLIC");
    await ctx.db.insert("users", {
      email,
      name: name ?? email,
      image,
      role: normalizedRole,
      isActive: !isBanned,
      parentRole: undefined,
      status: "ACTIVE",
      provider: isOAuthUser ? "oauth" : "clerk",
      isOAuthUser,
      clerkId,
      createdByAdmin: undefined,
      createdAt: now,
      updatedAt: now,
      emailVerified: undefined,
      password: undefined,
      phone: undefined,
    });
  },
});

export const disableUserFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      console.warn("Unable to disable user from Clerk sync; user not found", {
        clerkId,
      });
      return;
    }

    await ctx.db.patch(user._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
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

/**
 * Get parent profile by user ID
 */
export const getParentProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("parentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
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
    institutionId: v.optional(v.id("institutionInfo")),
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
    try {
      const now = Date.now();

      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existingUser) {
        throw UserCreationError.userAlreadyExists(args.email);
      }

      // Prepare user data with standardized processing
      const userData = {
        name: args.name || args.email,
        email: args.email,
        password: args.password,
        phone: args.phone,
        role: args.role,
        image: args.image,
        provider: args.provider,
        isOAuthUser: args.isOAuthUser ?? false,
        createdByAdmin: args.createdByAdmin,
        parentRole: args.parentRole,
        currentInstitutionId: args.institutionId,
        status: args.status ?? "ACTIVE",
      };

      // Hash password if provided (skip for OAuth users without passwords)
      let processedPassword = userData.password;
      if (processedPassword && !userData.isOAuthUser) {
        processedPassword = await hashUserPassword(processedPassword);
      }

      // Normalize role
      const normalizedRole = normalizeRole(userData.role, "PUBLIC");

      const userId = await ctx.db.insert("users", {
        ...userData,
        password: processedPassword,
        role: normalizedRole,
        isActive: true,
        emailVerified: undefined,
        createdAt: now,
        updatedAt: now,
      });

      // Log successful user creation
      logUserCreation("createUser", userData, userData.createdByAdmin, true);

      return userId;
    } catch (error) {
      // Log failed user creation
      logUserCreation(
        "createUser",
        { email: args.email, role: args.role },
        args.createdByAdmin,
        false,
        error,
      );

      // Re-throw standardized errors
      if (error instanceof UserCreationError) {
        throw error;
      }

      // Wrap unexpected errors
      throw new UserCreationError(
        "Error interno al crear usuario",
        "INTERNAL_ERROR",
        500,
        { originalError: error },
      );
    }
  },
});

export const linkClerkIdentity = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx, { userId, clerkId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found while linking Clerk identity");
    }

    if (user.clerkId === clerkId) {
      return userId;
    }

    await ctx.db.patch(userId, {
      clerkId,
      updatedAt: Date.now(),
    });

    return userId;
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
    institutionId: v.optional(v.id("institutionInfo")),
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
    try {
      // Check if user already exists
      const existingUser = await ctx.runQuery(api.users.getUserByEmail, {
        email: args.email,
      });

      if (existingUser) {
        throw UserCreationError.userAlreadyExists(args.email);
      }

      // Use the internal mutation to create the user
      return await ctx.runMutation(api.users.createUser, args);
    } catch (error) {
      // Log failed user creation
      logUserCreation(
        "createUserAction",
        { email: args.email, role: args.role },
        args.createdByAdmin,
        false,
        error,
      );

      // Re-throw standardized errors
      if (error instanceof UserCreationError) {
        throw error;
      }

      // Wrap unexpected errors
      throw new UserCreationError(
        "Error interno al crear usuario",
        "INTERNAL_ERROR",
        500,
        { originalError: error },
      );
    }
  },
});

async function requiresParentRegistration(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"users">,
) {
  if (user.role !== "PARENT") return false;
  if (!user.isOAuthUser) return false;

  try {
    const profile = await ctx.db
      .query("parentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return !profile?.registrationComplete;
  } catch (error) {
    console.warn("Failed to check parent registration status", {
      userId: user._id,
      error,
    });
    return true;
  }
}

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
    institutionId: v.optional(v.id("institutionInfo")),
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
 * Remove Clerk ID from user (emergency recovery)
 */
export const removeClerkId = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      clerkId: undefined,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
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

/**
 * Get users by role
 */
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("MASTER"),
      v.literal("ADMIN"),
      v.literal("PROFESOR"),
      v.literal("PARENT"),
      v.literal("PUBLIC"),
    ),
  },
  handler: async (ctx, { role }) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", role))
      .collect();

    // Return only active users
    return users.filter((u) => u.isActive);
  },
});

/**
 * Register parent with complete profile and student information
 * This creates: User account + Parent Profile + Student record
 */
export const registerParentComplete = mutation({
  args: {
    // User fields
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.string(),

    // Parent profile fields
    rut: v.string(),
    address: v.string(),
    region: v.string(),
    comuna: v.string(),
    relationship: v.string(),
    emergencyContact: v.string(),
    emergencyPhone: v.string(),
    secondaryEmergencyContact: v.optional(v.string()),
    secondaryEmergencyPhone: v.optional(v.string()),
    tertiaryEmergencyContact: v.optional(v.string()),
    tertiaryEmergencyPhone: v.optional(v.string()),

    // Student fields
    childName: v.string(),
    childGrade: v.string(),

    // Institution
    institutionId: v.optional(v.id("institutionInfo")),

    // Optional OAuth fields
    provider: v.optional(v.string()),
    isOAuthUser: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.institutionId) {
      throw new Error("institutionId is required");
    }
    try {
      const now = Date.now();

      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existingUser) {
        throw UserCreationError.userAlreadyExists(args.email);
      }

      // Hash password using standardized function
      const hashedPassword = await hashUserPassword(args.password);

      // 1. Create user account
      const userId = await ctx.db.insert("users", {
        name: args.fullName,
        email: args.email,
        password: hashedPassword,
        phone: args.phone,
        role: "PARENT",
        parentRole: args.relationship,
        currentInstitutionId: args.institutionId,
        isActive: true,
        isOAuthUser: args.isOAuthUser ?? false,
        provider: args.provider,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });

      // 2. Create parent profile
      await ctx.db.insert("parentProfiles", {
        institutionId: args.institutionId!,
        userId,
        rut: args.rut,
        address: args.address,
        region: args.region,
        comuna: args.comuna,
        relationship: args.relationship,
        emergencyContact: args.emergencyContact,
        emergencyPhone: args.emergencyPhone,
        secondaryEmergencyContact: args.secondaryEmergencyContact,
        secondaryEmergencyPhone: args.secondaryEmergencyPhone,
        tertiaryEmergencyContact: args.tertiaryEmergencyContact,
        tertiaryEmergencyPhone: args.tertiaryEmergencyPhone,
        registrationComplete: true,
        createdAt: now,
        updatedAt: now,
      });

      // 3. Create student record
      // Parse child name into firstName and lastName
      const nameParts = args.childName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Get first available teacher (or use a default admin user)
      const teachers = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "PROFESOR"))
        .first();

      // If no teacher exists, use first admin
      let teacherId = teachers?._id;
      if (!teacherId) {
        const admin = await ctx.db
          .query("users")
          .withIndex("by_role", (q) => q.eq("role", "ADMIN"))
          .first();
        teacherId = admin?._id;
      }

      if (!teacherId) {
        throw new Error("No teacher or admin found to assign student");
      }

      const studentId = await ctx.db.insert("students", {
        institutionId: args.institutionId!,
        firstName,
        lastName,
        birthDate: now, // Will be updated later with actual birthdate
        grade: args.childGrade,
        enrollmentDate: now,
        emergencyContact: args.emergencyContact,
        emergencyPhone: args.emergencyPhone,
        teacherId,
        parentId: userId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Log successful parent registration
      logUserCreation(
        "registerParentComplete",
        {
          email: args.email,
          role: "PARENT",
          name: args.fullName,
        },
        undefined,
        true,
      );

      return {
        userId,
        studentId,
        success: true,
      };
    } catch (error) {
      // Log failed parent registration
      logUserCreation(
        "registerParentComplete",
        {
          email: args.email,
          role: "PARENT",
          name: args.fullName,
        },
        undefined,
        false,
        error,
      );

      // Re-throw standardized errors
      if (error instanceof UserCreationError) {
        throw error;
      }

      // Wrap unexpected errors
      throw new UserCreationError(
        "Error interno al registrar padre",
        "INTERNAL_ERROR",
        500,
        { originalError: error },
      );
    }
  },
});
