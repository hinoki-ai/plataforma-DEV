import type { QueryCtx, MutationCtx } from "./_generated/server";
import { query, mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export const MEMBERSHIP_ROLES = [
  "ADMIN",
  "PROFESOR",
  "PARENT",
  "STAFF",
  "MENTOR",
] as const;

export const MEMBERSHIP_STATUSES = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "LEFT",
] as const;

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number] | "MASTER";
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface TenancyContext {
  user: Doc<"users">;
  institution: Doc<"institutionInfo">;
  membership: Doc<"institutionMemberships"> | null;
  membershipRole: MembershipRole;
  isMaster: boolean;
}

interface TenancyOptions {
  allowedRoles?: MembershipRole[];
  requireMembership?: boolean;
  allowMasterOverride?: boolean;
}

type AnyCtx = QueryCtx | MutationCtx;

async function requireActiveUser(ctx: AnyCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User record not found");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  return user;
}

async function findActiveMembership(
  ctx: AnyCtx,
  userId: Id<"users">,
): Promise<Doc<"institutionMemberships"> | null> {
  const memberships = await ctx.db
    .query("institutionMemberships")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  return (
    memberships.find((m) => m.status === "ACTIVE") ??
    memberships.find((m) => m.status === "INVITED") ??
    null
  );
}

export async function requireCurrentInstitution(
  ctx: AnyCtx,
  options: TenancyOptions = {},
): Promise<TenancyContext> {
  const {
    allowedRoles,
    requireMembership = true,
    allowMasterOverride = true,
  } = options;

  const user = await requireActiveUser(ctx);
  const isMaster = user.role === "MASTER";

  let membership: Doc<"institutionMemberships"> | null = null;
  let institutionId: Id<"institutionInfo"> | null = user.currentInstitutionId ?? null;

  if (institutionId) {
    membership = await ctx.db
      .query("institutionMemberships")
      .withIndex("by_user_institution", (q) =>
        q.eq("userId", user._id).eq("institutionId", institutionId!),
      )
      .first();
  }

  if ((!institutionId || (!membership && !isMaster)) && requireMembership) {
    const fallbackMembership = await findActiveMembership(ctx, user._id);
    if (fallbackMembership) {
      institutionId = fallbackMembership.institutionId;
      membership = fallbackMembership;
    }
  }

  if (!institutionId) {
    throw new Error("No institution selected");
  }

  const institution = await ctx.db.get(institutionId);
  if (!institution) {
    throw new Error("Institution not found");
  }

  if (requireMembership && !isMaster) {
    if (!membership) {
      throw new Error("Membership required for institution access");
    }

    if (membership.status !== "ACTIVE") {
      throw new Error("Membership is not active");
    }
  }

  const membershipRole: MembershipRole = isMaster
    ? "MASTER"
    : ((membership?.role as MembershipRole) ?? "PARENT");

  if (allowedRoles && allowedRoles.length > 0) {
    const allowed = new Set(allowedRoles);
    const masterAllowed = allowMasterOverride && allowed.has("MASTER");
    if (!(isMaster && masterAllowed)) {
      if (!membership) {
        throw new Error("Membership role required");
      }
      if (!allowed.has(membership.role as MembershipRole)) {
        throw new Error("Insufficient membership role");
      }
    }
  }

  return {
    user,
    institution,
    membership,
    membershipRole,
    isMaster,
  };
}

type TenantHandler<C extends AnyCtx, Result> = (
  ctx: C,
  args: any,
  tenancy: TenancyContext,
) => Promise<Result> | Result;

interface TenantDefinitionOptions<Result> extends TenancyOptions {
  args: Record<string, any>;
  handler: TenantHandler<any, Result>;
}

export function tenantQuery<Result>(options: TenantDefinitionOptions<Result>) {
  return query({
    args: options.args,
    handler: async (ctx, args) => {
      const tenancy = await requireCurrentInstitution(ctx, options);
      return options.handler(ctx, args, tenancy);
    },
  });
}

export function tenantMutation<Result>(
  options: TenantDefinitionOptions<Result>,
) {
  return mutation({
    args: options.args,
    handler: async (ctx, args) => {
      const tenancy = await requireCurrentInstitution(ctx, options);
      return options.handler(ctx, args, tenancy);
    },
  });
}

export async function ensureMembershipRole(
  tenancy: TenancyContext,
  roles: MembershipRole[],
  allowMasterOverride = true,
): Promise<void> {
  if (roles.length === 0) return;

  const allowed = new Set(roles);
  if (allowMasterOverride && tenancy.isMaster) {
    if (allowed.has("MASTER")) return;
  }

  if (!tenancy.membership) {
    throw new Error("Membership required for role validation");
  }

  if (!allowed.has(tenancy.membership.role as MembershipRole)) {
    throw new Error("Insufficient membership role");
  }
}
