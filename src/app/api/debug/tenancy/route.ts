import { NextRequest } from "next/server";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
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

    const userId = session.data?.user.id as any;
    const client = await getAuthenticatedConvexClient();

    try {
      // Get user info
      const user = await client.query(api.users.getUserById, { userId });

      // Try to get tenancy context (this will fail if tenancy is not set up)
      const tenancyContext = await client.query(
        api.tenancy.getCurrentTenancy,
        {},
      );

      return createSuccessResponse({
        user: user
          ? {
              id: user._id,
              email: user.email,
              role: user.role,
              currentInstitutionId: user.currentInstitutionId,
              isActive: user.isActive,
            }
          : null,
        tenancy: tenancyContext,
      });
    } catch (error) {
      return createSuccessResponse({
        user: null,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
    }
  },
  {
    requiredRole: "TEACHER_PLUS",
  },
);
