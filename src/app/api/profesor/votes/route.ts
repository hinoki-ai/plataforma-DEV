import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getServerSession } from "@/lib/server-auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has profesor role
    if (session.user.role !== "PROFESOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const convex = await getAuthenticatedConvexClient();

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
            name: session.user?.name || "Profesor",
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

    // Check if user has profesor role
    if (session.user.role !== "PROFESOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate that session.user.id is a valid Convex ID
    if (!session.user.id || !/^[a-z]/.test(session.user.id)) {
      console.error("Invalid user ID format in session:", {
        id: session.user.id,
        role: session.user.role,
      });
      return NextResponse.json(
        { error: "User not found in database. Please contact support." },
        { status: 500 },
      );
    }

    const convex = await getAuthenticatedConvexClient();
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
    const optionTexts = options.map((opt: any) =>
      typeof opt === "string" ? opt : opt.text,
    );

    if (optionTexts.some((opt: string) => !opt || !opt.trim())) {
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
      maxVotesPerUser: maxVotesPerUser ?? null,
      requireAuthentication: requireAuthentication ?? true,
      createdBy: session.user.id as any,
      options: optionTexts.map((opt: string) => opt.trim()),
    });

    return NextResponse.json({
      data: { id: voteId },
      success: true,
    });
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
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

    // Check if user has profesor role
    if (session.user.role !== "PROFESOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const convex = await getAuthenticatedConvexClient();
    const body = await request.json();
    const { id, options, endDate, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Vote ID is required" },
        { status: 400 },
      );
    }

    // Prepare update arguments
    const args: any = {
      id: id as Id<"votes">,
      ...updateData,
    };

    if (endDate) {
      args.endDate = new Date(endDate).getTime();
    }

    if (options) {
      const optionTexts = options.map((opt: any) =>
        typeof opt === "string" ? opt : opt.text,
      );

      if (optionTexts.some((opt: string) => !opt || !opt.trim())) {
        return NextResponse.json(
          { error: "All options must be non-empty" },
          { status: 400 },
        );
      }

      args.options = optionTexts.map((opt: string) => opt.trim());
    }

    await convex.mutation(api.votes.updateVote, args);

    return NextResponse.json({
      success: true,
      message: "Vote updated successfully",
    });
  } catch (error) {
    console.error("Error updating vote:", error);

    if (error instanceof Error) {
      if (error.message.includes("Cannot modify options")) {
        return NextResponse.json(
          {
            error: "Cannot modify options because voting has already started.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
