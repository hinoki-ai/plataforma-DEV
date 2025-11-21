"use client";

import { PerformanceAnalyzerDashboard } from "@/components/master/PerformanceAnalyzerDashboard";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function PerformancePage() {
  return (
    <MasterPageTemplate
      title="Performance Dashboard"
      subtitle="Monitor system performance and identify bottlenecks"
      context="MASTER_PERFORMANCE"
    >
      <PerformanceAnalyzerDashboard />
    </MasterPageTemplate>
  );
}
