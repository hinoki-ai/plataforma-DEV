import { TeamMemberForm } from '@/components/admin/team-member-form';
import { PageTransition } from '@/components/ui/page-transition';

export const dynamic = 'force-dynamic';

export default function NewTeamMemberPage() {
  return (
    <PageTransition
      skeletonType="form"
      skeletonProps={{ fields: 6 }}
      duration={700}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Nuevo Miembro del Equipo
          </h1>
          <p className="text-muted-foreground">
            Agrega un nuevo miembro al equipo multidisciplinario
          </p>
        </div>

        <TeamMemberForm />
      </div>
    </PageTransition>
  );
}
