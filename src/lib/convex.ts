/**
 * Convex Client Configuration
 * Central configuration for Convex backend
 */

import { ConvexHttpClient } from "convex/browser";

// Get Convex URL from environment
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not configured - authentication will fail");
}

// Create HTTP client for server-side operations
let convexHttpClient: ConvexHttpClient | null = null;

try {
  if (CONVEX_URL) {
    convexHttpClient = new ConvexHttpClient(CONVEX_URL);
    console.log("✅ Convex client initialized:", CONVEX_URL);
  }
} catch (error) {
  console.error("❌ Failed to initialize Convex client:", error);
}

// Helper function to ensure client is available
export function getConvexClient(): ConvexHttpClient {
  if (!convexHttpClient || !CONVEX_URL) {
    throw new Error(
      "Convex client not initialized. Set NEXT_PUBLIC_CONVEX_URL in environment.",
    );
  }
  return convexHttpClient;
}

export { convexHttpClient };
