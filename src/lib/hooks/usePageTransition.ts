"use client";

import { useState, useEffect } from "react";

export interface UsePageTransitionOptions {
  /**
   * Loading duration in milliseconds
   * @default 800
   */
  duration?: number;

  /**
   * Whether to automatically trigger loading on mount
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Minimum loading time to prevent flashing
   * @default 300
   */
  minLoadTime?: number;
}

export interface PageTransitionState {
  /** Whether the page is currently loading */
  isLoading: boolean;

  /** Whether the component has mounted (for hydration safety) */
  mounted: boolean;

  /** Whether the page transition is complete */
  isComplete: boolean;

  /** Current loading progress (0-100) */
  progress: number;
}

export function usePageTransition(options: UsePageTransitionOptions = {}) {
  const { duration = 800, autoLoad = true, minLoadTime = 300 } = options;

  const [state, setState] = useState<PageTransitionState>({
    isLoading: autoLoad,
    mounted: false,
    isComplete: false,
    progress: 0,
  });

  useEffect(() => {
    // Mark as mounted for hydration safety
    setState((prev) => ({ ...prev, mounted: true }));

    if (!autoLoad) return;

    const startTime = Date.now();
    // Simulate progressive loading
    const progressInterval = setInterval(() => {
      setState((prev) => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 95);
        return { ...prev, progress: newProgress };
      });
    }, 50);

    // Complete loading after duration
    const loadingTimeout = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);

      setTimeout(() => {
        clearInterval(progressInterval);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isComplete: true,
          progress: 100,
        }));
      }, remainingTime);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
    };
  }, [autoLoad, duration, minLoadTime]);

  const triggerTransition = () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      isComplete: false,
      progress: 0,
    }));
  };

  const completeTransition = () => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      isComplete: true,
      progress: 100,
    }));
  };

  return {
    ...state,
    triggerTransition,
    completeTransition,
  };
}

/**
 * Hook for configurable skeleton loading timer
 */
export function useSkeletonTimer(duration: number = 800) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return { isLoading };
}

/**
 * Hook for progressive animation with staggered delays
 */
export function useProgressiveAnimation(
  elements: number = 5,
  baseDelay: number = 150,
) {
  const [mounted, setMounted] = useState(false);
  const [visibleElements, setVisibleElements] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    setMounted(true);

    // Stagger the appearance of elements
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < elements; i++) {
      const timeout = setTimeout(() => {
        setVisibleElements((prev) => new Set([...prev, i]));
      }, baseDelay * i);

      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [elements, baseDelay]);

  const getElementProps = (index: number) => ({
    className: `transition-all duration-700 ease-out ${
      mounted && visibleElements.has(index)
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-4"
    }`,
    style: {
      transitionDelay: `${index * baseDelay}ms`,
    },
  });

  return {
    mounted,
    getElementProps,
    isElementVisible: (index: number) => visibleElements.has(index),
  };
}

/**
 * Utility function to create progressive reveal animations
 */
export function createProgressiveReveal(
  totalElements: number,
  baseDelay: number = 150,
) {
  return Array.from({ length: totalElements }, (_, index) => ({
    delay: index * baseDelay,
    className: `transition-all duration-700 ease-out delay-[${index * baseDelay}ms]`,
  }));
}
