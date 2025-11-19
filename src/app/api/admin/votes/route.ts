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

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
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

    // Validate that session.user.id is a valid Convex ID
    // It should start with a letter followed by alphanumeric characters
    if (!session.user.id || !/^[a-z]/.test(session.user.id)) {
      console.error("Invalid user ID format in session:", {
        id: session.user.id,
        clerkId: session.user.clerkId,
        email: session.user.email,
        role: session.user.role,
      });
      return NextResponse.json(
        { error: "User not found in database. Please contact support." },
        { status: 500 },
      );
    }

    // Parse request body with better error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
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

    // Get authenticated Convex client
    let convex;
    try {
      convex = await getAuthenticatedConvexClient();
    } catch (authError) {
      console.error("Error getting Convex client:", authError);
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
      createdBy: session.user.id as any,
      options: optionTexts.map((opt: string) => opt.trim()),
    });

    return NextResponse.json({
      data: { id: voteId },
      success: true,
    });
  } catch (error) {
    console.error("Error creating vote:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

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

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
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
