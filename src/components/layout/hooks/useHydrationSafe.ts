'use client';

import { useState, useEffect } from 'react';

// Hook for client components to detect hydration
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
