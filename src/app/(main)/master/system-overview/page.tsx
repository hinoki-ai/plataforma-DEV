"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

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

export default function SystemOverviewPage() {
  return (
    <MasterPageTemplate
      title="🔍 System Overview"
      subtitle="Comprehensive system monitoring and performance analytics"
      context="SYSTEM_OVERVIEW"
      errorContext="SystemOverviewPage"
      fallbackContent={systemOverviewFallback}
    >
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* System Health */}
        <Card className="border-green-200 dark:border-green-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Overall Status</span>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span>Database</span>
                <span className="text-green-600 font-medium">99.2%</span>
              </div>
              <div className="flex justify-between">
                <span>API Performance</span>
                <span className="text-green-600 font-medium">97.8%</span>
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
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Active Sessions</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span>Queries/hour</span>
                <span className="font-medium">15.4K</span>
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
                <span className="font-medium">45ms</span>
              </div>
              <div className="flex justify-between">
                <span>Throughput</span>
                <span className="font-medium">1,200 req/s</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="text-green-600 font-medium">99.98%</span>
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
                <span>CPU Usage</span>
                <span>23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-[23%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-[67%]"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </MasterPageTemplate>
  );
}
