"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Enhanced loading state interface with race condition prevention
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Configuration options for the loading state hook
 */
export interface UseLoadingStateOptions {
  /** Initial loading state */
  initialLoading?: boolean;
  /** Minimum loading time to prevent flashing (ms) */
  minLoadingTime?: number;
  /** Maximum loading time before timeout (ms) */
  maxLoadingTime?: number;
  /** Auto-reset error after timeout (ms) */
  errorResetTime?: number;
}

/**
 * Return type for the useLoadingState hook
 */
export interface UseLoadingStateReturn {
  /** Current loading state */
  loadingState: LoadingState;
  /** Start loading with optional operation ID */
  startLoading: (operationId?: string) => string;
  /** Stop loading for specific operation ID */
  stopLoading: (operationId: string, error?: string) => void;
  /** Stop all loading operations */
  stopAllLoading: (error?: string) => void;
  /** Reset loading state */
  reset: () => void;
  /** Check if any operation is still loading */
  isAnyLoading: boolean;
  /** Get loading operations count */
  loadingCount: number;
}

/**
 * Enhanced loading state hook that prevents race conditions
 *
 * @param options Configuration options
 * @returns Loading state management functions
 */
export function useLoadingState(
  options: UseLoadingStateOptions = {},
): UseLoadingStateReturn {
  const {
    initialLoading = false,
    minLoadingTime = 300,
    maxLoadingTime = 30000,
    errorResetTime = 5000,
  } = options;

  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    lastUpdated: initialLoading ? new Date() : null,
  });
  const [loadingCount, setLoadingCount] = useState(initialLoading ? 1 : 0);

  // Track active operations to prevent race conditions
  const activeOperations = useRef<
    Map<
      string,
      {
        startTime: Date;
        timeoutId?: ReturnType<typeof setTimeout>;
        minTimeTimeoutId?: ReturnType<typeof setTimeout>;
      }
    >
  >(new Map());

  // Counter for generating unique operation IDs
  const operationIdCounter = useRef(0);

  // Auto-reset error timeout
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Update loading state based on active operations
   */
  const updateLoadingState = useCallback(
    (error?: string) => {
      const hasActiveOperations = activeOperations.current.size > 0;

      setLoadingState((prev) => ({
        ...prev,
        isLoading: hasActiveOperations,
        error: error || null,
        lastUpdated: hasActiveOperations ? prev.lastUpdated : new Date(),
      }));

      // Auto-reset error after timeout if there's an error
      if (error && errorResetTime > 0) {
        errorTimeoutRef.current = setTimeout(() => {
          setLoadingState((prev) => ({
            ...prev,
            error: null,
          }));
        }, errorResetTime);
      }
    },
    [errorResetTime],
  );

  /**
   * Stop a specific loading operation
   */
  const stopLoading = useCallback(
    (operationId: string, error?: string) => {
      const operation = activeOperations.current.get(operationId);
      if (!operation) return;

      const { startTime, timeoutId, minTimeTimeoutId } = operation;
      const elapsedTime = Date.now() - startTime.getTime();

      // Clear timeouts
      if (timeoutId) clearTimeout(timeoutId);
      if (minTimeTimeoutId) clearTimeout(minTimeTimeoutId);

      // Remove operation
      activeOperations.current.delete(operationId);

      // Check if minimum loading time has passed
      const remainingMinTime = minLoadingTime - elapsedTime;

      if (remainingMinTime > 0) {
        // Wait for minimum loading time before updating state
        const minTimeTimeoutId = setTimeout(() => {
          updateLoadingState(error);
          setLoadingCount((prev) => Math.max(0, prev - 1));
        }, remainingMinTime);

        // Update operation with new timeout
        activeOperations.current.set(operationId, {
          ...operation,
          minTimeTimeoutId,
        });
      } else {
        updateLoadingState(error);
        setLoadingCount((prev) => Math.max(0, prev - 1));
      }
    },
    [minLoadingTime, updateLoadingState, setLoadingCount],
  );

  /**
   * Start a loading operation
   */
  const startLoading = useCallback(
    (operationId?: string): string => {
      const id = operationId || `operation_${operationIdCounter.current++}`;
      const startTime = new Date();

      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Set up timeout for maximum loading time
      const timeoutId = setTimeout(() => {
        console.warn(
          `Loading operation ${id} exceeded maximum time (${maxLoadingTime}ms)`,
        );
        stopLoading(
          id,
          "La operación tardó demasiado tiempo. Inténtelo de nuevo.",
        );
      }, maxLoadingTime);

      // Store operation data
      activeOperations.current.set(id, {
        startTime,
        timeoutId,
      });

      // Update loading state
      setLoadingState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        lastUpdated: startTime,
      }));

      // Update loading count
      setLoadingCount((prev) => prev + 1);

      return id;
    },
    [maxLoadingTime, stopLoading, setLoadingState, setLoadingCount],
  );

  /**
   * Stop all loading operations
   */
  const stopAllLoading = useCallback(
    (error?: string) => {
      // Clear all timeouts
      activeOperations.current.forEach((operation) => {
        if (operation.timeoutId) clearTimeout(operation.timeoutId);
        if (operation.minTimeTimeoutId)
          clearTimeout(operation.minTimeTimeoutId);
      });

      // Clear operations map
      activeOperations.current.clear();

      updateLoadingState(error);
      setLoadingCount(0);
    },
    [updateLoadingState, setLoadingCount],
  );

  /**
   * Reset loading state completely
   */
  const reset = useCallback(() => {
    // Clear all timeouts
    activeOperations.current.forEach((operation) => {
      if (operation.timeoutId) clearTimeout(operation.timeoutId);
      if (operation.minTimeTimeoutId) clearTimeout(operation.minTimeTimeoutId);
    });

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Clear operations
    activeOperations.current.clear();

    // Reset state
    setLoadingState({
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
    setLoadingCount(0);
  }, []);

  // Computed values
  const isAnyLoading = loadingState.isLoading;

  return {
    loadingState,
    startLoading,
    stopLoading,
    stopAllLoading,
    reset,
    isAnyLoading,
    loadingCount,
  };
}

/**
 * Simplified hook for single operations (backward compatibility)
 */
export function useSimpleLoading(initialLoading = false) {
  const { loadingState, startLoading, stopLoading, stopAllLoading, reset } =
    useLoadingState({
      initialLoading,
      minLoadingTime: 0, // No minimum time for simple operations
    });

  const setLoading = useCallback(
    (loading: boolean, error?: string) => {
      if (loading) {
        startLoading();
      } else {
        stopAllLoading(error);
      }
    },
    [startLoading, stopAllLoading],
  );

  const setError = useCallback(
    (error: string) => {
      stopAllLoading(error);
    },
    [stopAllLoading],
  );

  return {
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    lastUpdated: loadingState.lastUpdated,
    setLoading,
    setError,
    reset,
  };
}

/**
 * Hook for managing multiple concurrent loading operations
 */
export function useConcurrentLoading() {
  const {
    loadingState,
    startLoading,
    stopLoading,
    isAnyLoading,
    loadingCount,
  } = useLoadingState({
    minLoadingTime: 0,
  });

  const wrapAsyncOperation = useCallback(
    <T>(operation: () => Promise<T>, operationId?: string): Promise<T> => {
      const id = startLoading(operationId);

      return operation()
        .then((result) => {
          stopLoading(id);
          return result;
        })
        .catch((error) => {
          stopLoading(id, error.message || "Error desconocido");
          throw error;
        });
    },
    [startLoading, stopLoading],
  );

  return {
    loadingState,
    startLoading,
    stopLoading,
    isAnyLoading,
    loadingCount,
    wrapAsyncOperation,
  };
}

export default useLoadingState;
