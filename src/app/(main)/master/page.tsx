"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { MasterDashboard } from "@/components/master/MasterDashboard";
import { InstitutionMasterCard } from "@/components/master/InstitutionMasterCard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function MasterDashboardPage() {
  // Handle critical failures gracefully
  try {
    // Dashboard will show enhanced state but remain functional
  } catch (error) {
    dbLogger.error("Master dashboard critical error", error, {
      context: "MasterPage",
      masterDashboard: true,
    });
    // Dashboard will show error state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="Master Dashboard"
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
        <div className="space-y-4">
          {/* Institution Control */}
          <InstitutionMasterCard currentType="PRESCHOOL" />

          {/* Administrator Dashboard */}
          <MasterDashboard />
        </div>
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
