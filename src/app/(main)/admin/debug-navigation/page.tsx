import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EnhancedDebugPanel } from "@/components/debug/EnhancedDebugPanel";
import { SystemHealthMonitor } from "@/components/debug/SystemHealthMonitor";
import { PerformanceMonitor } from "@/components/debug/PerformanceMonitor";
import { ErrorTracker } from "@/components/debug/ErrorTracker";
import { SessionAnalytics } from "@/components/debug/SessionAnalytics";
import { DebugPanel } from "@/components/admin/dashboard/DebugPanel";
import { requireAuth } from "@/lib/server-auth";
import { hasMasterGodModeAccess } from "@/lib/role-utils";

export const metadata: Metadata = {
  title: "Enhanced Debug Panel - Plataforma Astral",
  description:
    "Advanced debugging and monitoring dashboard for MASTER administrators only.",
  robots: "noindex, nofollow", // Only MASTER should find this
};

export const dynamic = "force-dynamic";

export default async function AdminDebugNavigationPage() {
  const session = await requireAuth();

  // Ensure only MASTER role can access this page
  if (!hasMasterGodModeAccess(session.data?.user.role)) {
    redirect("/unauthorized");
  }
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enhanced Debug Panel</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive system monitoring and debugging tools for
          administrators.
        </p>
      </div>

      {/* System Overview */}
      <div className="mb-8">
        <Suspense
          fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}
        >
          <SystemHealthMonitor />
        </Suspense>
      </div>

      {/* Debug Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Monitoring */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Real-time performance monitoring and optimization insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-64 bg-muted animate-pulse rounded" />}
            >
              <PerformanceMonitor />
            </Suspense>
          </CardContent>
        </Card>

        {/* Error Tracking */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Error Tracking</CardTitle>
            <CardDescription>
              Monitor and analyze system errors and exceptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-64 bg-muted animate-pulse rounded" />}
            >
              <ErrorTracker />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Session Analytics */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Analytics</CardTitle>
            <CardDescription>
              User session tracking and behavior analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-64 bg-muted animate-pulse rounded" />}
            >
              <SessionAnalytics />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Debug Panel */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Debug Console</CardTitle>
            <CardDescription>
              Interactive debugging interface with real-time monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-96 bg-muted animate-pulse rounded" />}
            >
              <EnhancedDebugPanel />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Divine Oracle Debug Panel */}
      <div className="mb-8">
        <Suspense
          fallback={<div className="h-32 bg-muted animate-pulse rounded" />}
        >
          <DebugPanel />
        </Suspense>
      </div>
    </div>
  );
}
