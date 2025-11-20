import { NextRequest, NextResponse } from "next/server";
import {
  getTeamMembers,
  getActiveTeamMembers,
} from "@/services/queries/team-members";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const teamMembers = activeOnly
      ? await getActiveTeamMembers()
      : await getTeamMembers();

    if (!teamMembers.success) {
      return NextResponse.json(
        {
          success: false,
          error: teamMembers.error || "Failed to fetch team members",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: teamMembers.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
