import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { sendNotificationToUser } from "@/lib/notification-utils";

// Convex doesn't need connection resets

export const runtime = "nodejs";

// GET /api/notifications - Get notifications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getConvexClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");

    try {
      const notifications = await client.query(
        api.notifications.getNotifications,
        {
          recipientId: session.user.id as any, // Cast string to Id<"users">
          status: status as "all" | "read" | "unread",
          limit,
        },
      );

      return NextResponse.json({
        notifications,
        total: notifications.length,
        unread: notifications.filter((n) => !n.read).length,
      });
    } catch (dbError) {
      console.error("Database error fetching notifications:", dbError);

      // Return empty notifications with a warning
      return NextResponse.json({
        notifications: [],
        total: 0,
        unread: 0,
        warning: "Notifications temporarily unavailable due to database issues",
      });
    }
  } catch (error) {
    console.error("Error in notifications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getConvexClient();
    const body = await request.json();
    const { notificationIds, markAll } = body;

    try {
      if (markAll) {
        await client.mutation(api.notifications.markAllAsRead, {
          recipientId: session.user.id as any, // Cast string to Id<"users">
        });
      } else if (notificationIds?.length > 0) {
        await client.mutation(api.notifications.markAsRead, {
          notificationIds,
          recipientId: session.user.id as any, // Cast string to Id<"users">
        });
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error updating notifications:", dbError);
      return NextResponse.json(
        { error: "Unable to update notifications due to database issues" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in notifications PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create notifications (admin/professor)
    if (!["ADMIN", "PROFESOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const client = getConvexClient();
    const body = await request.json();
    const {
      title,
      message,
      type,
      category,
      recipientIds,
      isBroadcast,
      priority = "medium",
      actionUrl,
      expiresAt,
    } = body;

    try {
      await client.mutation(api.notifications.createNotification, {
        title,
        message,
        type,
        category,
        recipientIds,
        isBroadcast,
        priority,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
        senderId: session.user.id as any,
      });

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error creating notification:", dbError);
      return NextResponse.json(
        { error: "Unable to create notification due to database issues" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in notifications POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
