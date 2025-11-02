import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const notificationId = params.id;
    if (!notificationId) {
      return NextResponse.json(
        { error: "Falta el identificador de la notificación" },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    const parentId = session.user.id as unknown as Id<"users">;

    const notifications = await client.query(
      api.notifications.getNotifications,
      {
        recipientId: parentId,
        status: "all",
      },
    );

    const target = notifications.find(
      (notification) => String(notification._id) === notificationId,
    );

    if (!target) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 },
      );
    }

    await client.mutation(api.notifications.markAsRead, {
      notificationIds: [target._id],
      recipientId: parentId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking communication as read:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
