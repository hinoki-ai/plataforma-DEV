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
      context="🔧 DEBUG CONSOLE - SUPREME DEBUG CONTROL"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === "development"}
    >
      <Suspense
        fallback={
          <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse border-green-200 dark:border-green-800"
                >
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <DebugConsoleDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
