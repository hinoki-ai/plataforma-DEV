/**
 * Convex Server-Side Client Configuration
 * Server-only functions for authenticated Convex operations
 */

import { ConvexHttpClient } from "convex/browser";
import { getConvexClient } from "./convex";

// Helper function to get authenticated Convex client from Clerk
// Use this in API routes that need to call tenant queries
export async function getAuthenticatedConvexClient(): Promise<ConvexHttpClient> {
  const { auth } = await import("@clerk/nextjs/server");
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Failed to get authentication token for Convex");
  }

  return getConvexClient(token);
}
