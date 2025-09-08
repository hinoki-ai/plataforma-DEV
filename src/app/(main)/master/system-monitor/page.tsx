'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { SystemMonitor } from '@/components/master/SystemMonitor';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function SystemMonitorPage() {
  // 🚨 SUPREME AUTHORITY: Critical system monitoring
  try {
    // System monitor will show real-time data but remain functional
  } catch (error) {
    dbLogger.error(
      'SYSTEM MONITOR FAILURE - SUPREME MONITORING CONTROL COMPROMISED',
      error,
      { context: 'SystemMonitorPage', systemMonitor: true, supremeAuthority: true }
    );
    // System monitor will show degraded state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="🏛️ SUPREME System Monitor"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense
        fallback={
          <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-blue-200 dark:border-blue-800">
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
        <SystemMonitor />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
