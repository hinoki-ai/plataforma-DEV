/**
 * Notification Queries and Mutations
 */

import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ensureInstitutionMatch, tenantMutation, tenantQuery } from "./tenancy";
import type { TenancyContext } from "./tenancy";

const notificationTypeValidator = v.union(
  v.literal("INFO"),
  v.literal("SUCCESS"),
  v.literal("WARNING"),
  v.literal("ERROR"),
  v.literal("SYSTEM"),
);

const notificationCategoryValidator = v.optional(
  v.union(
    v.literal("MEETING"),
    v.literal("VOTING"),
    v.literal("SYSTEM"),
    v.literal("ACADEMIC"),
    v.literal("ADMINISTRATIVE"),
    v.literal("PERSONAL"),
  ),
);

const priorityValidator = v.union(
  v.literal("LOW"),
  v.literal("MEDIUM"),
  v.literal("HIGH"),
);

// ==================== QUERIES ====================

export const getNotifications = tenantQuery({
  args: {
    recipientId: v.id("users"),
    status: v.optional(
      v.union(v.literal("all"), v.literal("read"), v.literal("unread")),
    ),
    read: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { recipientId, status, read, limit }, tenancy) => {
    const enforcedRecipientId =
      tenancy.isMaster || tenancy.membershipRole === "ADMIN"
        ? recipientId
        : tenancy.user._id;

    const notifications = (await ctx.db
      .query("notifications")
      .withIndex("by_recipientId", (q: any) =>
        q.eq("recipientId", enforcedRecipientId),
      )
      .collect()) as Doc<"notifications">[];

    let filtered = notifications.filter(
      (notification) => notification.institutionId === tenancy.institution._id,
    );

    // Filter by status or read flag
    if (status === "unread" || read === false) {
      filtered = filtered.filter((n) => !n.read);
    } else if (status === "read" || read === true) {
      filtered = filtered.filter((n) => n.read);
    }

    // Filter out expired notifications
    const now = Date.now();
    filtered = filtered.filter((n) => !n.expiresAt || n.expiresAt > now);

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    return limit ? filtered.slice(0, limit) : filtered;
  },
});

export const getUnreadCount = tenantQuery({
  args: { recipientId: v.id("users") },
  handler: async (ctx, { recipientId }, tenancy) => {
    const enforcedRecipientId =
      tenancy.isMaster || tenancy.membershipRole === "ADMIN"
        ? recipientId
        : tenancy.user._id;

    const notifications = (await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_read", (q: any) =>
        q.eq("recipientId", enforcedRecipientId).eq("read", false),
      )
      .collect()) as Doc<"notifications">[];

    const now = Date.now();
    return notifications.filter(
      (n) =>
        n.institutionId === tenancy.institution._id &&
        (!n.expiresAt || n.expiresAt > now),
    ).length;
  },
});

type AnyCtx = QueryCtx | MutationCtx;

async function getInstitutionRecipientIds(
  ctx: AnyCtx,
  institutionId: Id<"institutionInfo">,
): Promise<Id<"users">[]> {
  const memberships = await ctx.db
    .query("institutionMemberships")
    .withIndex("by_institutionId", (q: any) =>
      q.eq("institutionId", institutionId),
    )
    .collect();
  const recipientSet = new Set<Id<"users">>(
    memberships.map((membership) => membership.userId as Id<"users">),
  );
  return [...recipientSet];
}

function ensureRecipientAccess(
  tenancy: TenancyContext,
  targetRecipient: Id<"users">,
) {
  if (
    !(
      tenancy.isMaster ||
      tenancy.membershipRole === "ADMIN" ||
      tenancy.user._id === targetRecipient
    )
  ) {
    throw new Error("No permission to access notifications for this user");
  }
}

// ==================== MUTATIONS ====================

export const createNotification = tenantMutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: notificationTypeValidator,
    category: notificationCategoryValidator,
    priority: v.optional(priorityValidator),
    recipientIds: v.optional(v.array(v.id("users"))),
    isBroadcast: v.optional(v.boolean()),
    senderId: v.id("users"),
    actionUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();

    const targetRecipients: Id<"users">[] = [];

    if (args.isBroadcast) {
      const broadcastRecipients = await getInstitutionRecipientIds(
        ctx,
        tenancy.institution._id,
      );
      targetRecipients.push(...broadcastRecipients);
    } else if (args.recipientIds && args.recipientIds.length > 0) {
      for (const recipient of args.recipientIds) {
        ensureRecipientAccess(tenancy, recipient);
        targetRecipients.push(recipient);
      }
    } else {
      targetRecipients.push(tenancy.user._id);
    }

    const uniqueRecipients = [...new Set(targetRecipients)];

    // Handle broadcast or specific recipients
    await Promise.all(
      uniqueRecipients.map((recipientId) =>
        ctx.db.insert("notifications", {
          title: args.title,
          message: args.message,
          type: args.type,
          category: args.category,
          priority: args.priority ?? "MEDIUM",
          recipientId,
          senderId: args.senderId,
          actionUrl: args.actionUrl,
          expiresAt: args.expiresAt,
          read: false,
          institutionId: tenancy.institution._id,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );
  },
});

export const markAsRead = tenantMutation({
  args: {
    notificationIds: v.array(v.id("notifications")),
    recipientId: v.id("users"),
  },
  handler: async (ctx, { notificationIds, recipientId }, tenancy) => {
    ensureRecipientAccess(tenancy, recipientId);
    const now = Date.now();
    await Promise.all(
      notificationIds.map(async (id: Id<"notifications">) => {
        const notification = ensureInstitutionMatch(
          await ctx.db.get(id),
          tenancy,
          "Notification not found",
        );

        if (notification.recipientId !== recipientId) {
          throw new Error("Cannot modify notifications from another user");
        }

        await ctx.db.patch(id, {
          read: true,
          readAt: now,
          updatedAt: now,
        });
      }),
    );
  },
});

export const markAllAsRead = tenantMutation({
  args: { recipientId: v.id("users") },
  handler: async (ctx, { recipientId }, tenancy) => {
    ensureRecipientAccess(tenancy, recipientId);
    const notifications = (await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_read", (q: any) =>
        q.eq("recipientId", recipientId).eq("read", false),
      )
      .collect()) as Doc<"notifications">[];

    const now = Date.now();
    await Promise.all(
      notifications
        .filter((n) => n.institutionId === tenancy.institution._id)
        .map((n) =>
          ctx.db.patch(n._id, {
            read: true,
            readAt: now,
            updatedAt: now,
          }),
        ),
    );
  },
});

export const deleteNotification = tenantMutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }, tenancy) => {
    const notification = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Notification not found",
    );

    ensureRecipientAccess(tenancy, notification.recipientId);
    await ctx.db.delete(id);
  },
});
