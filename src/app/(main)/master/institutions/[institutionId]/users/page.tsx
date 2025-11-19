"use client";

import { InstitutionUsersManagement } from "@/components/master/InstitutionUsersManagement";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function InstitutionUsersPage() {
  return (
    <MasterPageTemplate
      title="Usuarios de Institución"
      subtitle="Gestión detallada de usuarios por tenant"
      context="MASTER_INSTITUTION_USERS"
    >
      <InstitutionUsersManagement />
    </MasterPageTemplate>
  );
}
