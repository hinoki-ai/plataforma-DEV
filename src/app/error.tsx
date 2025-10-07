"use client";

import { useEffect } from "react";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import Header from "@/components/layout/Header";
import { UnifiedErrorBoundary } from "@/components/ui/unified-error-boundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Simple error logging for main error page
  useEffect(() => {
    console.error("🚨 Main Error Page:", {
      message: error?.message || "Unknown error",
      stack: error?.stack?.slice(0, 500) || "No stack trace available",
      digest: error?.digest || "No digest available",
      url: typeof window !== "undefined" ? window.location.href : "SSR",
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <FixedBackgroundLayout
      backgroundImage="/bg2.jpg"
      overlayType="gradient"
      responsivePositioning="default"
      pageTransitionProps={{
        skeletonType: "page",
        duration: 500,
        enableProgressiveAnimation: false,
      }}
    >
      <Header />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-73px)]">
        <div className="max-w-md w-full">
          {/* Unified Error Boundary - Full variant for main error page */}
          <UnifiedErrorBoundary
            context="main_error_page"
            variant="full"
            enableRetry={true}
            enableHome={true}
            showDetails={true}
          >
            {/* Force error to trigger the boundary */}
            <div>Error occurred: {error?.message || "Unknown error"}</div>
          </UnifiedErrorBoundary>
        </div>
      </div>
    </FixedBackgroundLayout>
  );
}
