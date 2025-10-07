import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/../convex/_generated/api";

export async function GET() {
  try {
    const client = getConvexClient();
    // Simple health check query
    await client.query(api.users.getUsers, {});

    return NextResponse.json({
      status: "healthy",
      backend: "convex",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
