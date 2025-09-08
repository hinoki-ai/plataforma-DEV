'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { AdvancedOperationsDashboard } from '@/components/master/AdvancedOperationsDashboard';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function AdvancedOperationsPage() {
  return (
    <AdvancedErrorBoundary
      context="⚠️ ADVANCED OPERATIONS - SUPREME DANGER ZONE"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense
        fallback={
          <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-red-200 dark:border-red-800">
                  <div className="p-6">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <AdvancedOperationsDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}