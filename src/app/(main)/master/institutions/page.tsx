"use client";

import { InstitutionManagement } from "@/components/master/InstitutionManagement";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function MasterInstitutionsPage() {
  return (
    <MasterPageTemplate
      title="Instituciones"
      subtitle="Gestión centralizada de todos los tenants educativos"
      context="MASTER_INSTITUTION_LIST"
    >
      <InstitutionManagement />
    </MasterPageTemplate>
  );
}
