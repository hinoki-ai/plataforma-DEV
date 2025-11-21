import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const preferencesUpdateSchema = z.object({
  eventReminders: z.boolean().optional(),
  monthlyNewsletter: z.boolean().optional(),
  profileVisible: z.boolean().optional(),
  shareActivity: z.boolean().optional(),
});

// POST /api/profile/preferences - Update user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = preferencesUpdateSchema.parse(body);

    // For now, preferences are stored client-side in localStorage
    // In the future, add a preferences field to the user schema
    // This endpoint can be used to validate and acknowledge preference updates
    return NextResponse.json({
      success: true,
      preferences: validatedData,
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
