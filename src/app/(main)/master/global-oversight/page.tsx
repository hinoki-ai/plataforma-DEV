"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { GlobalOversightDashboard } from "@/components/master/GlobalOversightDashboard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function GlobalOversightPage() {
  // System monitoring page
  try {
    // System monitoring will show system status but remain functional
  } catch (error) {
    dbLogger.error("SYSTEM MONITORING FAILURE", error, {
      context: "SystemMonitoringPage",
      systemMonitoring: true,
    });
    // System monitoring will show error state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="System Monitoring Dashboard"
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
        <GlobalOversightDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
