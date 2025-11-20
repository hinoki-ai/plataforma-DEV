"use client";

import { InstitutionManagement } from "@/components/master/InstitutionManagement";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function MasterInstitutionsPage() {
  return (
    <MasterPageTemplate
      title="Institutions"
      subtitle="Centralized management of all educational tenants"
      context="MASTER_INSTITUTION_LIST"
    >
      <InstitutionManagement />
    </MasterPageTemplate>
  );
}
