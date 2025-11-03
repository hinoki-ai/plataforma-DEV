import Link from "next/link";
import { Users, Plus, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/ui/page-transition";
import { TeamMemberList } from "@/components/admin/team-member-list";
import { getTeamMembers } from "@/services/queries/team-members";
import type { TeamMember } from "@/lib/prisma-compat-types";

export const dynamic = "force-dynamic";

export default async function AdminTeamMembersPage() {
  const teamMembersResult = await getTeamMembers();

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

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((member) => member.isActive).length;
  const hasError = !teamMembersResult.success;

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 1, rows: 3 }}
      duration={700}
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Equipo Multidisciplinario
            </h1>
            <p className="text-muted-foreground">
              Gestiona a los profesionales que acompañan a la comunidad
              educativa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/equipo-multidisciplinario" target="_blank">
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" /> Ver sitio público
              </Button>
            </Link>
            <Link href="/admin/equipo-multidisciplinario/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo miembro
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Miembros activos</CardTitle>
                <CardDescription>
                  Profesionales visibles en el sitio
                </CardDescription>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Total de miembros</CardTitle>
                <CardDescription>
                  Incluye miembros inactivos y en borrador
                </CardDescription>
              </div>
              <RefreshCw className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acceso rápido</CardTitle>
              <CardDescription>
                Gestiona el orden y visibilidad de cada especialista
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/admin/equipo-multidisciplinario/new">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" /> Agregar profesional
                </Button>
              </Link>
              <Link href="/equipo-multidisciplinario" target="_blank">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Eye className="h-4 w-4" /> Revisar vista pública
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {hasError ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar el equipo</AlertTitle>
            <AlertDescription>
              {teamMembersResult.error ||
                "Intenta nuevamente o crea un nuevo miembro para comenzar."}
            </AlertDescription>
          </Alert>
        ) : (
          <TeamMemberList
            teamMembers={teamMembers}
            variant="admin"
            showActions
            gridColumns={1}
            emptyMessage="Aún no tienes profesionales registrados. Agrega el primero para mostrarlo en la plataforma."
          />
        )}
      </div>
    </PageTransition>
  );
}
