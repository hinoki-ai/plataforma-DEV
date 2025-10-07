import { getTeamMembers } from "@/services/queries/team-members";
import { TeamMemberList } from "@/components/admin/team-member-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";

export const dynamic = "force-dynamic";

export default async function EquipoMultidisciplinarioAdminPage() {
  const teamMembers = await getTeamMembers();

  if (!teamMembers.success || !teamMembers.data) {
    return <div>Error al cargar los miembros del equipo</div>;
  }

  const members = teamMembers.data;

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 3, rows: 2 }}
      duration={700}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Equipo Multidisciplinario
            </h1>
            <p className="text-muted-foreground">
              Gestiona los miembros del equipo multidisciplinario
            </p>
          </div>
          <Link href="/admin/equipo-multidisciplinario/nuevo">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuevo Miembro
            </Button>
          </Link>
        </div>

        <TeamMemberList teamMembers={members} />
      </div>
    </PageTransition>
  );
}
