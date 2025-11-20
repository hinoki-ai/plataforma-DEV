import { Metadata } from "next";
import { PageTransition } from "@/components/ui/page-transition";
import { ParentMeetingTabs } from "@/components/meetings/ParentMeetingTabs";
import { requireAuth } from "@/lib/server-auth";
import { getRoleAccess } from "@/lib/role-utils";
import { redirect } from "next/navigation";
import { getServerTranslation } from "@/lib/server-translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reuniones de Apoderados | Plataforma Astral",
  description:
    "Sistema profesional de gestión de reuniones entre familias y docentes. Facilita la comunicación y seguimiento académico.",
  keywords:
    "reuniones apoderados, gestión educativa, plataforma institucional, comunicación padres profesores",
  openGraph: {
    title: "Reuniones de Apoderados | Plataforma Astral",
    description:
      "Sistema integral para gestionar reuniones y mantener comunicación efectiva entre familias y docentes.",
    type: "website",
  },
};

export default async function ParentReunionesPage() {
  const session = await requireAuth();
  const roleAccess = getRoleAccess(session.user.role);

  // Ensure user has access to parent dashboard
  if (
    !roleAccess.canAccessParent &&
    session.user.role !== "PROFESOR" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/no-autorizado");
  }

  const t = (key: string) => getServerTranslation(key, "parent", "es");

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="min-h-screen bg-background">
        {/* Meetings Section */}
        <div className="container mx-auto px-4 py-8">
          <ParentMeetingTabs userId={session.user.id} />
        </div>
      </div>
    </PageTransition>
  );
}
