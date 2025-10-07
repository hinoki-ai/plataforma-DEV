"use client";

import { useState, useEffect } from "react";

export function useSidebarState(isHydrated: boolean, pathname?: string) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize sidebar state after hydration to prevent mismatch
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved) {
        setIsSidebarCollapsed(JSON.parse(saved));
      }
    }
  }, [isHydrated]);

  // Persist sidebar state - only after hydration
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem(
        "sidebar-collapsed",
        JSON.stringify(isSidebarCollapsed),
      );
    }
  }, [isSidebarCollapsed, isHydrated]);

  // Auto-collapse sidebar on mobile when navigating - only after hydration
  useEffect(() => {
    if (
      isHydrated &&
      typeof window !== "undefined" &&
      window.innerWidth < 768
    ) {
      setIsSidebarCollapsed(true);
    }
  }, [pathname, isHydrated]);

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  };
}
