"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";
import { UnifiedErrorBoundary } from "@/components/ui/unified-error-boundary";
import { useLanguage } from "@/components/language/LanguageContext";

function NotFoundContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.error("🚨 404: Page not found:", {
      pathname,
      searchParams: searchParams?.toString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
      referrer: typeof window !== "undefined" ? document.referrer : undefined,
      timestamp: new Date().toISOString(),
    });
  }, [pathname, searchParams]);

  return (
    <FixedBackgroundLayout
      backgroundImage="/bg7.jpg"
      overlayType="gradient"
      responsivePositioning="default"
    >
      <Header />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-73px)]">
        <div className="max-w-md w-full">
          {/* Unified Error Boundary for 404s */}
          <UnifiedErrorBoundary
            context="404_page"
            variant="full"
            enableRetry={false}
            enableHome={true}
            showDetails={process.env.NODE_ENV === "development"}
          >
            {/* Force error to trigger the boundary */}
            <div>404: Page not found - {pathname}</div>
          </UnifiedErrorBoundary>
        </div>
      </div>
    </FixedBackgroundLayout>
  );
}

function LoadingFallback() {
  const { t } = useLanguage();
  return <div>{t("common.loading", "common")}</div>;
}

export default function NotFound() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}
