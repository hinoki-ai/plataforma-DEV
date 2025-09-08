/**
 * 🏛️ MASTER Almighty God Mode Dashboard Page
 * Supreme Authority - Complete System Control
 * Only MASTER users can access this page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedErrorBoundary } from '@/components/ui/advanced-error-boundary';
import { dbLogger } from '@/lib/logger';
import { GodModeDashboard } from '@/components/master/GodModeDashboard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Crown } from 'lucide-react';

// Force dynamic rendering for real-time updates
export const dynamic = 'force-dynamic';

// Supreme SEO metadata
export const metadata: Metadata = {
  title: '🏛️ MASTER God Mode - Supreme Authority Control',
  description: 'Ultimate system authority and global oversight dashboard - MASTER access only',
  keywords: ['master', 'god mode', 'supreme authority', 'system control', 'global oversight'],
  robots: 'noindex, nofollow', // Only MASTER should find this
  openGraph: {
    title: '🏛️ MASTER God Mode - Supreme Control',
    description: 'Complete system authority and oversight',
    type: 'website',
  },
};

// Supreme loading component
function SupremeLoadingSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {/* Supreme Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>

      {/* God Mode Status Skeleton */}
      <Card className="animate-pulse border-yellow-200 dark:border-yellow-800">
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </Card>

      {/* Supreme Actions Skeleton */}
      <Card className="animate-pulse border-red-200 dark:border-red-800">
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-56 mb-6" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Card>

      {/* System Overview Skeleton */}
      <Card className="animate-pulse">
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Supreme error boundary fallback
const SupremeErrorFallback: React.ComponentType<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full border-red-200 bg-red-50 dark:bg-red-950/20">
        <div className="p-6 text-center space-y-4">
          <Crown className="h-16 w-16 mx-auto text-red-600" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
            🚨 GOD MODE COMPROMISED
          </h2>
          <p className="text-red-700 dark:text-red-300">
            Supreme authority system encountered a critical error.
            This should never happen under normal circumstances.
          </p>
          <div className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/20 p-2 rounded">
            {error.message}
          </div>
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            🔄 RESTORE SUPREME AUTHORITY
          </button>
        </div>
      </Card>
    </div>
  );
};

export default function GodModePage() {
  return (
    <RoleGuard
      roles={['MASTER']}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="p-8 text-center border-red-200 bg-red-50 dark:bg-red-950/20">
            <Crown className="h-16 w-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
              🚫 ACCESS DENIED
            </h2>
            <p className="text-red-700 dark:text-red-300">
              Only MASTER has Almighty Authority to access God Mode.
            </p>
          </Card>
        </div>
      }
    >
      <AdvancedErrorBoundary
        context="🏛️ GOD MODE - SUPREME AUTHORITY"
        enableRetry={true}
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <Suspense fallback={<SupremeLoadingSkeleton />}>
          <GodModeDashboard />
        </Suspense>
      </AdvancedErrorBoundary>
    </RoleGuard>
  );
}