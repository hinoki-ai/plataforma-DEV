import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getServerSession } from "@/lib/server-auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { canAccessAdmin } from "@/lib/role-utils";
import type { Id } from "@/convex/_generated/dataModel";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access (MASTER or ADMIN role)
    if (!canAccessAdmin(session.user.role)) {
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
    const transformedVotes: any[] = [];
    for (const vote of votes) {
      try {
        const options = await convex.query(api.votes.getVoteById, {
          id: vote._id,
        });

        // Calculate status based on endDate
        const now = Date.now();
        const endDate = new Date(vote.endDate).getTime();
        const isExpired = endDate < now;
        const status = vote.isActive && !isExpired ? "active" : "closed";

        transformedVotes.push({
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
        });
      } catch (voteError) {
        // Skip this vote instead of failing the entire request
      }
    }

    return NextResponse.json({
      data: transformedVotes,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
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

    // Check if user has admin access (MASTER or ADMIN role)
    if (!canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate that we have a user ID and resolve Convex user ID
    if (!session.user.id) {
      return NextResponse.json(
        { error: "User session is invalid. Please log out and log back in." },
        { status: 500 },
      );
    }

    // Get authenticated Convex client to resolve user
    const convex = await getAuthenticatedConvexClient();

    // Resolve Convex user ID - session.user.id might be a Clerk ID string
    let convexUserId: Id<"users">;
    if (session.user.id && /^[a-z]/.test(session.user.id)) {
      // It's already a valid Convex ID
      convexUserId = session.user.id as Id<"users">;
    } else {
      // It's a Clerk ID, look up the Convex user
      if (!session.user.clerkId) {
        return NextResponse.json(
          { error: "User not found in database. Please contact support." },
          { status: 500 },
        );
      }

      const convexUser = await convex.query(api.users.getUserByClerkId, {
        clerkId: session.user.clerkId,
      });

      if (!convexUser) {
        return NextResponse.json(
          { error: "User not found in database. Please contact support." },
          { status: 500 },
        );
      }

      convexUserId = convexUser._id;
    }

    // Parse request body with better error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 },
      );
    }

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

    // Validate endDate is valid
    const endDateTimestamp = new Date(endDate).getTime();
    if (isNaN(endDateTimestamp)) {
      return NextResponse.json(
        { error: "Invalid end date format" },
        { status: 400 },
      );
    }

    // Validate options
    // Handle both array of strings and array of objects with text property
    const optionTexts = options
      .map((opt: any) => (typeof opt === "string" ? opt : opt?.text))
      .filter(Boolean);

    if (optionTexts.length < 2) {
      return NextResponse.json(
        { error: "At least 2 valid options are required" },
        { status: 400 },
      );
    }

    if (optionTexts.some((opt: string) => !opt || !opt.trim())) {
      return NextResponse.json(
        { error: "All options must be non-empty" },
        { status: 400 },
      );
    }

    // Validate Convex client is available
    try {
      // convex is already initialized above, just validate it
      if (!convex) {
        throw new Error("Failed to initialize Convex client");
      }
    } catch (authError) {
      return NextResponse.json(
        { error: "Authentication failed. Please log in again." },
        { status: 401 },
      );
    }

    // Create vote in Convex
    const voteId = await convex.mutation(api.votes.createVote, {
      title: title.trim(),
      description: description?.trim() || undefined,
      category: category || "GENERAL",
      endDate: endDateTimestamp,
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
    // Provide more helpful error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("authentication required") ||
        errorMessage.includes("failed to get authentication token")
      ) {
        return NextResponse.json(
          { error: "Authentication required. Please log in again." },
          { status: 401 },
        );
      }
      if (
        errorMessage.includes("user record not found") ||
        errorMessage.includes("user not found")
      ) {
        return NextResponse.json(
          {
            error:
              "Your account needs to be synced. Please contact support or log out and log back in.",
          },
          { status: 403 },
        );
      }
      if (
        errorMessage.includes("no institution selected") ||
        errorMessage.includes("institution not found")
      ) {
        return NextResponse.json(
          {
            error:
              "You must be associated with an institution to create votes.",
          },
          { status: 403 },
        );
      }
      if (
        errorMessage.includes("membership required") ||
        errorMessage.includes("membership role required") ||
        errorMessage.includes("insufficient membership role")
      ) {
        return NextResponse.json(
          { error: "You must have an active membership to create votes." },
          { status: 403 },
        );
      }
      if (
        errorMessage.includes("user is inactive") ||
        errorMessage.includes("inactive")
      ) {
        return NextResponse.json(
          { error: "Your account is inactive. Please contact support." },
          { status: 403 },
        );
      }
      if (errorMessage.includes("membership is not active")) {
        return NextResponse.json(
          { error: "Your membership is not active. Please contact support." },
          { status: 403 },
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access (MASTER or ADMIN role)
    if (!canAccessAdmin(session.user.role)) {
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
      // Handle both array of strings and array of objects with text property
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
