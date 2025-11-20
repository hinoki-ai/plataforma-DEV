"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";
import { MasterStatsCard } from "@/components/master/MasterStatsCard";

// Force dynamic rendering for Vercel compatibility
export const dynamic = "force-dynamic";

const systemStatsFallback = (
  <div className="space-y-8">
    <Card className="animate-pulse border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </Card>
  </div>
);

export default function SystemStatsPage() {
  return (
    <MasterPageTemplate
      context="System Statistics"
      errorContext="SystemStatsPage"
      fallbackContent={systemStatsFallback}
    >
      <MasterStatsCard />
    </MasterPageTemplate>
  );
}
