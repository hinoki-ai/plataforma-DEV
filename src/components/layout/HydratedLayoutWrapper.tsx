"use client";

import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";

interface HydratedLayoutWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that ensures content is only rendered after hydration
 * This prevents hydration mismatches from localStorage, theme, and other client-side state
 * No loading states shown here - pages handle their own loading
 */
function HydratedLayoutWrapper({
  children,
  fallback,
}: HydratedLayoutWrapperProps) {
  const isHydrated = useHydrationSafe();

  // DEBUG: Log hydration status
  console.log(
    "[HYDRATION DEBUG] HydratedLayoutWrapper - isHydrated:",
    isHydrated,
    "typeof window:",
    typeof window,
  );

  // TEMPORARILY DISABLE HYDRATION CHECK FOR DEBUGGING
  // if (!isHydrated) {
  //   console.log('[HYDRATION DEBUG] HydratedLayoutWrapper - Returning null (not hydrated)');
  //   return null;
  // }

  console.log(
    "[HYDRATION DEBUG] HydratedLayoutWrapper - Rendering children (hydration check disabled)",
  );
  return <>{children}</>;
}

export default HydratedLayoutWrapper;
