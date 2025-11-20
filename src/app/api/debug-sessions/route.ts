import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbLogger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session?.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action, details, sessionId } = body;

    // Validate request structure
    if (!action || !sessionId) {
      return NextResponse.json(
        { error: "Invalid request structure" },
        { status: 400 },
      );
    }

    // Log session data
    dbLogger.info("Session activity tracked", {
      action,
      details,
      sessionId,
      timestamp: new Date().toISOString(),
      userId: session?.user.id,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Store in temporary in-memory storage (in production, use database)
    const sessionData = {
      id: Date.now().toString(),
      action,
      details,
      sessionId,
      timestamp: new Date().toISOString(),
      userId: session?.user.id,
    };

    return NextResponse.json({
      success: true,
      id: sessionData.id,
    });
  } catch (error) {
    dbLogger.error("Error storing session data", error, {
      context: "debug-sessions-api",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session?.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");
    const hours = parseInt(searchParams.get("hours") || "24");

    // In production, fetch from database
    // For now, return mock session data
    const mockData = [
      {
        id: "1",
        action: "login",
        details: null,
        sessionId: "session_1234567890_abc123",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        userId: session?.user.id,
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      },
      {
        id: "2",
        action: "navigation",
        details: "/admin/usuarios",
        sessionId: "session_1234567890_abc123",
        timestamp: new Date(Date.now() - 6900000).toISOString(),
        userId: session?.user.id,
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      },
      {
        id: "3",
        action: "api_call",
        details: "/api/admin/users",
        sessionId: "session_1234567890_abc123",
        timestamp: new Date(Date.now() - 6800000).toISOString(),
        userId: session?.user.id,
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      },
      {
        id: "4",
        action: "navigation",
        details: "/admin/planificaciones",
        sessionId: "session_1234567890_abc123",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        userId: session?.user.id,
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      },
    ];

    // Filter by time range
    const timeThreshold = Date.now() - hours * 60 * 60 * 1000;
    let filteredData = mockData.filter(
      (item) => new Date(item.timestamp).getTime() > timeThreshold,
    );

    // Filter by action if specified
    if (action) {
      filteredData = filteredData.filter((item) => item.action === action);
    }

    // Generate analytics summary
    const uniqueSessions = new Set(filteredData.map((item) => item.sessionId))
      .size;
    const actionCounts = filteredData.reduce(
      (acc, item) => {
        acc[item.action] = (acc[item.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      success: true,
      data: filteredData.slice(0, limit),
      total: filteredData.length,
      analytics: {
        uniqueSessions,
        totalActivities: filteredData.length,
        actionBreakdown: actionCounts,
        timeRange: `${hours} hours`,
      },
    });
  } catch (error) {
    dbLogger.error("Error fetching session data", error, {
      context: "debug-sessions-api",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
