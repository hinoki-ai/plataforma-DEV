'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { MasterDashboard } from '@/components/master/MasterDashboard';
import { InstitutionMasterCard } from '@/components/master/InstitutionMasterCard';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function MasterDashboardPage() {
  // Master authority: Handle critical failures gracefully
  try {
    // Master dashboard will show enhanced state but remain functional
  } catch (error) {
    dbLogger.error(
      'MASTER DASHBOARD FAILURE - SUPREME CONTROL COMPROMISED',
      error,
      { context: 'MasterPage', masterDashboard: true, supremeAuthority: true }
    );
    // Dashboard will show enhanced error state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="🏛️ Master Dashboard"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense
        fallback={
          <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-blue-200 dark:border-blue-800">
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Loading states for Master */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-blue-200 dark:border-blue-800">
                <div className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800">
                <div className="p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-32 w-full rounded" />
                </div>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800">
                <div className="p-6">
                  <Skeleton className="h-6 w-36 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-2" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Institution Master Control - Supreme Priority */}
          <InstitutionMasterCard currentType="PRESCHOOL" />
          
          {/* Standard Master Dashboard */}
          <MasterDashboard />
        </div>
      </Suspense>
    </AdvancedErrorBoundary>
  );
}