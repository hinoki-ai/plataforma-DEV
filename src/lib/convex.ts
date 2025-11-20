/**
 * Convex Client Configuration
 * Central configuration for Convex backend
 */

import { ConvexHttpClient } from "convex/browser";

// Get Convex URL from environment
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
}

// Create HTTP client for server-side operations
let convexHttpClient: ConvexHttpClient | null = null;

try {
  if (CONVEX_URL) {
    convexHttpClient = new ConvexHttpClient(CONVEX_URL);
  }
} catch (error) {}

// Helper function to get authenticated Convex client
export function getConvexClient(token?: string): ConvexHttpClient {
  if (!convexHttpClient || !CONVEX_URL) {
    throw new Error(
      "Convex client not initialized. Set NEXT_PUBLIC_CONVEX_URL in environment.",
    );
  }

  // Set authentication token if provided
  if (token) {
    convexHttpClient.setAuth(token);
  }

  return convexHttpClient;
}

export { convexHttpClient };
