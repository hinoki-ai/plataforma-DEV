import { Metadata } from "next";
import { headers } from "next/headers";
import { Users, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/ui/page-transition";
import { TeamMemberList } from "@/components/team/TeamMemberCard";
import { getTeamMembers } from "@/services/queries/team-members";
import { getServerTranslation } from "@/lib/server-translations";
import type { TeamMember } from "@/lib/prisma-compat-types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "es";
  const language = acceptLanguage.startsWith("en") ? "en" : "es";
  const t = (key: string) => getServerTranslation(key, "common", language);

  return {
    title: `${t("team.title")} | Plataforma Astral`,
    description: t("team.description"),
  };
}

export default async function PublicTeamDirectoryPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "es";
  const language = acceptLanguage.startsWith("en") ? "en" : "es";
  const t = (key: string) => getServerTranslation(key, "common", language);
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
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center space-y-8">
            <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
              <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out">
                {t("team.public.title")}
              </h1>
              <p className="text-center text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-300 mt-3 transition-all duration-700 ease-out">
                {t("team.public.description")}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-blue-200">
              <Users className="h-4 w-4" />
              {t("team.public.badge")}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            {hasError ? (
              <Alert
                variant="destructive"
                className="border-red-500 bg-red-900/40"
              >
                <AlertTitle>{t("team.public.error.title")}</AlertTitle>
                <AlertDescription>
                  {teamMembersResult.error ||
                    t("team.public.error.description")}
                </AlertDescription>
              </Alert>
            ) : (
              <TeamMemberList
                members={teamMembers}
                variant="public"
                showContact
                gridColumns={3}
                emptyMessage={t("team.public.empty.message")}
              />
            )}
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-950/60 px-4 py-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-blue-200">
              <Sparkles className="h-4 w-4" />
              {t("team.public.support.badge")}
            </div>
            <p className="text-lg text-blue-100">
              {t("team.public.support.description")}
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
