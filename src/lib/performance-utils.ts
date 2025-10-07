// Performance optimization utilities for the dashboard
import React from "react";

export interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure function execution time
  measureExecutionTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      this.metrics.set(`${name}_execution_time`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.metrics.set(`${name}_execution_time`, end - start);
      throw error;
    }
  }

  // Async function execution time measurement
  async measureAsyncExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      this.metrics.set(`${name}_execution_time`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.metrics.set(`${name}_execution_time`, end - start);
      throw error;
    }
  }

  // API response time measurement
  measureApiCall(url: string, startTime?: number): void {
    const start = startTime || performance.now();
    const end = performance.now();
    const responseTime = end - start;

    this.metrics.set(`api_${url}_response_time`, responseTime);

    // Track average response time
    const existingTimes = this.metrics.get("api_response_times") || [];
    existingTimes.push(responseTime);
    if (existingTimes.length > 100) {
      existingTimes.shift(); // Keep only last 100 measurements
    }
    this.metrics.set("api_response_times", existingTimes);
  }

  // Memory usage tracking
  trackMemoryUsage(): void {
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory;
      this.metrics.set("memory_used", memory.usedJSHeapSize);
      this.metrics.set("memory_total", memory.totalJSHeapSize);
      this.metrics.set("memory_limit", memory.jsHeapSizeLimit);
    }
  }

  // Cache performance tracking
  trackCacheHit(hit: boolean): void {
    const cacheStats = this.metrics.get("cache_stats") || {
      hits: 0,
      misses: 0,
    };
    if (hit) {
      cacheStats.hits++;
    } else {
      cacheStats.misses++;
    }
    this.metrics.set("cache_stats", cacheStats);
  }

  // Get cache hit rate
  getCacheHitRate(): number {
    const cacheStats = this.metrics.get("cache_stats") || {
      hits: 0,
      misses: 0,
    };
    const total = cacheStats.hits + cacheStats.misses;
    return total > 0 ? (cacheStats.hits / total) * 100 : 0;
  }

  // Error rate tracking
  trackError(): void {
    const errorCount = this.metrics.get("error_count") || 0;
    this.metrics.set("error_count", errorCount + 1);
  }

  // Get error rate (errors per 100 requests)
  getErrorRate(): number {
    const errorCount = this.metrics.get("error_count") || 0;
    const apiTimes = this.metrics.get("api_response_times") || [];
    const totalRequests = apiTimes.length;
    return totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
  }

  // Get all metrics
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    for (const [key, value] of this.metrics.entries()) {
      metrics[key] = value;
    }

    // Computed metrics
    metrics.cache_hit_rate = this.getCacheHitRate();
    metrics.error_rate = this.getErrorRate();
    metrics.average_api_response_time = this.getAverageApiResponseTime();

    return metrics;
  }

  // Get average API response time
  getAverageApiResponseTime(): number {
    const apiTimes = this.metrics.get("api_response_times") || [];
    if (apiTimes.length === 0) return 0;

    const sum = apiTimes.reduce((acc: number, time: number) => acc + time, 0);
    return sum / apiTimes.length;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Performance observer for automatic tracking
  startObserving(): void {
    // Observe navigation timing
    if ("PerformanceObserver" in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.set(
              "navigation_load_time",
              navEntry.loadEventEnd - navEntry.fetchStart,
            );
            this.metrics.set(
              "navigation_dom_time",
              navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart,
            );
          }
        }
      });

      navObserver.observe({ entryTypes: ["navigation"] });
      this.observers.set("navigation", navObserver);

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource" && entry.name.includes("/api/")) {
            this.measureApiCall(entry.name);
          }
        }
      });

      resourceObserver.observe({ entryTypes: ["resource"] });
      this.observers.set("resource", resourceObserver);
    }
  }

  // Stop observing
  stopObserving(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    performanceMonitor.startObserving();

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      performanceMonitor.stopObserving();
    };
  }, []);

  return {
    metrics,
    clearMetrics: () => performanceMonitor.clearMetrics(),
  };
}

// Utility functions for optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Image lazy loading utility
export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

// Bundle splitting utility
export const loadComponentDynamically = <T>(
  importFn: () => Promise<{ default: T }>,
): Promise<T> => {
  return importFn().then((module) => module.default);
};

// Error fallback component
const ErrorFallback = () =>
  React.createElement("div", null, "Error loading component");

// React lazy with error boundary
export const lazyWithErrorBoundary = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
) => {
  return React.lazy(() =>
    importFn().catch((error) => {
      console.error("Error loading component:", error);
      return { default: ErrorFallback as any };
    }),
  );
};
