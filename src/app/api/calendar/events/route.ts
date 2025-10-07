import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { getCalendarEvents } from "@/services/queries/calendar";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for calendar requests
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.API.limit,
        RATE_LIMITS.API.windowMs,
        "calendar",
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many calendar requests. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(
            request,
            RATE_LIMITS.API.limit,
            RATE_LIMITS.API.windowMs,
            "calendar",
          ),
        },
      );
    }

    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      categories: searchParams.get("categories")
        ? (searchParams.get("categories")!.split(",") as any[])
        : undefined,
      priority: searchParams.get("priority") as any,
      search: searchParams.get("search") || undefined,
    };

    const result = await getCalendarEvents(query);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Calendar events API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
