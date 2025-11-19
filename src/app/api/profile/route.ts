import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    console.log("Profile API: Starting request");

    const session = await auth();
    console.log("Profile API: Auth result", {
      hasSession: !!session,
      userId: session?.user?.id,
      clerkId: session?.user?.clerkId,
    });

    if (!session) {
      console.log("Profile API: No session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("Profile API: Getting Convex client");
    const client = await getAuthenticatedConvexClient();
    console.log("Profile API: Convex client obtained successfully");

    // Resolve Convex user - session.user.id might be a Clerk ID string
    let user = null;

    // Check if session.user.id is a valid Convex ID (starts with a letter)
    // If not, it's likely a Clerk ID, so we need to look up the user by Clerk ID
    const userId = session.user.id;
    const isConvexId = userId && /^[a-z]/.test(userId);
    console.log("Profile API: User ID analysis", {
      userId,
      isConvexId,
      clerkId: session.user.clerkId,
    });

    if (isConvexId) {
      // It's a valid Convex ID, use it directly
      console.log("Profile API: Querying by Convex ID", userId);
      try {
        user = await client.query(api.users.getUserById, {
          userId: userId as any,
        });
        console.log("Profile API: Convex ID query result", { found: !!user });
      } catch (queryError) {
        console.error("Profile API: Error querying by Convex ID:", {
          userId,
          error: queryError instanceof Error ? queryError.message : String(queryError)
        });
        return NextResponse.json(
          {
            error: "Database query failed",
            details: queryError instanceof Error ? queryError.message : String(queryError),
            userId
          },
          { status: 500 },
        );
      }
    } else {
      // It's a Clerk ID, look up by Clerk ID
      const clerkId = session.user.clerkId;
      if (!clerkId) {
        console.log("Profile API: No Clerk ID available for lookup, userId:", userId);
        return NextResponse.json(
          {
            error: "User not found in database",
            details: "No Clerk ID available for user lookup",
            userId: userId
          },
          { status: 404 },
        );
      }

      console.log("Profile API: Querying by Clerk ID", clerkId);
      try {
        user = await client.query(api.users.getUserByClerkId, {
          clerkId,
        });
        console.log("Profile API: Clerk ID query result", { found: !!user });
      } catch (queryError) {
        console.error("Profile API: Error querying by Clerk ID:", {
          clerkId,
          error: queryError instanceof Error ? queryError.message : String(queryError)
        });
        return NextResponse.json(
          {
            error: "Database query failed",
            details: queryError instanceof Error ? queryError.message : String(queryError),
            clerkId
          },
          { status: 500 },
        );
      }
    }

    if (!user) {
      console.log("Profile API: User not found in Convex database, attempting sync", { userId, clerkId: session.user.clerkId });

      // Try to sync the user from Clerk to Convex
      try {
        const clerkUser = await currentUser();
        if (clerkUser && session.user.clerkId) {
          console.log("Profile API: Syncing user from Clerk to Convex", session.user.clerkId);
          await client.mutation(api.users.syncFromClerk, {
            data: clerkUser,
          });

          // Try to fetch the user again after sync
          if (isConvexId) {
            user = await client.query(api.users.getUserById, {
              userId: userId as any,
            });
          } else {
            user = await client.query(api.users.getUserByClerkId, {
              clerkId: session.user.clerkId,
            });
          }

          if (user) {
            console.log("Profile API: User successfully synced and found");
          } else {
            console.log("Profile API: User sync completed but still not found");
          }
        } else {
          console.log("Profile API: Could not get Clerk user data for sync");
        }
      } catch (syncError) {
        console.error("Profile API: Failed to sync user from Clerk:", {
          error: syncError instanceof Error ? syncError.message : String(syncError),
          clerkId: session.user.clerkId
        });
      }

      // If still no user after sync attempt, return error
      if (!user) {
        return NextResponse.json({
          error: "User not found",
          details: "User exists in authentication but not in database. Sync attempted but failed.",
          userId: userId,
          clerkId: session.user.clerkId
        }, { status: 404 });
      }
    }

    // Default preferences
    const preferences = {
      eventReminders: true,
      monthlyNewsletter: false,
      profileVisible: true,
      shareActivity: false,
    };

    return NextResponse.json({
      id: user._id,
      name: user.name ?? "",
      email: user.email,
      phone: user.phone ?? "",
      image: user.image ?? null,
      preferences,
    });
  } catch (error) {
    console.error("Profile API: Error fetching profile:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    const client = await getAuthenticatedConvexClient();

    // Resolve Convex user ID - session.user.id might be a Clerk ID string
    let convexUserId = session.user.id as any;

    // Check if session.user.id is a valid Convex ID (starts with a letter)
    // If not, it's likely a Clerk ID, so we need to look up the user by Clerk ID
    if (!convexUserId || !/^[a-z]/.test(convexUserId)) {
      if (!session.user.clerkId) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 },
        );
      }

      const userByClerkId = await client.query(api.users.getUserByClerkId, {
        clerkId: session.user.clerkId,
      });

      if (!userByClerkId) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 },
        );
      }

      convexUserId = userByClerkId._id;
    }

    // Prepare update data with trimming
    const updateData: any = {};
    if (validatedData.name !== undefined) {
      const trimmedName = validatedData.name.trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.name = trimmedName;
    }
    if (validatedData.phone !== undefined) {
      const trimmedPhone = validatedData.phone.trim();
      updateData.phone = trimmedPhone || null; // Allow empty phone
    }

    // Update user
    const updatedUser = await client.mutation(api.users.updateUser, {
      id: convexUserId,
      ...updateData,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedUser._id,
      name: updatedUser.name ?? "",
      email: updatedUser.email,
      phone: updatedUser.phone ?? "",
      image: updatedUser.image ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
