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
    // Debug: Check environment variables

    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await getAuthenticatedConvexClient();

    // Resolve Convex user - session.user.id might be a Clerk ID string
    let user = null;

    // Check if session.user.id is a valid Convex ID (starts with a letter)
    // If not, it's likely a Clerk ID, so we need to look up the user by Clerk ID
    if (session.user.id && /^[a-z]/.test(session.user.id)) {
      // It's a valid Convex ID, use it directly
      user = await client.query(api.users.getUserById, {
        userId: session.user.id as any,
      });
    } else {
      // It's a Clerk ID, look up by Clerk ID
      if (!session.user.clerkId) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 },
        );
      }

      user = await client.query(api.users.getUserByClerkId, {
        clerkId: session.user.clerkId,
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
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: error instanceof Error ? error.message : String(error),
                type: error instanceof Error ? error.name : typeof error,
              }
            : undefined,
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

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
