"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { RoleBasedExamples } from "@/components/examples/RoleBasedExamples";
import { RoleGuard } from "@/components/auth/RoleGuard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

export default function RoleExamplesPage() {
  return (
    <RoleGuard roles={["MASTER"]} showUnauthorized={false}>
      <AdvancedErrorBoundary
        context="Role Examples Page"
        enableRetry={true}
        showDetails={process.env.NODE_ENV === "development"}
      >
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="p-6">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <Skeleton key={j} className="h-8 w-full" />
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          }
        >
          <RoleBasedExamples />
        </Suspense>
      </AdvancedErrorBoundary>
    </RoleGuard>
  );
}
