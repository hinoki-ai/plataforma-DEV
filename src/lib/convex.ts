/**
 * Convex Client Configuration
 * Central configuration for Convex backend
 */

import { ConvexHttpClient } from "convex/browser";

// Get Convex URL from environment
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.warn("NEXT_PUBLIC_CONVEX_URL not configured");
}

// Create HTTP client for server-side operations
export const convexHttpClient = CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : null;

// Helper function to ensure client is available
export function getConvexClient() {
  if (!convexHttpClient) {
    throw new Error("Convex client not initialized. Set NEXT_PUBLIC_CONVEX_URL in environment.");
  }
  return convexHttpClient;
}
