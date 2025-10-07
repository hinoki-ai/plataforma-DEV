"use client";

import { Suspense, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { RoleAwareHeader } from "@/components/layout/RoleAwareNavigation";

interface MasterPageTemplateProps {
  title: string;
  subtitle: string;
  context: string;
  children: ReactNode;
  fallbackContent?: ReactNode;
  maxWidth?: string;
  errorContext?: string;
  showBackground?: boolean;
  backgroundClassName?: string;
}

export function MasterPageTemplate({
  title,
  subtitle,
  context,
  children,
  fallbackContent,
  maxWidth = "max-w-7xl",
  errorContext,
  showBackground = true,
  backgroundClassName = "",
}: MasterPageTemplateProps) {
  // Master authority: Handle critical failures gracefully
  try {
    // Master pages will show enhanced functionality but remain functional
  } catch (error) {
    dbLogger.error(
      `${context.toUpperCase()} FAILURE - SUPREME CONTROL COMPROMISED`,
      error,
      {
        context: errorContext || context,
        masterPage: true,
        supremeAuthority: true,
      },
    );
    // Page will show enhanced error state but remain functional
  }

  const defaultFallback = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card
          key={i}
          className="animate-pulse border-slate-200 dark:border-slate-800"
        >
          <div className="p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );

  const containerClass = showBackground
    ? `min-h-screen ${backgroundClassName}`
    : "";

  return (
    <div className={containerClass}>
      <div className="container mx-auto px-6 py-8 space-y-8">
        <RoleAwareHeader title={title} subtitle={subtitle} />

        <AdvancedErrorBoundary
          context={context}
          enableRetry={true}
          showDetails={process.env.NODE_ENV === "development"}
        >
          <Suspense fallback={fallbackContent || defaultFallback}>
            <div className={`${maxWidth} mx-auto space-y-8`}>{children}</div>
          </Suspense>
        </AdvancedErrorBoundary>
      </div>
    </div>
  );
}
