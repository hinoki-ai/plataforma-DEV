"use client";

import { Suspense, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";

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
    <div className="space-y-8">
      <Card className="animate-pulse border-blue-200 dark:border-blue-800">
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-32 w-full rounded" />
        </div>
      </Card>
    </div>
  );

  const containerClass = showBackground
    ? `min-h-screen ${backgroundClassName}`
    : "";

  return (
    <div className={containerClass}>
      <AdvancedErrorBoundary
        context={context}
        enableRetry={true}
        showDetails={process.env.NODE_ENV === "development"}
      >
        <Suspense fallback={fallbackContent || defaultFallback}>
          <div className={`${maxWidth} space-y-4`}>{children}</div>
        </Suspense>
      </AdvancedErrorBoundary>
    </div>
  );
}
