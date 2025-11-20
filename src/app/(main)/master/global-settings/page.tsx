"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { GlobalSettingsDashboard } from "@/components/master/GlobalSettingsDashboard";

export const dynamic = "force-dynamic";

export default function GlobalSettingsPage() {
  try {
    // Global settings will show advanced configuration options but remain functional
  } catch (error) {
    dbLogger.error(
      "GLOBAL SETTINGS FAILURE - SUPREME GLOBAL CONTROL COMPROMISED",
      error,
      {
        context: "GlobalSettingsPage",
        globalSettings: true,
        supremeAuthority: true,
      },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="Global Settings Dashboard"
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
        <GlobalSettingsDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
