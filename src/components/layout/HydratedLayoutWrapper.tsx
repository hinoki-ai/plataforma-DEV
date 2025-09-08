'use client';

import { useHydrationSafe } from '@/components/ui/hydration-error-boundary';

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

  // Don't show any loading - let pages handle their own loading states
  if (!isHydrated) {
    // Still wait for hydration but don't show loader
    return null;
  }

  return <>{children}</>;
}

export default HydratedLayoutWrapper;
