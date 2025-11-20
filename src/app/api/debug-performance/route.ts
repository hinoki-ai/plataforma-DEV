import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbLogger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { type, data } = body;

    // Validate request structure
    if (!type || !data) {
      return NextResponse.json(
        { error: "Invalid request structure" },
        { status: 400 },
      );
    }

    // Log performance data
    dbLogger.info("Performance data received", {
      type,
      data,
      timestamp: new Date().toISOString(),
      userId: session.data?.user.id,
      userAgent: request.headers.get("user-agent"),
    });

    // Store in temporary in-memory storage (in production, use database)
    const performanceData = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
      userId: session.data?.user.id,
    };

    return NextResponse.json({
      success: true,
      id: performanceData.id,
    });
  } catch (error) {
    dbLogger.error("Error storing performance data", error, {
      context: "debug-performance-api",
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
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");

    // In production, fetch from database
    // For now, return mock performance data
    const mockData = [
      {
        id: "1",
        type: "navigation",
        data: {
          endpoint: "/admin",
          responseTime: 234,
          status: 200,
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "2",
        type: "api_call",
        data: {
          endpoint: "/api/auth/session",
          responseTime: 45,
          status: 200,
        },
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "3",
        type: "request",
        data: {
          endpoint: "/admin/usuarios",
          responseTime: 156,
          status: 200,
        },
        timestamp: new Date().toISOString(),
      },
    ];

    const filteredData = type
      ? mockData.filter((item) => item.type === type)
      : mockData;

    return NextResponse.json({
      success: true,
      data: filteredData.slice(0, limit),
      total: filteredData.length,
    });
  } catch (error) {
    dbLogger.error("Error fetching performance data", error, {
      context: "debug-performance-api",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
