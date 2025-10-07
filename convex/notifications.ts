/**
 * Notification Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

export const getNotifications = query({
  args: {
    recipientId: v.id("users"),
    status: v.optional(
      v.union(v.literal("all"), v.literal("read"), v.literal("unread")),
    ),
    read: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { recipientId, status, read, limit }) => {
    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId", (q) => q.eq("recipientId", recipientId))
      .collect();

    // Filter by status or read flag
    if (status === "unread" || read === false) {
      notifications = notifications.filter((n) => !n.read);
    } else if (status === "read" || read === true) {
      notifications = notifications.filter((n) => n.read);
    }

    // Filter out expired notifications
    const now = Date.now();
    notifications = notifications.filter(
      (n) => !n.expiresAt || n.expiresAt > now,
    );

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    return limit ? notifications.slice(0, limit) : notifications;
  },
});

export const getUnreadCount = query({
  args: { recipientId: v.id("users") },
  handler: async (ctx, { recipientId }) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_read", (q) =>
        q.eq("recipientId", recipientId).eq("read", false),
      )
      .collect();

    const now = Date.now();
    return notifications.filter((n) => !n.expiresAt || n.expiresAt > now)
      .length;
  },
});

// ==================== MUTATIONS ====================

export const createNotification = mutation({
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
  handler: async (ctx, args) => {
    const now = Date.now();

    // Handle broadcast or specific recipients
    if (args.isBroadcast) {
      const allUsers = await ctx.db.query("users").collect();
      await Promise.all(
        allUsers.map((user) =>
          ctx.db.insert("notifications", {
            title: args.title,
            message: args.message,
            type: args.type,
            category: args.category,
            priority: args.priority ?? "MEDIUM",
            recipientId: user._id,
            senderId: args.senderId,
            actionUrl: args.actionUrl,
            expiresAt: args.expiresAt,
            read: false,
            createdAt: now,
            updatedAt: now,
          }),
        ),
      );
    } else if (args.recipientIds && args.recipientIds.length > 0) {
      await Promise.all(
        args.recipientIds.map((recipientId) =>
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
            createdAt: now,
            updatedAt: now,
          }),
        ),
      );
    }
  },
});

export const markAsRead = mutation({
  args: {
    notificationIds: v.array(v.id("notifications")),
    recipientId: v.id("users"),
  },
  handler: async (ctx, { notificationIds, recipientId }) => {
    const now = Date.now();
    await Promise.all(
      notificationIds.map((id) =>
        ctx.db.patch(id, {
          read: true,
          readAt: now,
          updatedAt: now,
        }),
      ),
    );
  },
});

export const markAllAsRead = mutation({
  args: { recipientId: v.id("users") },
  handler: async (ctx, { recipientId }) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId_read", (q) =>
        q.eq("recipientId", recipientId).eq("read", false),
      )
      .collect();

    const now = Date.now();
    await Promise.all(
      notifications.map((n) =>
        ctx.db.patch(n._id, {
          read: true,
          readAt: now,
          updatedAt: now,
        }),
      ),
    );
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
