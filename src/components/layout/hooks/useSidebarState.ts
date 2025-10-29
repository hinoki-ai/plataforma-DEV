"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sidebar-collapsed";

function readPersistedState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw) as boolean;
    }
  } catch (error) {
    console.warn("Failed to read sidebar state from storage", error);
  }

  return window.innerWidth < 768;
}

export function useSidebarState(isHydrated: boolean) {
  const [manualState, setManualState] = useState<boolean>(() =>
    readPersistedState(),
  );

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(manualState));
    } catch (error) {
      console.warn("Failed to persist sidebar state", error);
    }
  }, [manualState, isHydrated]);

  const setIsSidebarCollapsed = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setManualState((prev) =>
        typeof value === "function"
          ? (value as (prev: boolean) => boolean)(prev)
          : value,
      );
    },
    [],
  );

  return {
    isSidebarCollapsed: manualState,
    setIsSidebarCollapsed,
  };
}
