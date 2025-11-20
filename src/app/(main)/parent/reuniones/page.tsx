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
    redirect("/unauthorized");
  }

  const t = (key: string) => getServerTranslation(key, "parent", "es");

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-border">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("parent.meetings.page_description")}
              </p>
            </div>
          </div>
        </div>

        {/* Meetings Section */}
        <div className="container mx-auto px-4 py-8">
          <ParentMeetingTabs userId={session.user.id} />
        </div>
      </div>
    </PageTransition>
  );
}
