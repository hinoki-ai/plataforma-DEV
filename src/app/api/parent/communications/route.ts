import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const PRIORITY_MAP = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
} as const;

type PriorityKey = keyof typeof PRIORITY_MAP;

type NotificationStatus = "all" | "unread" | "read" | "archived";

function mapStatus(param: string | null): NotificationStatus {
  if (!param) return "all";
  const normalized = param.toLowerCase();
  if (normalized === "unread") return "unread";
  if (normalized === "read") return "read";
  if (normalized === "archived") return "archived";
  return "all";
}

function inferCommunicationType(
  category?: string | null,
  type?: string | null,
): "message" | "notification" | "event" {
  if (category === "MEETING" || category === "PERSONAL") {
    return "message";
  }
  if (category === "ACADEMIC") {
    return "event";
  }
  if (type === "SYSTEM") {
    return "notification";
  }
  return "notification";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Acceso restringido" },
        { status: 403 },
      );
    }

    const client = getConvexClient();
    const parentId = session.user.id as unknown as Id<"users">;
    const searchParams = request.nextUrl.searchParams;
    const status = mapStatus(searchParams.get("status"));
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const notifications = await client.query(
      api.notifications.getNotifications,
      {
        recipientId: parentId,
        status:
          status === "archived"
            ? "read"
            : status === "unread"
              ? "unread"
              : "all",
        limit,
      },
    );

    const filtered = notifications.filter((notification) => {
      if (status === "archived") {
        return notification.read === true;
      }
      if (status === "unread") {
        return notification.read === false;
      }
      if (status === "read") {
        return notification.read === true;
      }
      return true;
    });

    const data = await Promise.all(
      filtered.map(async (notification) => {
        const sender = notification.senderId
          ? await client.query(api.users.getUserById, {
              userId: notification.senderId,
            })
          : null;

        const priority = (notification.priority || "MEDIUM").toLowerCase() as
          | "high"
          | "medium"
          | "low";

        const content = notification.message;

        return {
          id: String(notification._id),
          type: inferCommunicationType(
            notification.category,
            notification.type,
          ),
          from: sender?.name || "Sistema",
          subject: notification.title,
          content,
          preview:
            content.length > 140 ? `${content.slice(0, 137)}...` : content,
          date: new Date(notification.createdAt).toISOString(),
          read: Boolean(notification.read),
          priority,
          category: notification.category ?? "SYSTEM",
        };
      }),
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching communications:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Acceso restringido" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { to, subject, message, priority = "medium" } = body ?? {};

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Los campos 'to', 'subject' y 'message' son obligatorios" },
        { status: 400 },
      );
    }

    const normalizedPriority = String(priority).toLowerCase() as PriorityKey;
    const convexPriority = PRIORITY_MAP[normalizedPriority] ?? "MEDIUM";

    const client = getConvexClient();
    const parentId = session.user.id as unknown as Id<"users">;

    const recipient = await client.query(api.users.getUserByEmail, {
      email: String(to).trim().toLowerCase(),
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "No encontramos a la persona destinataria" },
        { status: 404 },
      );
    }

    const recipientIds = new Set<Id<"users">>();
    recipientIds.add(recipient._id as Id<"users">);
    recipientIds.add(parentId);

    await client.mutation(api.notifications.createNotification, {
      title: subject,
      message,
      type: "INFO",
      category: "PERSONAL",
      priority: convexPriority,
      recipientIds: Array.from(recipientIds),
      senderId: parentId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating communication:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
