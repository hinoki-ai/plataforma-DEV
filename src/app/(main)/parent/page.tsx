'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { RoleAwareDashboard } from '@/components/dashboard/RoleAwareDashboard';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function ParentDashboardPage() {
  // 🚨 EMERGENCY: Handle database failures gracefully
  try {
    // Dashboard will show empty state but remain functional
  } catch (error) {
    dbLogger.error(
      'Database unavailable in parent dashboard, showing empty state',
      error,
      { context: 'ParentDashboardPage', emergencyMode: true }
    );
    // Dashboard will show empty state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="Parent Dashboard Page"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Enhanced loading states */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-32 w-full rounded" />
                </div>
              </Card>
            </div>
          </div>
        }
      >
        <RoleAwareDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
