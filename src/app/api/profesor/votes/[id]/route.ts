import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getServerSession } from "@/lib/server-auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has profesor role
    if (session.user.role !== "PROFESOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: voteId } = await params;

    if (!voteId) {
      return NextResponse.json(
        { error: "Vote ID is required" },
        { status: 400 },
      );
    }

    const convex = await getAuthenticatedConvexClient();

    // Delete vote from Convex
    await convex.mutation(api.votes.deleteVote, {
      id: voteId as Id<"votes">,
    });

    return NextResponse.json({
      success: true,
      message: "Vote deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
