import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// ==================== QUERIES ====================

/**
 * Public query: Get institution branding by email (for login page)
 * No authentication required - safe for public use
 */
export const getInstitutionBranding = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user || !user.currentInstitutionId) {
      return null;
    }

    // Fetch institution details
    const institution = await ctx.db.get(user.currentInstitutionId);
    if (!institution || !institution.isActive) {
      return null;
    }

    // Return only safe branding info (no private data)
    return {
      name: institution.name,
      logoUrl: institution.logoUrl ?? null,
      institutionType: institution.institutionType,
    };
  },
});

export const getSchoolInfo = query({
  args: {},
  handler: async (ctx) => {
    // Get the first institution info record (assuming single institution setup)
    const institutionInfo = await ctx.db.query("institutionInfo").first();
    return institutionInfo;
  },
});

export const getAllInstitutions = query({
  args: {},
  handler: async (ctx) => {
    const institutions = await ctx.db.query("institutionInfo").collect();
    return institutions;
  },
});

export const getInstitutionCount = query({
  args: {},
  handler: async (ctx) => {
    const institutions = await ctx.db.query("institutionInfo").collect();
    return institutions.length;
  },
});

export const getInstitutionById = query({
  args: { institutionId: v.id("institutionInfo") },
  handler: async (ctx, args) => {
    const institution = await ctx.db.get(args.institutionId);
    return institution;
  },
});

/**
 * Get all institutions a user is a member of
 */
export const getUserInstitutions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get all memberships for this user
    const memberships = await ctx.db
      .query("institutionMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get institution details for each membership
    const institutionsWithMemberships = await Promise.all(
      memberships
        .filter((membership) => membership.institutionId)
        .map(async (membership) => {
          const institution = await ctx.db.get(membership.institutionId!);
          return {
            institution,
            membership: {
              _id: membership._id,
              role: membership.role,
              status: membership.status,
              joinedAt: membership.joinedAt,
            },
          };
        }),
    );

    return institutionsWithMemberships.filter(
      (item) => item.institution !== null && item.institution.isActive,
    );
  },
});

/**
 * Get user's active institutions (where status is ACTIVE)
 */
export const getUserActiveInstitutions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query("institutionMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const activeMemberships = memberships.filter((m) => m.status === "ACTIVE");

    const institutionsWithMemberships = await Promise.all(
      activeMemberships
        .filter((membership) => membership.institutionId)
        .map(async (membership) => {
          const institution = await ctx.db.get(membership.institutionId!);
          return {
            institution,
            membership: {
              _id: membership._id,
              role: membership.role,
              status: membership.status,
              joinedAt: membership.joinedAt,
            },
          };
        }),
    );

    return institutionsWithMemberships.filter(
      (item) => item.institution !== null && item.institution.isActive,
    );
  },
});

export const getInstitutionUsers = query({
  args: { institutionId: v.id("institutionInfo") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("institutionMemberships")
      .withIndex("by_institutionId", (q) =>
        q.eq("institutionId", args.institutionId),
      )
      .collect();

    const usersWithRoles = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        if (!user) return null;
        return {
          ...user,
          role: m.role, // Use role from membership
          status: m.status,
          membershipId: m._id,
        };
      }),
    );

    return usersWithRoles.filter((u) => u !== null);
  },
});

// ==================== MUTATIONS ====================

export const createOrUpdateSchoolInfo = mutation({
  args: {
    name: v.string(),
    mission: v.string(),
    vision: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.string(),
    logoUrl: v.optional(v.string()),
    institutionType: v.union(
      v.literal("PRESCHOOL"),
      v.literal("BASIC_SCHOOL"),
      v.literal("HIGH_SCHOOL"),
      v.literal("TECHNICAL_INSTITUTE"),
      v.literal("TECHNICAL_CENTER"),
      v.literal("COLLEGE"),
      v.literal("UNIVERSITY"),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if institution info already exists
    const existing = await ctx.db.query("institutionInfo").first();

    const now = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new record
      const newId = await ctx.db.insert("institutionInfo", {
        ...args,
        createdAt: now,
        updatedAt: now,
        isActive: args.isActive ?? true,
      });
      return newId;
    }
  },
});

export const createInstitution = mutation({
  args: {
    name: v.string(),
    mission: v.string(),
    vision: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.string(),
    logoUrl: v.optional(v.string()),
    institutionType: v.union(
      v.literal("PRESCHOOL"),
      v.literal("BASIC_SCHOOL"),
      v.literal("HIGH_SCHOOL"),
      v.literal("TECHNICAL_INSTITUTE"),
      v.literal("TECHNICAL_CENTER"),
      v.literal("COLLEGE"),
      v.literal("UNIVERSITY"),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("institutionInfo", {
      ...args,
      createdAt: now,
      updatedAt: now,
      isActive: args.isActive ?? true,
    });
  },
});

export const createInstitutionWithAdmins = mutation({
  args: {
    institution: v.object({
      name: v.string(),
      mission: v.string(),
      vision: v.string(),
      address: v.string(),
      phone: v.string(),
      email: v.string(),
      website: v.string(),
      logoUrl: v.optional(v.string()),
      branding: v.optional(
        v.object({
          primaryColor: v.string(),
          secondaryColor: v.string(),
          faviconUrl: v.optional(v.string()),
        }),
      ),
      institutionType: v.union(
        v.literal("PRESCHOOL"),
        v.literal("BASIC_SCHOOL"),
        v.literal("HIGH_SCHOOL"),
        v.literal("TECHNICAL_INSTITUTE"),
        v.literal("TECHNICAL_CENTER"),
        v.literal("UNIVERSITY"),
      ),
      supportedLevels: v.optional(v.any()),
      customGrades: v.optional(v.any()),
      customSubjects: v.optional(v.any()),
      educationalConfig: v.optional(v.any()),
      isActive: v.optional(v.boolean()),
      billingPlan: v.optional(v.string()),
      billingStatus: v.optional(
        v.union(
          v.literal("TRIAL"),
          v.literal("ACTIVE"),
          v.literal("PAST_DUE"),
          v.literal("CANCELLED"),
        ),
      ),
      billingPeriodEndsAt: v.optional(v.number()),
    }),
    admins: v.array(
      v.object({
        name: v.string(),
        email: v.string(),
        password: v.string(),
        phone: v.optional(v.string()),
        role: v.optional(v.union(v.literal("ADMIN"), v.literal("MASTER"))),
        isPrimary: v.optional(v.boolean()),
      }),
    ),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { institution, admins, createdBy } = args;

    if (!admins.length) {
      throw new Error(
        "At least one administrator is required to create an institution",
      );
    }

    if (!admins.some((admin) => admin.isPrimary)) {
      throw new Error("Institution creation requires a primary administrator");
    }

    // Ensure no duplicate administrator emails are submitted
    const normalizedEmails = new Set<string>();
    for (const admin of admins) {
      const email = admin.email.trim().toLowerCase();
      if (normalizedEmails.has(email)) {
        throw new Error(
          `Duplicate administrator email detected: ${admin.email}`,
        );
      }
      normalizedEmails.add(email);

      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", admin.email))
        .first();
      if (existingUser) {
        throw new Error(
          `Cannot create administrator ${admin.email} because the email is already in use`,
        );
      }
    }

    // Ensure institution name is unique to avoid accidental duplicates
    const existingInstitution = await ctx.db
      .query("institutionInfo")
      .withIndex("by_name", (q) => q.eq("name", institution.name))
      .first();

    if (existingInstitution) {
      throw new Error(
        `An institution with the name "${institution.name}" already exists`,
      );
    }

    const now = Date.now();
    const institutionId = await ctx.db.insert("institutionInfo", {
      ...institution,
      createdAt: now,
      updatedAt: now,
      isActive: institution.isActive ?? true,
    });

    const createdUserIds: Id<"users">[] = [];
    const createdMembershipIds: Id<"institutionMemberships">[] = [];
    const adminResults: Array<{
      email: string;
      userId: Id<"users">;
      membershipId: Id<"institutionMemberships">;
      role: "ADMIN" | "MASTER";
      isPrimary: boolean;
    }> = [];

    try {
      for (const admin of admins) {
        const role = admin.role ?? "ADMIN";
        const userId = await ctx.runMutation(api.users.createUser, {
          name: admin.name,
          email: admin.email,
          password: admin.password,
          phone: admin.phone,
          role,
          institutionId,
          createdByAdmin: createdBy ? String(createdBy) : undefined,
        });

        createdUserIds.push(userId);

        const membershipId = await ctx.db.insert("institutionMemberships", {
          institutionId,
          userId,
          role: role === "MASTER" ? "ADMIN" : role,
          status: "ACTIVE",
          invitedBy: createdBy,
          joinedAt: now,
          lastAccessAt: now,
          metadata: {
            customFields: {
              isPrimary: String(admin.isPrimary ?? false),
              assignedByMaster: String(Boolean(createdBy)),
            },
          },
          createdAt: now,
          updatedAt: now,
        });

        createdMembershipIds.push(membershipId);

        adminResults.push({
          email: admin.email,
          userId,
          membershipId,
          role,
          isPrimary: admin.isPrimary ?? false,
        });
      }
    } catch (error) {
      // Roll back partially created data to keep database consistent
      for (const membershipId of createdMembershipIds) {
        await ctx.db.delete(membershipId);
      }

      for (const userId of createdUserIds) {
        await ctx.db.delete(userId);
      }

      await ctx.db.delete(institutionId);
      throw error;
    }

    const institutionDoc = await ctx.db.get(institutionId);

    return {
      success: true,
      institution: institutionDoc,
      admins: adminResults,
    };
  },
});

export const updateInstitution = mutation({
  args: {
    id: v.id("institutionInfo"),
    name: v.optional(v.string()),
    mission: v.optional(v.string()),
    vision: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    institutionType: v.optional(
      v.union(
        v.literal("PRESCHOOL"),
        v.literal("BASIC_SCHOOL"),
        v.literal("HIGH_SCHOOL"),
        v.literal("TECHNICAL_INSTITUTE"),
        v.literal("TECHNICAL_CENTER"),
        v.literal("UNIVERSITY"),
      ),
    ),
    supportedLevels: v.optional(v.any()),
    customGrades: v.optional(v.any()),
    customSubjects: v.optional(v.any()),
    educationalConfig: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateFields } = args;
    await ctx.db.patch(id, {
      ...updateFields,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteInstitution = mutation({
  args: { institutionId: v.id("institutionInfo") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.institutionId);
    return args.institutionId;
  },
});

/**
 * Switch user's current institution
 * Verifies that the user has an active membership in the target institution
 */
export const switchUserInstitution = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutionInfo"),
  },
  handler: async (ctx, { userId, institutionId }) => {
    // Get the user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Master users can switch to any institution
    if (user.role === "MASTER") {
      await ctx.db.patch(userId, {
        currentInstitutionId: institutionId,
        updatedAt: Date.now(),
      });
      return { success: true, message: "Institution switched successfully" };
    }

    // Verify the user has an active membership in the target institution
    const membership = await ctx.db
      .query("institutionMemberships")
      .withIndex("by_user_institution", (q: any) =>
        q.eq("userId", userId).eq("institutionId", institutionId),
      )
      .first();

    if (!membership) {
      throw new Error(
        "You are not a member of this institution. Please request access first.",
      );
    }

    if (membership.status !== "ACTIVE") {
      throw new Error(
        `Your membership in this institution is ${membership.status}. Only active members can switch to this institution.`,
      );
    }

    // Verify the institution exists and is active
    const institution = await ctx.db.get(institutionId);
    if (!institution) {
      throw new Error("Institution not found");
    }

    if (!institution.isActive) {
      throw new Error("This institution is not active");
    }

    // Update user's current institution
    await ctx.db.patch(userId, {
      currentInstitutionId: institutionId,
      updatedAt: Date.now(),
    });

    // Update membership lastAccessAt
    await ctx.db.patch(membership._id, {
      lastAccessAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Institution switched successfully",
      institution: {
        _id: institution._id,
        name: institution.name,
      },
      membership: {
        role: membership.role,
        status: membership.status,
      },
    };
  },
});
