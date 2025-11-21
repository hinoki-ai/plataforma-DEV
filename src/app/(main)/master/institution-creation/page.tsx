"use client";

import { InstitutionCreationForm } from "@/components/master/InstitutionCreationForm";
import { MasterPageTemplate } from "@/components/master/MasterPageTemplate";

export default function InstitutionCreationPage() {
  return (
    <MasterPageTemplate
      title="Institution Creation"
      subtitle="Create and configure new educational institutions"
      context="MASTER_INSTITUTION_CREATION"
    >
      <InstitutionCreationForm />
    </MasterPageTemplate>
  );
}

