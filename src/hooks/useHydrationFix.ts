"use client";

import { useLayoutEffect, useState, useEffect } from "react";

/**
 * Hook to detect and handle hydration state
 * Returns true when the component has been hydrated on the client
 */
export function useHydrationFix() {
  const [isHydrated, setIsHydrated] = useState(false);

   
  useLayoutEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook to handle client-only rendering with fallback
 * Useful for components that should only render on the client
 */
export function useClientOnly<T>(
  clientValue: T | (() => T),
  serverValue: T,
): T {
  const [value, setValue] = useState<T>(serverValue);

   
  useLayoutEffect(() => {
    setValue(
      typeof clientValue === "function"
        ? (clientValue as () => T)()
        : clientValue,
    );
  }, [clientValue]);

  return value;
}

/**
 * Hook to safely access browser APIs
 * Returns null during SSR and the actual value on client
 */
export function useBrowserAPI<T>(
  getter: () => T,
  defaultValue: T | null = null,
): T | null {
  const [value, setValue] = useState<T | null>(defaultValue);

   
  useLayoutEffect(() => {
    try {
      setValue(getter());
    } catch (error) {
      console.error("Browser API access error:", error);
      setValue(defaultValue);
    }
  }, []);

  return value;
}

/**
 * Hook to handle dynamic imports that should only load on client
 */
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  fallback: T | null = null,
): T | null {
  const [module, setModule] = useState<T | null>(fallback);

   
  useLayoutEffect(() => {
    importFn()
      .then(setModule)
      .catch((error) => {
        console.error("Dynamic import failed:", error);
        setModule(fallback);
      });
  }, []);

  return module;
}

/**
 * Hook for conditional rendering based on hydration state
 */
export function useConditionalRender(
  condition: boolean | (() => boolean),
  waitForHydration: boolean = true,
): boolean {
  const isHydrated = useHydrationFix();
  const [shouldRender, setShouldRender] = useState(false);

   
  useLayoutEffect(() => {
    if (!waitForHydration || isHydrated) {
      setShouldRender(
        typeof condition === "function" ? condition() : condition,
      );
    }
  }, [condition, isHydrated, waitForHydration]);

  return shouldRender;
}

/**
 * Hook to debounce hydration checks
 * Useful for components that need to wait for multiple hydration cycles
 */
export function useDelayedHydration(delayMs: number = 100): boolean {
  const [isReady, setIsReady] = useState(false);

   
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return isReady;
}

/**
 * Hook to track hydration errors
 */
export function useHydrationError(onError?: (error: Error) => void): {
  hasError: boolean;
  error: Error | null;
} {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

   
  useLayoutEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || "";

      if (
        errorMessage.toLowerCase().includes("hydration") ||
        errorMessage.includes("Text content does not match") ||
        errorMessage.includes("expected server HTML")
      ) {
        const hydrationError = new Error(`Hydration error: ${errorMessage}`);
        setHasError(true);
        setError(hydrationError);
        onError?.(hydrationError);
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [onError]);

  return { hasError, error };
}

/**
 * Hook to sync server and client state
 */
export function useStateSync<T>(serverValue: T, clientValue: T | (() => T)): T {
  const [value, setValue] = useState(serverValue);
  const isHydrated = useHydrationFix();

   
  useLayoutEffect(() => {
    if (isHydrated) {
      setValue(
        typeof clientValue === "function"
          ? (clientValue as () => T)()
          : clientValue,
      );
    }
  }, [isHydrated, clientValue]);

  return value;
}
