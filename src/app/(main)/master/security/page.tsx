"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { SecurityCenterDashboard } from "@/components/master/SecurityCenterDashboard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function SecurityCenterPage() {
  // 🚨 SECURITY CENTER: Supreme security authority
  try {
    // Security center will show advanced security operations but remain functional
  } catch (error) {
    dbLogger.error(
      "SECURITY CENTER FAILURE - SUPREME SECURITY AUTHORITY COMPROMISED",
      error,
      {
        context: "SecurityCenterPage",
        securityCenter: true,
        supremeAuthority: true,
      },
    );
    // Security center will show security error state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="🛡️ SECURITY CENTER - SUPREME SECURITY AUTHORITY"
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
        <SecurityCenterDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
