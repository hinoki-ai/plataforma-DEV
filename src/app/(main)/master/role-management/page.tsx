"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { RoleManagementDashboard } from "@/components/master/RoleManagementDashboard";

export const dynamic = "force-dynamic";

export default function RoleManagementPage() {
  try {
    // Role management will show comprehensive role controls but remain functional
  } catch (error) {
    dbLogger.error(
      "ROLE MANAGEMENT FAILURE - SUPREME ROLE CONTROL COMPROMISED",
      error,
      {
        context: "RoleManagementPage",
        roleManagement: true,
        supremeAuthority: true,
      },
    );
  }

  return (
    <AdvancedErrorBoundary
      context="Role Management Dashboard"
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
                  className="animate-pulse border-purple-200 dark:border-purple-800"
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
        <RoleManagementDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
