"use client";

import Link from "next/link";
import { createPlanningDocument } from "@/services/actions/planning";
import { PlanningDocumentForm } from "@/components/planning/PlanningDocumentForm";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

export const dynamic = "force-dynamic";

export default function CrearPlanificacionPage() {
  const { t } = useDivineParsing(["common", "profesor"]);

  return (
    <PageTransition
      skeletonType="form"
      skeletonProps={{ fields: 8 }}
      duration={700}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/profesor/planificaciones">
            <Button variant="outline" size="sm">
              {t("profesor.planning.back")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {t("profesor.planning.new")}
          </h1>
        </div>

        <PlanningDocumentForm action={createPlanningDocument} />
      </div>
    </PageTransition>
  );
}
