"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { SystemMonitor } from "@/components/master/SystemMonitor";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function SystemMonitorPage() {
  // System monitoring page
  try {
    // System monitor will show real-time data but remain functional
  } catch (error) {
    dbLogger.error("SYSTEM MONITOR FAILURE", error, {
      context: "SystemMonitorPage",
      systemMonitor: true,
    });
    // System monitor will show degraded state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="System Monitor"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === "development"}
    >
      <Suspense
        fallback={
          <div className="space-y-8">
            <Card className="animate-pulse border-blue-200 dark:border-blue-800">
              <div className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-32 w-full rounded" />
              </div>
            </Card>
          </div>
        }
      >
        <SystemMonitor />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
