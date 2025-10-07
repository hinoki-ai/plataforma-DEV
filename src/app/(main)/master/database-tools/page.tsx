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
      context="🗄️ DATABASE TOOLS - SUPREME DATABASE MANAGEMENT"
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
        <DatabaseToolsDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
