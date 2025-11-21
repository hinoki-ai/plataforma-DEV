"use client";

import { MasterGodModeDashboard } from "@/components/dashboard/MasterGodModeDashboard";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function GodModePage() {
  return (
    <MasterPageTemplate
      title="God Mode"
      subtitle="Supreme administrative control and system override capabilities"
      context="MASTER_GOD_MODE"
    >
      <MasterGodModeDashboard />
    </MasterPageTemplate>
  );
}

