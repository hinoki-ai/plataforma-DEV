"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { DatabaseToolsDashboard } from "@/components/master/DatabaseToolsDashboard";

export const dynamic = "force-dynamic";

export default function DatabaseToolsPage() {
  try {
    // Database tools will show advanced database management but remain functional
  } catch (error) {
    dbLogger.error(
      "DATABASE TOOLS FAILURE - SUPREME DATABASE MANAGEMENT COMPROMISED",
      error,
      {
        context: "DatabaseToolsPage",
        databaseTools: true,
        supremeAuthority: true,
      },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="Database Tools Dashboard"
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
        <DatabaseToolsDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
