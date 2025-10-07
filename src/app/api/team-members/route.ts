import { NextRequest, NextResponse } from "next/server";
import { getActiveTeamMembers } from "@/services/queries/team-members";

export async function GET(request: NextRequest) {
  try {
    const teamMembers = await getActiveTeamMembers();

    if (!teamMembers.success) {
      return NextResponse.json(
        { error: teamMembers.error || "Failed to fetch team members" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: teamMembers.data });
  } catch (error) {
    console.error("API Error fetching team members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
