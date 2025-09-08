'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { GlobalOversightDashboard } from '@/components/master/GlobalOversightDashboard';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function GlobalOversightPage() {
  // 🚨 GLOBAL OVERSIGHT: Supreme monitoring authority
  try {
    // Global oversight will show worldwide system status but remain functional
  } catch (error) {
    dbLogger.error(
      'GLOBAL OVERSIGHT FAILURE - WORLDWIDE MONITORING COMPROMISED',
      error,
      { context: 'GlobalOversightPage', globalOversight: true, supremeAuthority: true }
    );
    // Global oversight will show worldwide error state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="🌍 GLOBAL OVERSIGHT - SUPREME MONITORING"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense
        fallback={
          <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-indigo-200 dark:border-indigo-800">
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
        <GlobalOversightDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
