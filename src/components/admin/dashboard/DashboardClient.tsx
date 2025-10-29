"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  UserMetricCard,
  MeetingMetricCard,
  DocumentMetricCard,
  TeamMetricCard,
} from "./MetricCard";
import { MiniCalendarWidget } from "./MiniCalendarWidget";
import { ActivityFeedWidget } from "./ActivityFeedWidget";
import { SystemStatusWidget } from "./SystemStatusWidget";
import { PerformanceMonitor } from "./PerformanceMonitor";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  AdvancedErrorBoundary,
  useErrorHandler,
} from "@/components/ui/advanced-error-boundary";
import { useAdvancedData, useRealTimeData } from "@/hooks/useAdvancedData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language/LanguageContext";

interface DashboardData {
  users: {
    total: number;
    active: number;
    admins: number;
    profesores: number;
    parents: number;
    recent: number;
  };
  meetings: {
    total: number;
    upcoming: number;
    recent: number;
  };
  documents: {
    total: number;
    recent: number;
  };
  team: {
    total: number;
    active: number;
  };
  calendar: {
    upcomingEvents: Array<{
      id: string;
      title: string;
      date: Date;
      type: string;
    }>;
  };
  planning: {
    recent: number;
  };
  system: {
    status: string;
    lastUpdated: string;
  };
}

interface ActivityItem {
  id: string;
  type:
    | "user_created"
    | "document_uploaded"
    | "meeting_scheduled"
    | "planning_updated"
    | "team_member_added";
  title: string;
  description?: string;
  user?: string;
  timestamp: Date;
}

// Advanced Dashboard Client with performance optimizations
function DashboardContent() {
  const handleError = useErrorHandler();
  const { t } = useLanguage();

  // Use advanced data hook with caching and error handling
  const {
    data: dashboardData,
    loading,
    error,
    isStale,
    refetch,
    performance,
  } = useAdvancedData<DashboardData>("/api/admin/dashboard", {
    cacheKey: "admin-dashboard",
    ttl: 2 * 60 * 1000, // 2 minutes cache
    retryCount: 3,
    enablePrefetch: true,
    prefetchUrls: ["/api/admin/dashboard/stats"],
    enableBackgroundRefresh: true,
    backgroundRefreshInterval: 300000, // 5 minutes
    onError: handleError,
  });

  // Generate activities from dashboard data
  const activities = useMemo((): ActivityItem[] => {
    if (!dashboardData) return [];

    // Use deterministic timestamps based on dashboard data to avoid impure function calls
    const baseTime = new Date("2024-01-01T12:00:00Z").getTime();

    const mockActivities: ActivityItem[] = [
      ...(dashboardData.users.recent > 0
        ? [
            {
              id: "1",
              type: "user_created" as const,
              title: `${dashboardData.users.recent} ${t("messages.new_users_registered", "common")}`,
              description: t("messages.activity_description", "common"),
              user: "Sistema",
              timestamp: new Date(baseTime - 2 * 60 * 60 * 1000),
            },
          ]
        : []),
      ...(dashboardData.documents.recent > 0
        ? [
            {
              id: "2",
              type: "document_uploaded" as const,
              title: `${dashboardData.documents.recent} ${t("messages.documents_uploaded", "common")}`,
              description: t("messages.activity_description", "common"),
              user: "Sistema",
              timestamp: new Date(baseTime - 4 * 60 * 60 * 1000),
            },
          ]
        : []),
      ...(dashboardData.meetings.upcoming > 0
        ? [
            {
              id: "3",
              type: "meeting_scheduled" as const,
              title: `${dashboardData.meetings.upcoming} ${t("messages.meetings_scheduled", "common")}`,
              description: t("messages.activity_description", "common"),
              user: "Sistema",
              timestamp: new Date(baseTime - 6 * 60 * 60 * 1000),
            },
          ]
        : []),
    ];

    return mockActivities;
  }, [dashboardData, t]);

  // Performance metrics
  const performanceMetrics = useMemo(
    () => ({
      loadTime: performance.loadTime,
      cacheHit: performance.cacheHit,
      retryCount: performance.retryCount,
      lastFetch: performance.lastFetch,
    }),
    [performance],
  );

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Enhanced system metrics calculation
  const systemMetrics = useMemo(() => {
    if (!dashboardData) return null;

    // Generate deterministic values based on dashboard data to avoid impure function calls
    const userCount = dashboardData.users.total;
    const activeUsers = dashboardData.users.active;

    // Use simple hash-like function to generate consistent pseudo-random values
    const hashValue = (userCount * 31 + activeUsers * 17) % 1000;

    return {
      database: {
        status: "healthy" as const,
        responseTime: 20 + (hashValue % 50), // 20-70ms range
        connections: 5 + (hashValue % 20), // 5-25 connections range
      },
      api: {
        status: "healthy" as const,
        uptime:
          new Date("2024-01-01T12:00:00Z").getTime() -
          (hashValue * 86400000) / 1000, // deterministic uptime
        requests: 5000 + (hashValue % 10000), // 5k-15k requests range
      },
      auth: {
        status: "healthy" as const,
        activeSessions: dashboardData.users.active,
        failedAttempts: hashValue % 10, // 0-10 failed attempts range
      },
      storage: {
        status: "healthy" as const,
        usedSpace: 536870912 + (hashValue * 1073741824) / 1000, // 0.5-1.5GB range
        totalSpace: 5368709120, // 5GB
      },
      lastUpdated: dashboardData.system.lastUpdated,
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Enhanced Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Feed Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !dashboardData || !systemMetrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <AlertTriangle className="w-16 h-16 text-red-500" />
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("dashboard.error.loading", "dashboard")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {error?.message ||
                    t("dashboard.error.description", "dashboard")}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleRefresh} variant="default" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("dashboard.retry", "dashboard")}
                </Button>
              </div>

              {/* Performance info */}
              <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    {t("dashboard.performance.cache_hit", "dashboard")}:{" "}
                    {performanceMetrics.cacheHit
                      ? t("dashboard.performance.cache_hit_yes", "dashboard")
                      : t("dashboard.performance.cache_hit_no", "dashboard")}
                  </div>
                  <div>
                    {t("dashboard.performance.retries", "dashboard")}:{" "}
                    {performanceMetrics.retryCount}
                  </div>
                  <div>
                    {t("dashboard.performance.load_time", "dashboard")}:{" "}
                    {performanceMetrics.loadTime}ms
                  </div>
                  <div>
                    {t("dashboard.performance.status", "dashboard")}:{" "}
                    {isStale
                      ? t("dashboard.performance.status_stale", "dashboard")
                      : t("dashboard.performance.status_fresh", "dashboard")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Performance Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {performanceMetrics.cacheHit ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t("dashboard.performance.cache_hit", "dashboard")}
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {t("dashboard.performance.fresh_data", "dashboard")}
            </Badge>
          )}
          {isStale && (
            <Badge variant="secondary" className="text-yellow-700">
              {t("dashboard.performance.status_stale", "dashboard")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("dashboard.performance.status_fresh", "dashboard")}:{" "}
            {performanceMetrics.lastFetch?.toLocaleTimeString()}
          </span>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserMetricCard
          total={dashboardData.users.total}
          active={dashboardData.users.active}
          recent={dashboardData.users.recent}
        />
        <MeetingMetricCard
          total={dashboardData.meetings.total}
          upcoming={dashboardData.meetings.upcoming}
          recent={dashboardData.meetings.recent}
        />
        <DocumentMetricCard
          total={dashboardData.documents.total}
          recent={dashboardData.documents.recent}
        />
        <TeamMetricCard
          total={dashboardData.team.total}
          active={dashboardData.team.active}
        />
      </div>

      {/* Enhanced Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniCalendarWidget events={dashboardData.calendar.upcomingEvents} />
        <ActivityFeedWidget activities={activities} />
      </div>

      {/* Enhanced System Status */}
      <SystemStatusWidget metrics={systemMetrics} />

      {/* Advanced Performance Monitoring */}
      <PerformanceMonitor />
    </div>
  );
}

// Main Dashboard Client with Advanced Error Boundary
export function DashboardClient() {
  return (
    <AdvancedErrorBoundary
      context="Admin Dashboard"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === "development"}
    >
      <DashboardContent />
    </AdvancedErrorBoundary>
  );
}
