"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { UserAnalyticsDashboard } from "@/components/master/UserAnalyticsDashboard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function UserAnalyticsPage() {
  try {
    // User analytics will show comprehensive user data but remain functional
  } catch (error) {
    dbLogger.error(
      "USER ANALYTICS FAILURE - SUPREME USER ANALYSIS COMPROMISED",
      error,
      {
        context: "UserAnalyticsPage",
        userAnalytics: true,
        supremeAuthority: true,
      },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="User Analytics Dashboard"
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
        <UserAnalyticsDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
