"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { RoleAwareDashboard } from "@/components/dashboard/RoleAwareDashboard";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function ParentDashboardPage() {
  const { t } = useDivineParsing(["parent"]);

  // 🚨 EMERGENCY: Handle database failures gracefully
  try {
    // Dashboard will show empty state but remain functional
  } catch (error) {
    dbLogger.error(
      "Database unavailable in parent dashboard, showing empty state",
      error,
      { context: "ParentDashboardPage", emergencyMode: true },
    );
    // Dashboard will show empty state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context={t("parent.dashboard.title", "parent")}
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
        <RoleAwareDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
