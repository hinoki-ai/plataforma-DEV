import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import {
  createSuccessResponse,
  handleApiError,
  ApiErrorResponse,
} from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role) {
      return handleApiError(
        new ApiErrorResponse("Acceso no autorizado", 401, "UNAUTHORIZED"),
        "GET /api/profesores",
      );
    }

    const client = getConvexClient();

    // Get all active professors
    const professors = await client.query(api.users.getUsers, {
      role: "PROFESOR",
      isActive: true,
    });

    // Map to expected structure for the frontend
    const users = professors.map((professor) => ({
      id: professor._id,
      name: professor.name,
      email: professor.email,
    }));

    return createSuccessResponse({ data: users });
  } catch (error) {
    return handleApiError(error, "GET /api/profesores");
  }
}
