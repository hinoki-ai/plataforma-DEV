import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/prisma-compat-types';

interface DashboardStats {
  users?: {
    total: number;
    active: number;
    admins?: number;
    profesores?: number;
    parents?: number;
    recent?: number;
    newToday?: number;
    byRole?: Record<string, number>;
    recentUsers?: any[];
  };
  meetings?: {
    total: number;
    upcoming: number;
    recent?: number;
    scheduled?: number;
  };
  documents?: {
    total: number;
    recent: number;
  };
  team?: {
    total: number;
    active: number;
  };
  calendar?: {
    upcomingEvents: any[];
  };
  planning?: {
    recent: number;
  };
  plannings?: {
    total: number;
    completed: number;
  };
  students?: {
    total: number;
    active: number;
  };
  resources?: {
    total: number;
    shared: number;
  };
  children?: {
    total: number;
    enrolled: number;
  };
  communications?: {
    total: number;
    unread: number;
  };
  votings?: {
    total: number;
    active: number;
  };
  system?: {
    health?: number;
    uptime?: string;
    status?: string;
  };
  security?: {
    threats: number;
    blocked: number;
    alerts?: number;
  };
  performance?: {
    responseTime: number;
    throughput: number;
  };
  database?: {
    connections: number;
    queriesPerSec?: number;
    size: string;
  };
  api?: {
    requests: number;
    errors: number;
  };
  activities?: {
    events?: { total: number; upcoming: number };
    meetings?: { total: number; scheduled: number };
    logs?: { total: number; recent: number; critical: number };
  };
}

// Cache for dashboard data with TTL
interface CacheEntry {
  data: DashboardStats;
  timestamp: number;
  ttl: number;
}

const dashboardCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useOptimizedDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Memoized cache key
  const cacheKey = useMemo(() => {
    if (!session?.user?.id || !session?.user?.role) return null;
    return `${session.user.id}-${session.user.role}`;
  }, [session?.user?.id, session?.user?.role]);

  // Check if cached data is still valid
  const getCachedData = useCallback((key: string): DashboardStats | null => {
    const cached = dashboardCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, []);

  // Cache data
  const setCachedData = useCallback((key: string, data: DashboardStats) => {
    dashboardCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    });
  }, []);

  // Optimized fetch with caching and background refresh
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.role || !cacheKey) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setStats(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      let endpoint = '';

      switch (session.user.role) {
        case 'MASTER':
          endpoint = '/api/master/dashboard';
          break;
        case 'ADMIN':
          endpoint = '/api/admin/dashboard';
          break;
        case 'PROFESOR':
          endpoint = '/api/profesor/dashboard';
          break;
        case 'PARENT':
          endpoint = '/api/parent/dashboard/overview';
          break;
        default:
          setStats({});
          setLoading(false);
          return;
      }

      // Add cache-busting parameter for force refresh
      const url = forceRefresh
        ? `${endpoint}?t=${Date.now()}`
        : endpoint;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Use cache for non-force-refresh requests
        cache: forceRefresh ? 'no-cache' : 'default',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the data
      setCachedData(cacheKey, data);
      setStats(data);
      setLastFetchTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');

      // Try to use cached data as fallback
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setStats(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.role, cacheKey, getCachedData, setCachedData]);

  // Background refresh for stale data
  useEffect(() => {
    if (!cacheKey) return;

    const checkStaleData = () => {
      const cached = dashboardCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp > CACHE_TTL * 0.8) {
        // Data is getting stale, refresh in background
        fetchDashboardData(true);
      }
    };

    const interval = setInterval(checkStaleData, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [cacheKey, fetchDashboardData]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchDashboardData();

    // Set up periodic refresh (every 10 minutes)
    const interval = setInterval(() => {
      if (Date.now() - lastFetchTime > 10 * 60 * 1000) {
        fetchDashboardData(true);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, lastFetchTime]);

  // Force refresh function for manual updates
  const refreshData = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Computed values for performance
  const computedStats = useMemo(() => {
    return {
      ...stats,
      // Add computed fields if needed
      isStale: cacheKey ? Date.now() - (dashboardCache.get(cacheKey)?.timestamp || 0) > CACHE_TTL : false,
      lastUpdated: lastFetchTime,
    };
  }, [stats, cacheKey, lastFetchTime]);

  return {
    stats: computedStats,
    loading,
    error,
    refreshData,
    isStale: computedStats.isStale,
    lastUpdated: computedStats.lastUpdated,
  };
}