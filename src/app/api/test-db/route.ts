import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    const client = getConvexClient();

    // Test simple user query
    const users = await client.query(api.users.getUsers, {});
    const userCount = users.length;

    // Test notifications - skip for now as it requires recipientId
    const notificationsCount = 0;
    const notificationsStatus = "skipped - requires auth";

    return NextResponse.json({
      status: "success",
      convexUrlAvailable: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      userCount,
      notifications: {
        count: notificationsCount,
        status: notificationsStatus,
      },
      message: "Convex query successful",
    });
  } catch (error) {
    console.error("Convex test failed:", error);
    return NextResponse.json(
      {
        status: "error",
        convexUrlAvailable: !!process.env.NEXT_PUBLIC_CONVEX_URL,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Convex connection failed",
      },
      { status: 500 },
    );
  }
}
