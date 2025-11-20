import { NextRequest } from "next/server";
import { createSuccessResponse, handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error, stack, context, url, userAgent } = body;

    // Validate required fields
    if (!error) {
      return handleApiError(
        new Error("Error message is required"),
        "POST /api/errors",
      );
    }

    // Log the error with structured format

    return createSuccessResponse({
      id: Date.now().toString(),
      message: "Error tracked successfully",
    });
  } catch (err) {
    return handleApiError(err, "POST /api/errors");
  }
}
