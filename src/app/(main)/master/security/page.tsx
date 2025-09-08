'use client';

import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { SecurityCenterDashboard } from '@/components/master/SecurityCenterDashboard';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function SecurityCenterPage() {
  // 🚨 SECURITY CENTER: Supreme security authority
  try {
    // Security center will show advanced security operations but remain functional
  } catch (error) {
    dbLogger.error(
      'SECURITY CENTER FAILURE - SUPREME SECURITY AUTHORITY COMPROMISED',
      error,
      { context: 'SecurityCenterPage', securityCenter: true, supremeAuthority: true }
    );
    // Security center will show security error state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context="🛡️ SECURITY CENTER - SUPREME SECURITY AUTHORITY"
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense
        fallback={
          <div className="space-y-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-red-200 dark:border-red-800">
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
        <SecurityCenterDashboard />
      </Suspense>
    </AdvancedErrorBoundary>
  );
}
