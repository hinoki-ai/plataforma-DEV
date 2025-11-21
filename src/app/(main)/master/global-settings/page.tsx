"use client";

import { GlobalSettingsDashboard } from "@/components/master/GlobalSettingsDashboard";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function GlobalSettingsPage() {
  return (
    <MasterPageTemplate
      title="Global Settings"
      subtitle="Configure system-wide settings and preferences"
      context="MASTER_GLOBAL_SETTINGS"
    >
      <GlobalSettingsDashboard />
    </MasterPageTemplate>
  );
}
