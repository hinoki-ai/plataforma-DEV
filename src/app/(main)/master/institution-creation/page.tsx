"use client";

import { Suspense } from "react";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InstitutionCreationForm } from "@/components/master/InstitutionCreationForm";

export const dynamic = "force-dynamic";

function InstitutionCreationFallback() {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 dark:border-blue-800">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-72" />
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    </div>
  );
}

export default function MasterInstitutionCreationPage() {
  return (
    <AdvancedErrorBoundary
      context="MASTER Institution Creation"
      enableRetry
      showDetails={process.env.NODE_ENV === "development"}
    >
      <Suspense fallback={<InstitutionCreationFallback />}>
        <InstitutionCreationForm />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
