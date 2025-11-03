import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { getTeamMemberById } from "@/services/queries/team-members";
import type { TeamMember } from "@/lib/prisma-compat-types";

interface EditTeamMemberPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: EditTeamMemberPageProps) {
  const { id } = await params;
  const teamMemberResult = await getTeamMemberById(id);

  if (!teamMemberResult.success || !teamMemberResult.data) {
    notFound();
  }

  const teamMember = {
    ...teamMemberResult.data,
    createdAt:
      teamMemberResult.data.createdAt instanceof Date
        ? teamMemberResult.data.createdAt.toISOString()
        : teamMemberResult.data.createdAt,
    updatedAt:
      teamMemberResult.data.updatedAt instanceof Date
        ? teamMemberResult.data.updatedAt.toISOString()
        : teamMemberResult.data.updatedAt,
  } as unknown as TeamMember;

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
              Editar miembro del equipo
            </h1>
            <p className="text-muted-foreground">
              Actualiza los datos y la visibilidad de este profesional.
            </p>
          </div>
        </div>

        <TeamMemberForm teamMember={teamMember} />
      </div>
    </PageTransition>
  );
}
