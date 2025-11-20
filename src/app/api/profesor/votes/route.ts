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
    if (session.data?.user.role !== "PROFESOR") {
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
            name: session.data?.user?.name || "Profesor",
            email: session.data?.user?.email || "",
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
    if (session.data?.user.role !== "PROFESOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate that we have a user ID and resolve Convex user ID
    if (!session.data?.user.id) {
      console.error("No user ID in session:", {
        clerkId: session.data?.user.clerkId,
        email: session.data?.user.email,
        role: session.data?.user.role,
      });
      return NextResponse.json(
        { error: "User session is invalid. Please log out and log back in." },
        { status: 500 },
      );
    }

    // Get authenticated Convex client to resolve user
    const convex = await getAuthenticatedConvexClient();

    // Resolve Convex user ID - session.data?.user.id might be a Clerk ID string
    let convexUserId: Id<"users">;
    if (session.data?.user.id && /^[a-z]/.test(session.data?.user.id)) {
      // It's already a valid Convex ID
      convexUserId = session.data?.user.id as Id<"users">;
    } else {
      // It's a Clerk ID, look up the Convex user
      if (!session.data?.user.clerkId) {
        console.error("No Clerk ID available for user lookup:", {
          id: session.data?.user.id,
          email: session.data?.user.email,
        });
        return NextResponse.json(
          { error: "User not found in database. Please contact support." },
          { status: 500 },
        );
      }

      const convexUser = await convex.query(api.users.getUserByClerkId, {
        clerkId: session.data?.user.clerkId,
      });

      if (!convexUser) {
        console.error("User not found in Convex database:", {
          clerkId: session.data?.user.clerkId,
          email: session.data?.user.email,
        });
        return NextResponse.json(
          { error: "User not found in database. Please contact support." },
          { status: 500 },
        );
      }

      convexUserId = convexUser._id;
    }
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
      createdBy: convexUserId,
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
    if (session.data?.user.role !== "PROFESOR") {
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
