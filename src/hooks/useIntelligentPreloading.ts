"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface PreloadingOptions {
  threshold?: number;
  timeout?: number;
  priority?: "low" | "high" | "auto";
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
  trackAnalytics?: boolean;
}

interface NavigationPattern {
  from: string;
  to: string;
  frequency: number;
  lastAccess: Date;
  avgTime: number;
}

interface PreloadingAnalytics {
  predictions: NavigationPattern[];
  hitRate: number;
  totalPredictions: number;
  correctPredictions: number;
  savedLoadTime: number;
}

/**
 * Intelligent preloading hook that learns user navigation patterns
 */
export function useIntelligentPreloading(options: PreloadingOptions = {}) {
  const {
    threshold = 0.6,
    timeout = 2000,
    priority = "auto",
    prefetchOnHover = true,
    prefetchOnVisible = true,
    trackAnalytics = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState<PreloadingAnalytics>({
    predictions: [],
    hitRate: 0,
    totalPredictions: 0,
    correctPredictions: 0,
    savedLoadTime: 0,
  });
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(
    new Set(),
  );

  const navigationPatternsRef = useRef<NavigationPattern[]>([]);
  const currentPageStartTime = useRef<number>(Date.now());
  const preloadTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load navigation patterns from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("navigation-patterns");
      if (saved) {
        navigationPatternsRef.current = JSON.parse(saved).map(
          (pattern: any) => ({
            ...pattern,
            lastAccess: new Date(pattern.lastAccess),
          }),
        );
      }
    } catch (error) {
      console.error("Failed to load navigation patterns:", error);
    }
  }, []);

  // Save navigation patterns to localStorage
  const savePatterns = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "navigation-patterns",
        JSON.stringify(navigationPatternsRef.current),
      );
    } catch (error) {
      console.error("Failed to save navigation patterns:", error);
    }
  }, []);

  // Track navigation pattern
  const trackNavigation = useCallback(
    (from: string, to: string, timeSpent: number) => {
      if (!trackAnalytics) return;

      const existing = navigationPatternsRef.current.find(
        (p) => p.from === from && p.to === to,
      );

      if (existing) {
        existing.frequency += 1;
        existing.lastAccess = new Date();
        existing.avgTime = (existing.avgTime + timeSpent) / 2;
      } else {
        navigationPatternsRef.current.push({
          from,
          to,
          frequency: 1,
          lastAccess: new Date(),
          avgTime: timeSpent,
        });
      }

      // Keep only the most recent 100 patterns
      navigationPatternsRef.current = navigationPatternsRef.current
        .sort((a, b) => b.lastAccess.getTime() - a.lastAccess.getTime())
        .slice(0, 100);

      savePatterns();
    },
    [trackAnalytics, savePatterns],
  );

  // Predict next routes based on patterns
  const predictNextRoutes = useCallback(
    (currentRoute: string) => {
      const relevantPatterns = navigationPatternsRef.current
        .filter((pattern) => pattern.from === currentRoute)
        .sort((a, b) => {
          // Score based on frequency and recency
          const aScore =
            a.frequency *
            (1 /
              ((Date.now() - a.lastAccess.getTime()) / (1000 * 60 * 60 * 24) +
                1));
          const bScore =
            b.frequency *
            (1 /
              ((Date.now() - b.lastAccess.getTime()) / (1000 * 60 * 60 * 24) +
                1));
          return bScore - aScore;
        });

      const totalFrequency = relevantPatterns.reduce(
        (sum, pattern) => sum + pattern.frequency,
        0,
      );

      return relevantPatterns
        .map((pattern) => ({
          route: pattern.to,
          probability: pattern.frequency / totalFrequency,
          avgTime: pattern.avgTime,
        }))
        .filter((prediction) => prediction.probability >= threshold);
    },
    [threshold],
  );

  // Preload a route
  const preloadRoute = useCallback(
    (
      route: string,
      priorityLevel: "low" | "high" = priority === "auto" ? "low" : priority,
    ) => {
      if (preloadedRoutes.has(route)) return;

      try {
        // Use Next.js router prefetch
        router.prefetch(route);

        setPreloadedRoutes((prev) => new Set(prev).add(route));

        if (trackAnalytics) {
          setAnalytics((prev) => ({
            ...prev,
            totalPredictions: prev.totalPredictions + 1,
          }));
        }

        // Clear preload after timeout to manage memory
        const timeoutId = setTimeout(() => {
          setPreloadedRoutes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(route);
            return newSet;
          });
          preloadTimeoutsRef.current.delete(route);
        }, timeout);

        preloadTimeoutsRef.current.set(route, timeoutId);
      } catch (error) {
        console.error("Failed to preload route:", route, error);
      }
    },
    [router, priority, preloadedRoutes, timeout, trackAnalytics],
  );

  // Preload predicted routes
  const preloadPredictedRoutes = useCallback(() => {
    const predictions = predictNextRoutes(pathname);

    predictions.forEach(({ route, probability }) => {
      if (probability >= threshold) {
        preloadRoute(route, probability > 0.8 ? "high" : "low");
      }
    });

    if (trackAnalytics) {
      setAnalytics((prev) => ({
        ...prev,
        predictions: navigationPatternsRef.current.filter(
          (p) => p.from === pathname,
        ),
      }));
    }
  }, [pathname, predictNextRoutes, threshold, preloadRoute, trackAnalytics]);

  // Set up intersection observer for visible links
  useEffect(() => {
    if (!prefetchOnVisible || typeof window === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute("href");
            if (href && href.startsWith("/")) {
              preloadRoute(href);
            }
          }
        });
      },
      { rootMargin: "100px" },
    );

    // Observe all internal links
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => observerRef.current?.observe(link));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [prefetchOnVisible, preloadRoute]);

  // Track page navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const timeSpent = Date.now() - currentPageStartTime.current;
      const previousRoute = document.referrer
        ? new URL(document.referrer).pathname
        : "";

      if (previousRoute && previousRoute !== pathname) {
        trackNavigation(previousRoute, pathname, timeSpent);

        // Check if prediction was correct
        if (trackAnalytics && preloadedRoutes.has(pathname)) {
          setAnalytics((prev) => ({
            ...prev,
            correctPredictions: prev.correctPredictions + 1,
            hitRate:
              ((prev.correctPredictions + 1) / prev.totalPredictions) * 100,
            savedLoadTime: prev.savedLoadTime + 1000, // Estimate 1s saved load time
          }));
        }
      }

      currentPageStartTime.current = Date.now();
      preloadPredictedRoutes();
    };

    handleRouteChange();
  }, [
    pathname,
    trackNavigation,
    preloadPredictedRoutes,
    trackAnalytics,
    preloadedRoutes,
  ]);

  // Hover preloading handler
  const handleLinkHover = useCallback(
    (href: string) => {
      if (!prefetchOnHover || !href.startsWith("/")) return;

      // Delay preloading to avoid prefetching on accidental hovers
      const timeoutId = setTimeout(() => {
        preloadRoute(href);
      }, 100);

      return () => clearTimeout(timeoutId);
    },
    [prefetchOnHover, preloadRoute],
  );

  // Manual preload trigger
  const triggerPreload = useCallback(
    (route: string) => {
      preloadRoute(route, "high");
    },
    [preloadRoute],
  );

  // Clear all preloaded routes
  const clearPreloadedRoutes = useCallback(() => {
    preloadTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    preloadTimeoutsRef.current.clear();
    setPreloadedRoutes(new Set());
  }, []);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return {
      preloadedRoutes: Array.from(preloadedRoutes),
      navigationPatterns: navigationPatternsRef.current.slice(0, 10), // Top 10 patterns
      analytics,
      performance: {
        patternsLearned: navigationPatternsRef.current.length,
        avgHitRate: analytics.hitRate,
        totalTimeSaved: analytics.savedLoadTime,
        memoryUsage: preloadedRoutes.size,
      },
    };
  }, [preloadedRoutes, analytics]);

  // Cleanup
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      clearPreloadedRoutes();
    };
  }, [clearPreloadedRoutes]);

  return {
    handleLinkHover,
    triggerPreload,
    clearPreloadedRoutes,
    getMetrics,
    isPreloaded: (route: string) => preloadedRoutes.has(route),
    analytics,
  };
}

/**
 * Resource preloading hook for images, fonts, and other assets
 */
export function useResourcePreloading() {
  const [preloadedResources, setPreloadedResources] = useState<Set<string>>(
    new Set(),
  );
  const [loadingResources, setLoadingResources] = useState<Set<string>>(
    new Set(),
  );

  const preloadImage = useCallback(
    (src: string, priority: "high" | "low" = "low") => {
      if (preloadedResources.has(src) || loadingResources.has(src)) return;

      setLoadingResources((prev) => new Set(prev).add(src));

      const img = new Image();

      img.onload = () => {
        setPreloadedResources((prev) => new Set(prev).add(src));
        setLoadingResources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
      };

      img.onerror = () => {
        setLoadingResources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        console.error("Failed to preload image:", src);
      };

      if (priority === "high") {
        img.fetchPriority = "high";
      }

      img.src = src;
    },
    [preloadedResources, loadingResources],
  );

  const preloadFont = useCallback(
    (href: string, type: string = "font/woff2") => {
      if (preloadedResources.has(href)) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.as = "font";
      link.type = type;
      link.crossOrigin = "anonymous";

      link.onload = () => {
        setPreloadedResources((prev) => new Set(prev).add(href));
      };

      document.head.appendChild(link);
    },
    [preloadedResources],
  );

  const preloadScript = useCallback(
    (src: string) => {
      if (preloadedResources.has(src)) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = src;
      link.as = "script";

      link.onload = () => {
        setPreloadedResources((prev) => new Set(prev).add(src));
      };

      document.head.appendChild(link);
    },
    [preloadedResources],
  );

  const preloadCSS = useCallback(
    (href: string) => {
      if (preloadedResources.has(href)) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.as = "style";

      link.onload = () => {
        setPreloadedResources((prev) => new Set(prev).add(href));
      };

      document.head.appendChild(link);
    },
    [preloadedResources],
  );

  return {
    preloadImage,
    preloadFont,
    preloadScript,
    preloadCSS,
    preloadedResources: Array.from(preloadedResources),
    loadingResources: Array.from(loadingResources),
    isPreloaded: (resource: string) => preloadedResources.has(resource),
    isLoading: (resource: string) => loadingResources.has(resource),
  };
}

/**
 * Intelligent caching hook with LRU eviction and compression
 */
export function useIntelligentCache<T = any>(
  options: {
    maxSize?: number;
    maxAge?: number;
    compress?: boolean;
    persistent?: boolean;
    storageKey?: string;
  } = {},
) {
  const {
    maxSize = 50,
    maxAge = 1000 * 60 * 60, // 1 hour
    compress = false,
    persistent = false,
    storageKey = "intelligent-cache",
  } = options;

  const [cache, setCache] = useState<
    Map<
      string,
      {
        data: T;
        timestamp: number;
        accessCount: number;
        lastAccess: number;
      }
    >
  >(new Map());

  // Load persistent cache
  useEffect(() => {
    if (!persistent || typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        let data = saved;
        if (compress) {
          try {
            data = atob(data);
          } catch (e) {
            console.warn("Failed to decompress cache data");
          }
        }

        const parsed = JSON.parse(data);
        const restoredCache = new Map();

        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          if (Date.now() - value.timestamp < maxAge) {
            restoredCache.set(key, value);
          }
        });

        setCache(restoredCache);
      }
    } catch (error) {
      console.error("Failed to load cache:", error);
    }
  }, [persistent, storageKey, compress, maxAge]);

  // Save persistent cache
  const saveCache = useCallback(
    (cacheToSave: typeof cache) => {
      if (!persistent || typeof window === "undefined") return;

      try {
        const cacheObject = Object.fromEntries(cacheToSave);
        let serialized = JSON.stringify(cacheObject);

        if (compress) {
          try {
            serialized = btoa(serialized);
          } catch (e) {
            console.warn("Failed to compress cache data");
          }
        }

        localStorage.setItem(storageKey, serialized);
      } catch (error) {
        console.error("Failed to save cache:", error);
      }
    },
    [persistent, storageKey, compress],
  );

  // LRU eviction
  const evictLRU = useCallback(
    (currentCache: typeof cache) => {
      if (currentCache.size <= maxSize) return currentCache;

      const entries = Array.from(currentCache.entries());
      entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);

      const newCache = new Map();
      entries.slice(0, maxSize).forEach(([key, value]) => {
        newCache.set(key, value);
      });

      return newCache;
    },
    [maxSize],
  );

  const set = useCallback(
    (key: string, data: T) => {
      const now = Date.now();
      const entry = {
        data,
        timestamp: now,
        accessCount: 1,
        lastAccess: now,
      };

      setCache((prevCache) => {
        const newCache = new Map(prevCache);
        newCache.set(key, entry);
        const evictedCache = evictLRU(newCache);
        saveCache(evictedCache);
        return evictedCache;
      });
    },
    [evictLRU, saveCache],
  );

  const get = useCallback(
    (key: string): T | null => {
      const entry = cache.get(key);
      if (!entry) return null;

      // Check if expired
      if (Date.now() - entry.timestamp > maxAge) {
        setCache((prevCache) => {
          const newCache = new Map(prevCache);
          newCache.delete(key);
          saveCache(newCache);
          return newCache;
        });
        return null;
      }

      // Update access stats
      entry.accessCount += 1;
      entry.lastAccess = Date.now();

      setCache((prevCache) => {
        const newCache = new Map(prevCache);
        newCache.set(key, entry);
        saveCache(newCache);
        return newCache;
      });

      return entry.data;
    },
    [cache, maxAge, saveCache],
  );

  const remove = useCallback(
    (key: string) => {
      setCache((prevCache) => {
        const newCache = new Map(prevCache);
        newCache.delete(key);
        saveCache(newCache);
        return newCache;
      });
    },
    [saveCache],
  );

  const clear = useCallback(() => {
    setCache(new Map());
    if (persistent) {
      localStorage.removeItem(storageKey);
    }
  }, [persistent, storageKey]);

  const getStats = useCallback(() => {
    const entries = Array.from(cache.values());
    return {
      size: cache.size,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      avgAccessCount:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) /
            entries.length
          : 0,
      oldestEntry: Math.min(...entries.map((entry) => entry.timestamp)),
      newestEntry: Math.max(...entries.map((entry) => entry.timestamp)),
    };
  }, [cache]);

  return {
    set,
    get,
    remove,
    clear,
    has: (key: string) =>
      cache.has(key) && Date.now() - cache.get(key)!.timestamp < maxAge,
    size: cache.size,
    getStats,
  };
}
