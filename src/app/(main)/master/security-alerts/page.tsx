"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { SecurityAlertsCard } from "@/components/master/SecurityAlertsCard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

const securityAlertsFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <Skeleton className="h-6 w-36 mb-4" />
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
  </div>
);

export default function SecurityAlertsPage() {
  return (
    <MasterPageTemplate
      title="🛡️ Security Alerts"
      subtitle="Real-time security monitoring and threat detection"
      context="🛡️ Security Alerts"
      errorContext="SecurityAlertsPage"
      fallbackContent={securityAlertsFallback}
    >
      <SecurityAlertsCard />
    </MasterPageTemplate>
  );
}
