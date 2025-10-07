import { getTeamMemberById } from "@/services/queries/team-members";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { PageTransition } from "@/components/ui/page-transition";

interface EditTeamMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: EditTeamMemberPageProps) {
  const { id } = await params;
  const teamMember = await getTeamMemberById(id);

  if (!teamMember.success || !teamMember.data) {
    return <div>Miembro del equipo no encontrado</div>;
  }

  const member = teamMember.data;

  return (
    <PageTransition
      skeletonType="form"
      skeletonProps={{ fields: 6 }}
      duration={700}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Editar Miembro del Equipo
          </h1>
          <p className="text-muted-foreground">
            Modifica la información de {member.name}
          </p>
        </div>

        <TeamMemberForm teamMember={member} />
      </div>
    </PageTransition>
  );
}
