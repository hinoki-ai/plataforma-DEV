import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getServerSession } from "@/lib/server-auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has parent role
    if (session.data?.user.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const convex = await getAuthenticatedConvexClient();

    // Get only active public votes for parents
    const votes = await convex.query(api.votes.getVotes, {
      isActive: true,
    });

    // Filter for public votes and get current user voting status
    const publicVotes = votes.filter((vote: any) => vote.isPublic);

    const transformedVotes = await Promise.all(
      publicVotes.map(async (vote: any) => {
        const options = await convex.query(api.votes.getVoteById, {
          id: vote._id,
        });

        // Check if user already voted
        // We use getUserVoteResponses to get all votes if multiple are allowed
        const userVoteResponses = await convex.query(
          api.votes.getUserVoteResponses,
          {
            voteId: vote._id,
            userId: session.data?.user.id as any,
          },
        );

        // Calculate total votes and percentages
        const totalVotes =
          options?.options?.reduce(
            (sum: number, opt: any) => sum + opt.voteCount,
            0,
          ) || 0;

        const optionsWithPercentages = options?.options?.map((opt: any) => ({
          id: opt._id,
          text: opt.text,
          votes: opt.voteCount,
        }));

        // Check if voting is still open
        const now = Date.now();
        const endDate = new Date(vote.endDate).getTime();
        const isExpired = endDate < now;

        return {
          id: vote._id,
          title: vote.title,
          description: vote.description,
          category: vote.category,
          endDate: new Date(vote.endDate).toISOString(),
          status: isExpired ? "closed" : "active",
          totalVotes,
          hasVoted: userVoteResponses && userVoteResponses.length > 0,
          userVotes: userVoteResponses
            ? userVoteResponses.map((r: any) => r.optionId)
            : [],
          allowMultipleVotes: vote.allowMultipleVotes,
          maxVotesPerUser: vote.maxVotesPerUser,
          options: optionsWithPercentages,
        };
      }),
    );

    return NextResponse.json({
      data: transformedVotes,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching votes for parent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has parent role
    if (session.data?.user.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const convex = await getAuthenticatedConvexClient();
    const body = await request.json();
    const { voteId, optionId, optionIds } = body;

    if (!voteId || (!optionId && (!optionIds || optionIds.length === 0))) {
      return NextResponse.json(
        { error: "Vote ID and at least one Option ID are required" },
        { status: 400 },
      );
    }

    // Get the vote to check constraints
    const vote = await convex.query(api.votes.getVoteById, { id: voteId });

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    // Check if vote is still active and public
    const now = Date.now();
    const endDate = new Date(vote.endDate).getTime();
    const isExpired = endDate < now;

    if (!vote.isActive || isExpired || !vote.isPublic) {
      return NextResponse.json(
        { error: "Voting is not available for this poll" },
        { status: 403 },
      );
    }

    // Determine options to vote for
    const targetOptionIds = optionIds || [optionId];

    // Verify options belong to this vote
    for (const oid of targetOptionIds) {
      const optionExists = vote.options.some((opt: any) => opt._id === oid);
      if (!optionExists) {
        return NextResponse.json(
          { error: `Invalid option selected: ${oid}` },
          { status: 400 },
        );
      }
    }

    // Cast the vote(s)
    // Use castVotes for batch voting
    const result = await convex.mutation(api.votes.castVotes, {
      voteId,
      optionIds: targetOptionIds,
      userId: session.data?.user.id as any,
    });

    return NextResponse.json({
      data: { ids: result },
      success: true,
      message: "Vote(s) cast successfully",
    });
  } catch (error) {
    console.error("Error casting vote:", error);

    // Handle specific Convex errors
    if (error instanceof Error) {
      if (error.message.includes("User has already voted")) {
        return NextResponse.json(
          { error: "You have already voted in this poll" },
          { status: 409 },
        );
      }
      if (error.message.includes("Maximum votes per user limit reached")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes("Vote not found")) {
        return NextResponse.json({ error: "Vote not found" }, { status: 404 });
      }
      if (error.message.includes("Duplicate options")) {
        return NextResponse.json(
          { error: "Duplicate options selected" },
          { status: 400 },
        );
      }
      if (error.message.includes("already voted for one of these options")) {
        return NextResponse.json(
          { error: "You have already voted for one of these options" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
