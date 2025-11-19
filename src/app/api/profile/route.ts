import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await getAuthenticatedConvexClient();

    // Resolve Convex user - always use Clerk ID for lookup since it's more reliable
    let user = null;

    // Always try to look up by Clerk ID first, since session.user.clerkId is always available
    if (session.user.clerkId) {
      user = await client.query(api.users.getUserByClerkId, {
        clerkId: session.user.clerkId,
      });
    } else {
      // Fallback: if somehow we don't have a Clerk ID, try using session.user.id directly
      // This should only happen in edge cases
      user = await client.query(api.users.getUserById, {
        userId: session.user.id as any,
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    // Resolve Convex user ID - always use Clerk ID for lookup since it's more reliable
    let convexUserId = null;

    // Always try to look up by Clerk ID first to get the Convex user ID
    if (session.user.clerkId) {
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
    } else {
      // Fallback: use session.user.id directly if it's already a Convex ID
      convexUserId = session.user.id as any;
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
