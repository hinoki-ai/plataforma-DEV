import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";

export async function GET() {
  try {
    // Test Convex connection by checking if client is initialized
    const client = getConvexClient();

    // Simple health check - if we can get the client, we're connected
    const isConnected = client !== null;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: isConnected ? "connected" : "disconnected",
      backend: "convex",
    });
  } catch (error: any) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        name: error.name,
        timestamp: new Date().toISOString(),
        env_check: {
          has_convex_url: !!process.env.NEXT_PUBLIC_CONVEX_URL,
          convex_url_prefix:
            process.env.NEXT_PUBLIC_CONVEX_URL?.substring(0, 30) + "...",
        },
      },
      { status: 503 },
    );
  }
}
