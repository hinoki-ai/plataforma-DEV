import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface UseAdvancedDataOptions<T> {
  cacheKey?: string;
  ttl?: number; // Time to live in milliseconds
  enablePrefetch?: boolean;
  prefetchUrls?: string[];
  retryCount?: number;
  retryDelay?: number;
  enableBackgroundRefresh?: boolean;
  backgroundRefreshInterval?: number;
  transformData?: (data: any) => T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enableOptimisticUpdates?: boolean;
}

interface UseAdvancedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  refetch: () => Promise<void>;
  prefetch: (url: string) => Promise<void>;
  updateCache: (data: T) => void;
  invalidateCache: () => void;
  optimisticUpdate: (updater: (prev: T | null) => T) => void;
  retry: () => Promise<void>;
  performance: {
    loadTime: number;
    cacheHit: boolean;
    retryCount: number;
    lastFetch: Date | null;
  };
}

const CACHE_VERSION = '1.0.0';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private prefetchCache = new Map<string, Promise<any>>();

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is stale
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check version compatibility
    if (entry.version !== CACHE_VERSION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return Boolean(
      entry &&
        Date.now() - entry.timestamp <= entry.ttl &&
        entry.version === CACHE_VERSION
    );
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  getStaleTime(key: string): number | null {
    const entry = this.cache.get(key);
    return entry ? Date.now() - entry.timestamp : null;
  }

  async prefetch(url: string, options?: RequestInit): Promise<any> {
    if (this.prefetchCache.has(url)) {
      return this.prefetchCache.get(url);
    }

    const promise = fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'no-cache',
        ...options?.headers,
      },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });

    this.prefetchCache.set(url, promise);

    try {
      const result = await promise;
      this.prefetchCache.delete(url);
      return result;
    } catch (error) {
      this.prefetchCache.delete(url);
      throw error;
    }
  }

  clearPrefetchCache(): void {
    this.prefetchCache.clear();
  }

  getStats(): { size: number; prefetchSize: number } {
    return {
      size: this.cache.size,
      prefetchSize: this.prefetchCache.size,
    };
  }
}

const globalCache = new AdvancedCache();

export function useAdvancedData<T = any>(
  url: string,
  options: UseAdvancedDataOptions<T> = {}
): UseAdvancedDataResult<T> {
  const {
    cacheKey = url,
    ttl = DEFAULT_TTL,
    enablePrefetch = false,
    prefetchUrls = [],
    retryCount: maxRetries = DEFAULT_RETRY_COUNT,
    retryDelay: baseRetryDelay = DEFAULT_RETRY_DELAY,
    enableBackgroundRefresh = false,
    backgroundRefreshInterval = 300000, // 5 minutes
    transformData,
    onSuccess,
    onError,
    enableOptimisticUpdates = false,
  } = options;

  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const backgroundRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeRef = useRef<number>(0);
  const cacheHitRef = useRef<boolean>(false);

  // Calculate exponential backoff delay
  const getRetryDelay = useCallback(
    (attempt: number): number => {
      return Math.min(baseRetryDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
    },
    [baseRetryDelay]
  );

  // Check if data is stale
  const checkStale = useCallback(() => {
    const staleTime = globalCache.getStaleTime(cacheKey);
    if (staleTime && staleTime > ttl * 0.8) {
      // Consider stale after 80% of TTL
      setIsStale(true);
    } else {
      setIsStale(false);
    }
  }, [cacheKey, ttl]);

  // Main fetch function with advanced error handling
  const fetchData = useCallback(
    async (isRetry = false): Promise<void> => {
      const startTime = Date.now();
      cacheHitRef.current = false;

      try {
        // Cancel previous request
        if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        // Check cache first
        const cachedData = globalCache.get<T>(cacheKey);
        if (cachedData && !isRetry) {
          setData(cachedData);
          setLoading(false);
          setError(null);
          cacheHitRef.current = true;
          loadTimeRef.current = Date.now() - startTime;
          setLastFetch(new Date());
          checkStale();
          onSuccess?.(cachedData);
          return;
        }

        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let rawData = await response.json();

        // Transform data if needed
        if (transformData) {
          rawData = transformData(rawData);
        }

        // Cache the result
        globalCache.set(cacheKey, rawData, ttl);

        setData(rawData);
        setLoading(false);
        setError(null);
        setRetryCount(0);
        setLastFetch(new Date());
        loadTimeRef.current = Date.now() - startTime;
        checkStale();

        onSuccess?.(rawData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');

        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.message.includes('HTTP 4')) {
          setError(error);
          setLoading(false);
          onError?.(error);
          return;
        }

        // Retry logic
        if (!isRetry && retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          const delay = getRetryDelay(retryCount);

          setTimeout(() => {
            fetchData(true);
          }, delay);
          return;
        }

        setError(error);
        setLoading(false);
        onError?.(error);
      }
    },
    [
      url,
      cacheKey,
      ttl,
      retryCount,
      maxRetries,
      getRetryDelay,
      transformData,
      onSuccess,
      onError,
      checkStale,
    ]
  );

  // Prefetch function
  const prefetch = useCallback(async (prefetchUrl: string): Promise<void> => {
    try {
      await globalCache.prefetch(prefetchUrl);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, []);

  // Manual refetch
  const refetch = useCallback(async (): Promise<void> => {
    globalCache.invalidate(cacheKey);
    await fetchData();
  }, [cacheKey, fetchData]);

  // Update cache manually
  const updateCache = useCallback(
    (newData: T): void => {
      globalCache.set(cacheKey, newData, ttl);
      setData(newData);
    },
    [cacheKey, ttl]
  );

  // Invalidate cache
  const invalidateCache = useCallback((): void => {
    globalCache.invalidate(cacheKey);
    setData(null);
    setIsStale(false);
  }, [cacheKey]);

  // Optimistic update
  const optimisticUpdate = useCallback(
    (updater: (prev: T | null) => T): void => {
      if (!enableOptimisticUpdates) return;

      setData(prev => {
        const newData = updater(prev);
        globalCache.set(cacheKey, newData, ttl);
        return newData;
      });
    },
    [cacheKey, ttl, enableOptimisticUpdates]
  );

  // Retry function
  const retry = useCallback(async (): Promise<void> => {
    setRetryCount(0);
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prefetch related data
  useEffect(() => {
    if (enablePrefetch && prefetchUrls.length > 0) {
      prefetchUrls.forEach(prefetchUrl => {
        prefetch(prefetchUrl);
      });
    }
  }, [enablePrefetch, prefetchUrls, prefetch]);

  // Background refresh
  useEffect(() => {
    if (enableBackgroundRefresh && data) {
      backgroundRefreshRef.current = setInterval(() => {
        fetchData();
      }, backgroundRefreshInterval);

      return () => {
        if (backgroundRefreshRef.current) {
          clearInterval(backgroundRefreshRef.current);
        }
      };
    }
  }, [enableBackgroundRefresh, backgroundRefreshInterval, data, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
      if (backgroundRefreshRef.current) {
        clearInterval(backgroundRefreshRef.current);
      }
    };
  }, []);

  // Performance metrics
  const performance = useMemo(
    () => ({
      loadTime: loadTimeRef.current,
      cacheHit: cacheHitRef.current,
      retryCount,
      lastFetch,
    }),
    [retryCount, lastFetch]
  );

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    prefetch,
    updateCache,
    invalidateCache,
    optimisticUpdate,
    retry,
    performance,
  };
}

// Hook for real-time data with WebSocket support
export function useRealTimeData<T>(
  url: string,
  options: UseAdvancedDataOptions<T> & {
    enableWebSocket?: boolean;
    webSocketUrl?: string;
    reconnectInterval?: number;
  } = {}
) {
  const {
    enableWebSocket = false,
    webSocketUrl,
    reconnectInterval = 5000,
    ...dataOptions
  } = options;

  const baseResult = useAdvancedData<T>(url, dataOptions);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || !webSocketUrl) return;

    try {
      wsRef.current = new WebSocket(webSocketUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected for real-time data');
      };

      wsRef.current.onmessage = event => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'data_update' && update.payload) {
            baseResult.updateCache(update.payload);
            setLastUpdate(new Date());
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected, attempting to reconnect...');

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, reconnectInterval);
      };

      wsRef.current.onerror = error => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [enableWebSocket, webSocketUrl, reconnectInterval, baseResult]);

  useEffect(() => {
    if (enableWebSocket) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket, enableWebSocket]);

  return {
    ...baseResult,
    isConnected,
    lastUpdate,
    webSocketStatus: isConnected ? 'connected' : 'disconnected',
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    cacheStats: { hits: 0, misses: 0 },
    apiCalls: 0,
    errors: 0,
    averageResponseTime: 0,
  });

  const updateMetric = useCallback((key: string, value: any) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return { metrics, updateMetric };
}
