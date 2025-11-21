"use client";

import { AdvancedErrorBoundary } from "@/components/ui/advanced-error-boundary";
import { dbLogger } from "@/lib/logger";
import { DynamicDashboard } from "@/components/dashboard/DynamicDashboard";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// PPR removed due to TypeScript compatibility issues
// export const experimental_ppr = true;

export default function ProfesorDashboardPage() {
  const { t } = useDivineParsing(["common", "profesor"]);

  return (
    <AdvancedErrorBoundary
      context={t("profesor.dashboard.title", "profesor")}
      enableRetry={true}
      showDetails={process.env.NODE_ENV === "development"}
    >
      {/* PPR-optimized dashboard with static shell and dynamic content */}
      <DynamicDashboard />
    </AdvancedErrorBoundary>
  );
}
