import React from "react";
import { MeetingTabs } from "@/components/meetings/MeetingTabs";
import { PageTransition } from "@/components/ui/page-transition";

export const dynamic = "force-dynamic";

export default function ReunionesPage() {
  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Reuniones de Apoderados
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona y visualiza las reuniones con los apoderados de tus
            estudiantes.
          </p>
        </div>

        <MeetingTabs isAdmin={false} />
      </div>
    </PageTransition>
  );
}
