import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { createSuccessResponse, handleApiError } from "@/lib/api-error";

export const runtime = "nodejs";

// GET /api/parent/dashboard/overview - Get dashboard overview for parents
export async function GET() {
  try {
    const client = getConvexClient();
    const session = await auth();

    if (!session || session.user.role !== "PARENT") {
      return handleApiError(
        new Error("Unauthorized access"),
        "GET /api/parent/dashboard/overview",
      );
    }

    // Get student's data
    const students = await client.query(api.students.getStudents, {
      parentId: session.user.id as any, // Convex ID type
      isActive: true,
    });

    // Get upcoming meetings
    const upcomingMeetings = await client.query(
      api.meetings.getMeetingsByParent,
      {
        parentId: session.user.id as any, // Convex ID type
      },
    );

    // Get recent notifications
    const recentNotifications = await client.query(
      api.notifications.getNotifications,
      {
        recipientId: session.user.id as any, // Convex ID type
        limit: 5,
      },
    );

    // Get voting data
    const votings = await client.query(api.votes.getVotes, {
      isActive: true,
    });

    // Get unread communications count
    const unreadCommunications = await client.query(
      api.notifications.getNotifications,
      {
        recipientId: session.user.id as any,
        read: false,
        limit: 100,
      },
    );

    const data = {
      children: {
        total: students.length,
        enrolled: students.filter((s) => s.isActive).length,
      },
      meetings: {
        total: upcomingMeetings.length,
        upcoming: upcomingMeetings.length,
      },
      communications: {
        total: recentNotifications.length,
        unread: unreadCommunications.length,
      },
      votings: {
        total: votings.length,
        active: votings.filter((v: any) => v.status === "active").length,
      },
      resources: {
        total: 25, // Mock data - would need to implement actual resource counting
        shared: 12,
        downloaded: 8,
      },
    };

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "GET /api/parent/dashboard/overview");
  }
}
