import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EnhancedDebugPanel } from "@/components/debug/EnhancedDebugPanel";
import { SystemHealthMonitor } from "@/components/debug/SystemHealthMonitor";
import { DebugPerformanceMonitor } from "@/components/debug/DebugPerformanceMonitor";
import { ErrorTracker } from "@/components/debug/ErrorTracker";
import { SessionAnalytics } from "@/components/debug/SessionAnalytics";
import { DebugPanel } from "@/components/admin/dashboard/DebugPanel";
import { requireAuth } from "@/lib/server-auth";
import { hasMasterGodModeAccess } from "@/lib/role-utils";

export const metadata: Metadata = {
  title: "Enhanced Debug Panel - Plataforma Astral",
  description:
    "Advanced debugging and monitoring dashboard for MASTER administrators only.",
  robots: "noindex, nofollow", // Only MASTER should find this
};

export const dynamic = "force-dynamic";

export default async function AdminDebugNavigationPage() {
  const session = await requireAuth();

  // Ensure only MASTER role can access this page
  if (!hasMasterGodModeAccess(session.user.role)) {
    redirect("/unauthorized");
  }
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Enhanced Debug Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Advanced debugging and monitoring dashboard for MASTER administrators
        </p>
      </div>

      {/* Debug Components */}
      <div className="space-y-6">
        <Suspense fallback={<div>Loading debug panel...</div>}>
          <EnhancedDebugPanel />
        </Suspense>

        <Suspense fallback={<div>Loading system health...</div>}>
          <SystemHealthMonitor />
        </Suspense>

        <Suspense fallback={<div>Loading performance monitor...</div>}>
          <DebugPerformanceMonitor />
        </Suspense>

        <Suspense fallback={<div>Loading error tracker...</div>}>
          <ErrorTracker />
        </Suspense>

        <Suspense fallback={<div>Loading session analytics...</div>}>
          <SessionAnalytics />
        </Suspense>

        <Suspense fallback={<div>Loading debug panel...</div>}>
          <DebugPanel />
        </Suspense>
      </div>
    </div>
  );
}
