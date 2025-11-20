"use client";

import {
  useSyncExternalStore,
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";

/**
 * Hook to detect and handle hydration state
 * Returns true when the component has been hydrated on the client
 */
export function useHydrationFix() {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    // Trigger immediately on client
    if (typeof queueMicrotask === "function") {
      queueMicrotask(callback);
    } else {
      setTimeout(callback, 0);
    }

    return () => {};
  };

  const getClientSnapshot = () => true;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * Hook to handle client-only rendering with fallback
 * Useful for components that should only render on the client
 */
export function useClientOnly<T>(
  clientValue: T | (() => T),
  serverValue: T,
): T {
  const isHydrated = useHydrationFix();

  return useMemo(() => {
    if (!isHydrated) {
      return serverValue;
    }

    return typeof clientValue === "function"
      ? (clientValue as () => T)()
      : clientValue;
  }, [isHydrated, clientValue, serverValue]);
}

/**
 * Hook to safely access browser APIs
 * Returns null during SSR and the actual value on client
 */
export function useBrowserAPI<T>(
  getter: () => T,
  defaultValue: T | null = null,
): T | null {
  const isHydrated = useHydrationFix();

  return useMemo(() => {
    if (!isHydrated) {
      return defaultValue;
    }

    try {
      return getter();
    } catch (error) {
      return defaultValue;
    }
  }, [isHydrated, getter, defaultValue]);
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

  return useMemo(() => {
    if (!waitForHydration || isHydrated) {
      return typeof condition === "function" ? condition() : condition;
    }
    return false;
  }, [condition, isHydrated, waitForHydration]);
}

/**
 * Hook to debounce hydration checks
 * Useful for components that need to wait for multiple hydration cycles
 */
export function useDelayedHydration(delayMs: number = 100): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const timer = setTimeout(callback, delayMs);
    return () => clearTimeout(timer);
  };

  const getClientSnapshot = () => true;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
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
  const isHydrated = useHydrationFix();

  return useMemo(() => {
    if (!isHydrated) {
      return serverValue;
    }

    return typeof clientValue === "function"
      ? (clientValue as () => T)()
      : clientValue;
  }, [isHydrated, serverValue, clientValue]);
}
