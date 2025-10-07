import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlanningDocuments } from "@/services/queries/planning";
import type { PlanningFilters } from "@/lib/types/service-responses";

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from the request URL
    const { searchParams } = new URL(request.url);
    const filters: PlanningFilters = {
      q: searchParams.get("q") || undefined,
      subject: searchParams.get("subject") || undefined,
      grade: searchParams.get("grade") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
    };

    // Call the server function which will handle authentication
    const result = await getPlanningDocuments(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error("API Error fetching planning documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
