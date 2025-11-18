/**
 * Shared validation utilities for Convex functions
 * Common validation patterns and helper functions
 */

import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Get current timestamp (convenience function)
 */
export function now(): number {
  return Date.now();
}

/**
 * Validate that a date is not in the future
 */
export function validateDateNotInFuture(date: number): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recordDate = new Date(date);
  recordDate.setHours(0, 0, 0, 0);

  if (recordDate > today) {
    throw new Error("Cannot record data for future dates");
  }
}

/**
 * Get authenticated user with institution validation
 */
export async function getAuthenticatedUser(ctx: AnyCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.currentInstitutionId) {
    throw new Error("User must have a current institution");
  }

  return user;
}

/**
 * Validate that a user has the required role
 */
export function validateUserRole(user: Doc<"users">, requiredRoles: string[]): void {
  if (!requiredRoles.includes(user.role)) {
    throw new Error(`Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`);
  }
}

/**
 * Validate that an entity exists and belongs to the user's institution
 */
export async function validateEntityOwnership<T extends Doc<any>>(
  ctx: AnyCtx,
  entityId: Id<any>,
  table: string,
  institutionId: Id<"institutionInfo">,
): Promise<T> {
  const entity = await ctx.db.get(entityId);
  if (!entity) {
    throw new Error(`${table} not found`);
  }

  if ((entity as any).institutionId !== institutionId) {
    throw new Error(`${table} not found`);
  }

  return entity as T;
}

/**
 * Validate that a user is a teacher
 */
export function validateTeacherRole(user: Doc<"users">): void {
  if (user.role !== "PROFESOR") {
    throw new Error("Only teachers can perform this action");
  }
}

/**
 * Check if a user is in an institution (helper for meetings)
 */
export async function userInInstitution(
  ctx: AnyCtx,
  userId: Id<"users">,
  institutionId: Id<"institutionInfo">,
): Promise<boolean> {
  const membership = await ctx.db
    .query("institutionMemberships")
    .withIndex("by_user_institution", (q: any) =>
      q.eq("userId", userId).eq("institutionId", institutionId),
    )
    .first();

  return membership !== null;
}

/**
 * Common filter for active status
 */
export function filterActive<T extends { isActive?: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.isActive !== false);
}

