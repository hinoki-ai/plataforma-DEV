/**
 * SYSTEM OVERVIEW PAGE - ENGLISH ONLY
 *
 * CRITICAL RULE: This component MUST remain English-only and hardcoded.
 * No translations, i18n hooks, or internationalization allowed.
 *
 * This is a strict requirement that cannot be broken for:
 * - Master dashboard consistency
 * - Technical admin interface standards
 * - Performance optimization
 * - Avoiding translation overhead for system administrators
 *
 * If you need to add text, hardcode it in English only.
 * DO NOT add useDivineParsing, useLanguage, or any translation hooks.
 */

"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { useDashboardData } from "@/hooks/useDashboardData";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

const systemOverviewFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </Card>
  </div>
);

function SystemOverviewContent() {
  const { stats, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-blue-200 dark:border-blue-800">
            <div className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const formatUptime = (uptime?: number | string) => {
    if (typeof uptime === "number") {
      const hours = Math.floor(uptime / 3600);
      return `${hours}h`;
    }
    return "N/A";
  };

  const calculateMemoryUsage = (memory: any) => {
    if (!memory) return 0;
    const used = memory.used || 0;
    const total = memory.total || 1;
    return Math.round((used / total) * 100);
  };

  return (
    <>
      {/* System Overview */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* System Health */}
        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Overall Status</span>
                <span className="text-green-600 font-medium">
                  {stats.system?.status || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Database</span>
                <span className="text-green-600 font-medium">
                  {stats.database?.status === "connected"
                    ? "Connected"
                    : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Performance Score</span>
                <span className="text-green-600 font-medium">
                  {stats.performance?.healthScore || 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Statistics */}
        <Card className="border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Users</span>
                <span className="font-medium">
                  {stats.users?.total?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Connections</span>
                <span className="font-medium">
                  {stats.performance?.activeConnections || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Content Items</span>
                <span className="font-medium">
                  {stats.content?.total?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-purple-200 dark:border-purple-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Response Time</span>
                <span className="font-medium">
                  {stats.performance?.avgResponseTime || 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Throughput</span>
                <span className="font-medium">
                  {((stats.performance?.throughput || 0) / 1000).toFixed(1)}K
                  req/s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="text-green-600 font-medium">
                  {formatUptime(stats.system?.uptime)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Monitoring */}
      <Card className="border-orange-200 dark:border-orange-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Real-time Monitoring</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{calculateMemoryUsage(stats.system?.memory)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateMemoryUsage(stats.system?.memory)}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Connections</span>
                <span>{stats.performance?.activeConnections || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((stats.performance?.activeConnections || 0) * 2, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

export default function SystemOverviewPage() {
  return (
    <MasterPageTemplate
      title=""
      subtitle=""
      context="SYSTEM_OVERVIEW"
      errorContext="SystemOverviewPage"
      fallbackContent={systemOverviewFallback}
    >
      <SystemOverviewContent />
    </MasterPageTemplate>
  );
}
