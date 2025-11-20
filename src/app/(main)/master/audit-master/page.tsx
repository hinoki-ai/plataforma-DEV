"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { MasterAuditDashboard } from "@/components/master/MasterAuditDashboard";

export const dynamic = "force-dynamic";

export default function AuditMasterPage() {
  try {
    // Master audit will show supreme audit trail but remain functional
  } catch (error) {
    dbLogger.error(
      "MASTER AUDIT FAILURE - SUPREME AUDIT LOGS COMPROMISED",
      error,
      { context: "AuditMasterPage", masterAudit: true, supremeAuthority: true },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="📋 MASTER AUDIT - SUPREME AUDIT LOGS"
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
        <MasterAuditDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
