"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift

  // Additional metrics
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  domContentLoaded: number | null;
  loadComplete: number | null;

  // Custom metrics
  routeChangeTime: number | null;
  renderTime: number | null;
  bundleSize: number | null;

  // Resource metrics
  totalResources: number;
  failedResources: number;
  cacheHits: number;

  // User experience
  timeToInteractive: number | null;
  totalBlockingTime: number | null;
}

interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  cached: boolean;
  failed: boolean;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

/**
 * Comprehensive performance monitoring hook
 */
export function usePerformanceMonitoring(
  options: {
    enabled?: boolean;
    sampleRate?: number;
    reportEndpoint?: string;
    thresholds?: Partial<PerformanceThresholds>;
    enableRUM?: boolean; // Real User Monitoring
  } = {},
) {
  const {
    enabled = process.env.NODE_ENV === "production",
    sampleRate = 1.0,
    reportEndpoint,
    thresholds = {},
    enableRUM = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
    routeChangeTime: null,
    renderTime: null,
    bundleSize: null,
    totalResources: 0,
    failedResources: 0,
    cacheHits: 0,
    timeToInteractive: null,
    totalBlockingTime: null,
  });

  const [resourceTimings, setResourceTimings] = useState<ResourceTiming[]>([]);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  const routeStartTimeRef = useRef<number>(0);
  const renderStartTimeRef = useRef<number>(0);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const lcpObserverRef = useRef<PerformanceObserver | null>(null);
  const clsObserverRef = useRef<PerformanceObserver | null>(null);
  const combinedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Measure Core Web Vitals
  const measureWebVitals = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    try {
      // Largest Contentful Paint (LCP)
      if ("PerformanceObserver" in window) {
        lcpObserverRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));
          }
        });
        lcpObserverRef.current.observe({
          entryTypes: ["largest-contentful-paint"],
        });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        clsObserverRef.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics((prev) => ({ ...prev, cls: clsValue }));
            }
          }
        });
        clsObserverRef.current.observe({ entryTypes: ["layout-shift"] });
      }

      // First Input Delay (FID)
      const handleFirstInput = (event: Event) => {
        const fidEntry = event as any;
        if (fidEntry.processingStart && fidEntry.startTime) {
          const fid = fidEntry.processingStart - fidEntry.startTime;
          setMetrics((prev) => ({ ...prev, fid }));
        }

        // Remove listener after first input
        removeEventListener("pointerdown", handleFirstInput, {
          capture: true,
        } as any);
        removeEventListener("keydown", handleFirstInput, {
          capture: true,
        } as any);
      };

      addEventListener("pointerdown", handleFirstInput, {
        capture: true,
        once: true,
      });
      addEventListener("keydown", handleFirstInput, {
        capture: true,
        once: true,
      });
    } catch (error) {
      console.error("Error measuring Web Vitals:", error);
    }
  }, [enabled]);

  // Measure navigation timing
  const measureNavigationTiming = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    try {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      const metrics = {
        ttfb: navigation.responseStart - navigation.requestStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          ((navigation as any).activationStart || 0),
        loadComplete:
          navigation.loadEventEnd - ((navigation as any).activationStart || 0),
        fcp: null as number | null,
      };

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType("paint");
      const fcpEntry = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint",
      );
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      setMetrics((prev) => ({ ...prev, ...metrics }));
    } catch (error) {
      console.error("Error measuring navigation timing:", error);
    }
  }, [enabled]);

  // Measure resource performance
  const measureResourceTiming = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    try {
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      const resourceData: ResourceTiming[] = [];

      let totalSize = 0;
      let cacheHits = 0;
      let failedCount = 0;

      resources.forEach((resource) => {
        const size = (resource as any).transferSize || 0;
        const cached =
          (resource as any).transferSize === 0 && resource.duration > 0;
        const failed = resource.duration === 0;

        if (cached) cacheHits++;
        if (failed) failedCount++;

        totalSize += size;

        resourceData.push({
          name: resource.name,
          duration: resource.duration,
          size,
          type: getResourceType(resource.name),
          cached,
          failed,
        });
      });

      setResourceTimings(resourceData);
      setMetrics((prev) => ({
        ...prev,
        totalResources: resources.length,
        cacheHits,
        failedResources: failedCount,
        bundleSize: totalSize,
      }));
    } catch (error) {
      console.error("Error measuring resource timing:", error);
    }
  }, [enabled]);

  // Calculate performance score
  const calculatePerformanceScore = useCallback(
    (metrics: PerformanceMetrics) => {
      let score = 100;
      let factors = 0;

      // LCP scoring (25% weight)
      if (metrics.lcp !== null) {
        if (metrics.lcp <= combinedThresholds.lcp.good) {
          score -= 0;
        } else if (metrics.lcp <= combinedThresholds.lcp.needsImprovement) {
          score -= 15;
        } else {
          score -= 25;
        }
        factors++;
      }

      // FID scoring (25% weight)
      if (metrics.fid !== null) {
        if (metrics.fid <= combinedThresholds.fid.good) {
          score -= 0;
        } else if (metrics.fid <= combinedThresholds.fid.needsImprovement) {
          score -= 15;
        } else {
          score -= 25;
        }
        factors++;
      }

      // CLS scoring (25% weight)
      if (metrics.cls !== null) {
        if (metrics.cls <= combinedThresholds.cls.good) {
          score -= 0;
        } else if (metrics.cls <= combinedThresholds.cls.needsImprovement) {
          score -= 15;
        } else {
          score -= 25;
        }
        factors++;
      }

      // FCP scoring (25% weight)
      if (metrics.fcp !== null) {
        if (metrics.fcp <= combinedThresholds.fcp.good) {
          score -= 0;
        } else if (metrics.fcp <= combinedThresholds.fcp.needsImprovement) {
          score -= 15;
        } else {
          score -= 25;
        }
        factors++;
      }

      // Resource efficiency bonus/penalty
      const cacheHitRatio =
        metrics.totalResources > 0
          ? metrics.cacheHits / metrics.totalResources
          : 0;
      const failureRatio =
        metrics.totalResources > 0
          ? metrics.failedResources / metrics.totalResources
          : 0;

      score += Math.round(cacheHitRatio * 10); // Up to 10 points for good caching
      score -= Math.round(failureRatio * 20); // Up to 20 points penalty for failures

      return Math.max(0, Math.min(100, score));
    },
    [combinedThresholds],
  );

  // Track route changes
  const trackRouteChange = useCallback(() => {
    const routeEndTime = performance.now();
    const routeChangeTime = routeEndTime - routeStartTimeRef.current;

    setMetrics((prev) => ({ ...prev, routeChangeTime }));

    // Reset for next measurement
    routeStartTimeRef.current = performance.now();
  }, []);

  // Send performance data to analytics endpoint
  const reportMetrics = useCallback(
    (metricsData: PerformanceMetrics) => {
      if (!reportEndpoint || Math.random() > sampleRate) return;

      // Add user agent and connection info
      const reportData = {
        ...metricsData,
        userAgent: navigator.userAgent,
        // @ts-expect-error network info API not in TS lib yet
        connection: navigator.connection?.effectiveType || "unknown",
        timestamp: Date.now(),
        url: pathname,
        performanceScore: calculatePerformanceScore(metricsData),
      };

      // Send to analytics endpoint (non-blocking)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(reportEndpoint, JSON.stringify(reportData));
      } else {
        fetch(reportEndpoint, {
          method: "POST",
          body: JSON.stringify(reportData),
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch((error) => {
          console.warn("Failed to report performance metrics:", error);
        });
      }
    },
    [reportEndpoint, sampleRate, pathname, calculatePerformanceScore],
  );

  // Initialize performance monitoring
  useEffect(() => {
    if (!enabled) return;

    const initializeMonitoring = () => {
      measureWebVitals();
      measureNavigationTiming();
      measureResourceTiming();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeMonitoring);
    } else {
      initializeMonitoring();
    }

    // Additional measurements after load
    window.addEventListener("load", () => {
      setTimeout(() => {
        measureResourceTiming();
        const currentScore = calculatePerformanceScore(metrics);
        setPerformanceScore(currentScore);

        if (enableRUM) {
          reportMetrics(metrics);
        }
      }, 1000);
    });

    return () => {
      document.removeEventListener("DOMContentLoaded", initializeMonitoring);
      lcpObserverRef.current?.disconnect();
      clsObserverRef.current?.disconnect();
      observerRef.current?.disconnect();
    };
  }, [
    enabled,
    measureWebVitals,
    measureNavigationTiming,
    measureResourceTiming,
    calculatePerformanceScore,
    metrics,
    enableRUM,
    reportMetrics,
  ]);

  // Track route changes
  useEffect(() => {
    routeStartTimeRef.current = performance.now();
    trackRouteChange();
  }, [pathname, trackRouteChange]);

  // Update performance score when metrics change
  useEffect(() => {
    const newScore = calculatePerformanceScore(metrics);
    setPerformanceScore(newScore);
  }, [metrics, calculatePerformanceScore]);

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.lcp && metrics.lcp > combinedThresholds.lcp.needsImprovement) {
      recommendations.push(
        "Optimizar Largest Contentful Paint - considerar lazy loading de imágenes",
      );
    }

    if (metrics.fid && metrics.fid > combinedThresholds.fid.needsImprovement) {
      recommendations.push(
        "Reducir First Input Delay - optimizar JavaScript y usar Web Workers",
      );
    }

    if (metrics.cls && metrics.cls > combinedThresholds.cls.needsImprovement) {
      recommendations.push(
        "Reducir Cumulative Layout Shift - definir dimensiones de imágenes y elementos",
      );
    }

    if (metrics.fcp && metrics.fcp > combinedThresholds.fcp.good) {
      recommendations.push(
        "Mejorar First Contentful Paint - optimizar critical rendering path",
      );
    }

    if (metrics.ttfb && metrics.ttfb > combinedThresholds.ttfb.good) {
      recommendations.push(
        "Reducir Time to First Byte - optimizar servidor y CDN",
      );
    }

    const cacheHitRatio =
      metrics.totalResources > 0
        ? metrics.cacheHits / metrics.totalResources
        : 0;
    if (cacheHitRatio < 0.7) {
      recommendations.push(
        "Mejorar estrategia de cache - implementar cache headers apropiados",
      );
    }

    if (metrics.failedResources > 0) {
      recommendations.push(
        `Resolver ${metrics.failedResources} recursos fallidos`,
      );
    }

    if (metrics.bundleSize && metrics.bundleSize > 1000000) {
      // 1MB
      recommendations.push(
        "Reducir tamaño de bundle - implementar code splitting",
      );
    }

    return recommendations;
  }, [metrics, combinedThresholds]);

  // Get resource breakdown
  const getResourceBreakdown = useCallback(() => {
    const breakdown = resourceTimings.reduce(
      (acc, resource) => {
        if (!acc[resource.type]) {
          acc[resource.type] = {
            count: 0,
            size: 0,
            duration: 0,
            cached: 0,
            failed: 0,
          };
        }

        acc[resource.type].count++;
        acc[resource.type].size += resource.size;
        acc[resource.type].duration += resource.duration;
        if (resource.cached) acc[resource.type].cached++;
        if (resource.failed) acc[resource.type].failed++;

        return acc;
      },
      {} as Record<
        string,
        {
          count: number;
          size: number;
          duration: number;
          cached: number;
          failed: number;
        }
      >,
    );

    return breakdown;
  }, [resourceTimings]);

  return {
    metrics,
    resourceTimings,
    performanceScore,
    getRecommendations,
    getResourceBreakdown,

    // Manual measurement triggers
    measureNow: () => {
      measureNavigationTiming();
      measureResourceTiming();
    },

    // Utilities
    isGoodPerformance: performanceScore >= 90,
    needsImprovement: performanceScore < 75,

    // Export data for debugging
    exportData: () => ({
      metrics,
      resourceTimings,
      performanceScore,
      recommendations: getRecommendations(),
      breakdown: getResourceBreakdown(),
    }),
  };
}

/**
 * Hook for monitoring component render performance
 */
export function useRenderPerformance(
  componentName: string,
  enabled: boolean = false,
) {
  const renderStartTime = useRef<number>(0);
  const [renderMetrics, setRenderMetrics] = useState<{
    totalRenders: number;
    avgRenderTime: number;
    slowRenders: number;
    lastRenderTime: number;
  }>({
    totalRenders: 0,
    avgRenderTime: 0,
    slowRenders: 0,
    lastRenderTime: 0,
  });

  // Mark render start
  useEffect(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  });

  // Mark render end and calculate metrics
  useEffect(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    const isSlowRender = renderTime > 16; // > 16ms (60fps threshold)

    setRenderMetrics((prev) => {
      const newTotalRenders = prev.totalRenders + 1;
      const newAvgRenderTime =
        (prev.avgRenderTime * prev.totalRenders + renderTime) / newTotalRenders;

      return {
        totalRenders: newTotalRenders,
        avgRenderTime: newAvgRenderTime,
        slowRenders: prev.slowRenders + (isSlowRender ? 1 : 0),
        lastRenderTime: renderTime,
      };
    });

    // Log slow renders in development
    if (process.env.NODE_ENV === "development" && isSlowRender) {
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
      );
    }

    renderStartTime.current = 0;
  });

  return {
    ...renderMetrics,
    isSlowRender: renderMetrics.lastRenderTime > 16,
    slowRenderPercentage:
      renderMetrics.totalRenders > 0
        ? (renderMetrics.slowRenders / renderMetrics.totalRenders) * 100
        : 0,
  };
}

// Helper function to determine resource type
function getResourceType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();

  if (!extension) return "other";

  if (["js", "mjs"].includes(extension)) return "script";
  if (["css"].includes(extension)) return "stylesheet";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "ico"].includes(extension))
    return "image";
  if (["woff", "woff2", "ttf", "otf"].includes(extension)) return "font";
  if (["mp4", "webm", "ogg"].includes(extension)) return "video";
  if (["mp3", "wav", "ogg"].includes(extension)) return "audio";
  if (["json", "xml"].includes(extension)) return "xhr";

  return "other";
}
