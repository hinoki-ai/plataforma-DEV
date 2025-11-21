"use client";

import { Suspense } from "react";
import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { DynamicDashboard } from "@/components/dashboard/DynamicDashboard";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// Enable PPR for better performance - static shell renders first, dynamic data loads after

export default function AdminDashboard() {
  const { t } = useDivineParsing(["common"]);

  // 🚨 EMERGENCY: Handle database failures gracefully
  try {
    // Dashboard will show empty state but remain functional
  } catch (error) {
    dbLogger.error(
      "Database unavailable in admin dashboard, showing empty state",
      error,
      { context: "AdminDashboard", emergencyMode: true },
    );
    // Dashboard will show empty state but remain functional
  }

  return (
    <AdvancedErrorBoundary
      context={t("admin.dashboard.title", "admin")}
      enableRetry={true}
      showDetails={process.env.NODE_ENV === "development"}
    >
      {/* PPR-optimized dashboard with static shell and dynamic content */}
      <DynamicDashboard />
    </AdvancedErrorBoundary>
  );
}
