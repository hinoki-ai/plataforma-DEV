"use client";

import type { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Use a default URL if the env var is missing to prevent runtime crashes during build/preview
// In production, this MUST be set.
const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://happy-otter-123.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
