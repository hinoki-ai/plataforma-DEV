"use client";

import { useIntelligentPreloading } from "@/hooks/useIntelligentPreloading";

/**
 * Provider component that enables intelligent preloading across the application
 * This runs on every page to preload resources based on user behavior and route patterns
 */
export function PreloadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize intelligent preloading - this runs automatically on every route
  useIntelligentPreloading();

  return <>{children}</>;
}

