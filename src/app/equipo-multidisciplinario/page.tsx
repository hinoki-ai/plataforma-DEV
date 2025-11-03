import { Metadata } from "next";
import { Users, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/ui/page-transition";
import { TeamMemberList } from "@/components/team/TeamMemberCard";
import { getTeamMembers } from "@/services/queries/team-members";
import type { TeamMember } from "@/lib/prisma-compat-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Equipo Multidisciplinario | Plataforma Astral",
  description:
    "Conoce al equipo multidisciplinario que acompaña a nuestra comunidad educativa con especialidades en apoyo psicoemocional, orientación y desarrollo integral.",
};

export default async function PublicTeamDirectoryPage() {
  const teamMembersResult = await getTeamMembers(true);

  const teamMembers: TeamMember[] = teamMembersResult.success
    ? (teamMembersResult.data.map((member) => ({
        ...member,
        createdAt:
          member.createdAt instanceof Date
            ? member.createdAt.toISOString()
            : member.createdAt,
        updatedAt:
          member.updatedAt instanceof Date
            ? member.updatedAt.toISOString()
            : member.updatedAt,
      })) as unknown as TeamMember[])
    : [];

  const hasError = !teamMembersResult.success;

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 3, rows: 2 }}
      duration={700}
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-blue-200">
              <Users className="h-4 w-4" />
              Nuestro equipo de especialistas
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Profesionales comprometidos con el desarrollo integral
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-blue-100">
              Psicólogos, orientadores, educadores diferenciales y especialistas
              en bienestar que trabajan en conjunto para potenciar la
              experiencia educativa de cada estudiante.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            {hasError ? (
              <Alert
                variant="destructive"
                className="border-red-500 bg-red-900/40"
              >
                <AlertTitle>No se pudo cargar el equipo</AlertTitle>
                <AlertDescription>
                  {teamMembersResult.error ||
                    "Estamos actualizando los perfiles. Intenta nuevamente en unos momentos."}
                </AlertDescription>
              </Alert>
            ) : (
              <TeamMemberList
                members={teamMembers}
                variant="public"
                showContact
                gridColumns={3}
                emptyMessage="Pronto compartiremos los perfiles de nuestro equipo multidisciplinario."
              />
            )}
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-950/60 px-4 py-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-blue-200">
              <Sparkles className="h-4 w-4" />
              Acompañamiento personalizado
            </div>
            <p className="text-lg text-blue-100">
              Cada familia puede solicitar reuniones con el equipo a través de
              la plataforma para coordinar apoyos, seguimiento académico y
              acciones preventivas.
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
