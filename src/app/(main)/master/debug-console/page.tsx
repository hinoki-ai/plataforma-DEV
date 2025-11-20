"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { DebugConsoleDashboard } from "@/components/master/DebugConsoleDashboard";

export const dynamic = "force-dynamic";

export default function DebugConsolePage() {
  try {
    // Debug console will show advanced debugging tools but remain functional
  } catch (error) {
    dbLogger.error(
      "DEBUG CONSOLE FAILURE - SUPREME DEBUG CONTROL COMPROMISED",
      error,
      {
        context: "DebugConsolePage",
        debugConsole: true,
        supremeAuthority: true,
      },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="Debug Console Dashboard"
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
        <DebugConsoleDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
