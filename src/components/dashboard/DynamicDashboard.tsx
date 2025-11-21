"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleAwareDashboard } from "./RoleAwareDashboard";

// Static dashboard shell that renders immediately
export function DashboardShell() {
  return (
    <div className="space-y-8">
      {/* Static metrics cards - render immediately */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Metric {i + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Static charts placeholders - render immediately */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Loading chart data...
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dynamic dashboard content that loads after static shell
export function DynamicDashboardContent() {
  return <RoleAwareDashboard />;
}

// Main PPR-optimized dashboard component
export function DynamicDashboard() {
  return (
    <>
      {/* Static shell renders immediately */}
      <DashboardShell />

      {/* Dynamic content loads after - replaces static placeholders */}
      <Suspense fallback={null}>
        <div className="hidden">
          <DynamicDashboardContent />
        </div>
      </Suspense>

      {/* Use CSS to show dynamic content and hide static when ready */}
      <style jsx global>{`
        .dynamic-dashboard-loaded .dashboard-shell {
          display: none;
        }
        .dynamic-dashboard-loaded .dynamic-dashboard-content {
          display: block;
        }
      `}</style>
    </>
  );
}

