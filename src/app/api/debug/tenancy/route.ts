import { NextRequest } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { createApiRoute } from "@/lib/api-validation";
import { createSuccessResponse } from "@/lib/api-error";

// Debug route to check tenancy status
export const GET = createApiRoute(
  async (request, validated) => {
    const session = validated.session;

    if (!session?.user?.id) {
      throw new Error("User ID is required");
    }

    const userId = session.user.id as any;
    const client = getConvexClient();

    try {
      // Get user info
      const user = await client.query(api.users.getUserById, { userId });

      // Try to get tenancy context (this will fail if tenancy is not set up)
      const tenancyContext = await client.query(api.tenancy.getCurrentTenancy, {});

      return createSuccessResponse({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          currentInstitutionId: user.currentInstitutionId,
          isActive: user.isActive,
        },
        tenancy: tenancyContext,
      });
    } catch (error) {
      return createSuccessResponse({
        user: user ? {
          id: user._id,
          email: user.email,
          role: user.role,
          currentInstitutionId: user.currentInstitutionId,
          isActive: user.isActive,
        } : null,
        error: error.message,
        errorStack: error.stack,
      });
    }
  },
  {
    requiredRole: "TEACHER_PLUS",
  },
);
