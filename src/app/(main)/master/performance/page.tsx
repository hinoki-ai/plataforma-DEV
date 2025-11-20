"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { PerformanceAnalyzerDashboard } from "@/components/master/PerformanceAnalyzerDashboard";

export const dynamic = "force-dynamic";

export default function PerformancePage() {
  try {
    // Performance analyzer will show advanced performance metrics but remain functional
  } catch (error) {
    dbLogger.error(
      "PERFORMANCE ANALYZER FAILURE - SUPREME PERFORMANCE CONTROL COMPROMISED",
      error,
      {
        context: "PerformanceAnalyzerPage",
        performanceAnalyzer: true,
        supremeAuthority: true,
      },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="Performance Analyzer Dashboard"
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
        <PerformanceAnalyzerDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
