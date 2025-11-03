import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { TeamMemberForm } from "@/components/admin/team-member-form";

export const dynamic = "force-dynamic";

export default function NewTeamMemberPage() {
  return (
    <PageTransition
      skeletonType="form"
      skeletonProps={{ fields: 8 }}
      duration={700}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/equipo-multidisciplinario">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver al equipo
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Nuevo miembro del equipo
            </h1>
            <p className="text-muted-foreground">
              Completa la información para mostrar al profesional en la
              plataforma.
            </p>
          </div>
        </div>

        <TeamMemberForm />
      </div>
    </PageTransition>
  );
}
