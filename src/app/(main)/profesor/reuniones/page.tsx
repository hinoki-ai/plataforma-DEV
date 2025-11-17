"use client";

import React from "react";
import { MeetingTabs } from "@/components/meetings/MeetingTabs";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";

export const dynamic = "force-dynamic";

export default function ReunionesPage() {
  const { t } = useDivineParsing(["profesor"]);

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("profesor.reuniones.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("profesor.reuniones.description")}
          </p>
        </div>

        <MeetingTabs isAdmin={false} />
      </div>
    </PageTransition>
  );
}
