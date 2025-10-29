import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getServerSession } from "@/lib/server-auth";
import { getConvexClient } from "@/lib/convex";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const convex = getConvexClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const category = searchParams.get("category");

    // Fetch votes from Convex
    const votes = await convex.query(api.votes.getVotes, {
      isActive: isActive ? isActive === "true" : undefined,
      category: (category as any) || undefined,
    });

    // Transform votes to include calculated status and enhanced data
    const transformedVotes = await Promise.all(
      votes.map(async (vote: any) => {
        const options = await convex.query(api.votes.getVoteById, {
          id: vote._id,
        });

        // Calculate status based on endDate
        const now = Date.now();
        const endDate = new Date(vote.endDate).getTime();
        const isExpired = endDate < now;
        const status = vote.isActive && !isExpired ? "active" : "closed";

        return {
          id: vote._id,
          title: vote.title,
          description: vote.description,
          category: vote.category,
          endDate: new Date(vote.endDate).toISOString(),
          isActive: vote.isActive,
          isPublic: vote.isPublic,
          allowMultipleVotes: vote.allowMultipleVotes,
          maxVotesPerUser: vote.maxVotesPerUser,
          requireAuthentication: vote.requireAuthentication,
          status,
          totalVotes:
            options?.options?.reduce(
              (sum: number, opt: any) => sum + opt.voteCount,
              0,
            ) || 0,
          totalOptions: options?.options?.length || 0,
          createdAt: new Date(vote.createdAt).toISOString(),
          updatedAt: new Date(vote.updatedAt).toISOString(),
          creator: {
            id: vote.createdBy,
            name: session.user?.name || "Admin",
            email: session.user?.email || "",
          },
          options: options?.options?.map((opt: any) => ({
            id: opt._id,
            text: opt.text,
            votes: opt.voteCount,
          })),
        };
      }),
    );

    return NextResponse.json({
      data: transformedVotes,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
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

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const convex = getConvexClient();
    const body = await request.json();
    const {
      title,
      description,
      category,
      endDate,
      isActive,
      isPublic,
      allowMultipleVotes,
      maxVotesPerUser,
      requireAuthentication,
      options,
    } = body;

    // Validate required fields
    if (!title || !endDate || !options || options.length < 2) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate options
    if (options.some((opt: string) => !opt.trim())) {
      return NextResponse.json(
        { error: "All options must be non-empty" },
        { status: 400 },
      );
    }

    // Create vote in Convex
    const voteId = await convex.mutation(api.votes.createVote, {
      title: title.trim(),
      description: description?.trim() || undefined,
      category: category || "GENERAL",
      endDate: new Date(endDate).getTime(),
      isActive: isActive ?? true,
      isPublic: isPublic ?? true,
      allowMultipleVotes: allowMultipleVotes ?? false,
      maxVotesPerUser: maxVotesPerUser || undefined,
      requireAuthentication: requireAuthentication ?? true,
      createdBy: session.user.id as any,
      options: options.map((opt: string) => opt.trim()),
    });

    return NextResponse.json({
      data: { id: voteId },
      success: true,
    });
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Vote ID is required" },
        { status: 400 },
      );
    }

    // For now, we'll need to delete and recreate the vote since Convex doesn't have update mutations
    // In a production system, you'd want to add update mutations to Convex
    return NextResponse.json(
      { error: "Update functionality not implemented yet" },
      { status: 501 },
    );
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
