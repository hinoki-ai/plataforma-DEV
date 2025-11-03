import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClerkUsers } from "@/services/actions/clerk-users";
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

    // Get all active professors from Clerk
    const professors = await getClerkUsers("PROFESOR");

    // Filter only active professors and map to expected structure for the frontend
    const users = professors
      .filter((professor) => professor.isActive)
      .map((professor) => ({
        id: professor.id,
        name: professor.name,
        email: professor.email,
      }));

    return createSuccessResponse({ data: users });
  } catch (error) {
    return handleApiError(error, "GET /api/profesores");
  }
}
