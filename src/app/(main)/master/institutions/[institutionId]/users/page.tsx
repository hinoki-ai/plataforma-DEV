"use client";

import { InstitutionUsersManagement } from "@/components/master/InstitutionUsersManagement";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function InstitutionUsersPage() {
  return (
    <MasterPageTemplate title="" subtitle="" context="MASTER_INSTITUTION_USERS">
      <InstitutionUsersManagement />
    </MasterPageTemplate>
  );
}
