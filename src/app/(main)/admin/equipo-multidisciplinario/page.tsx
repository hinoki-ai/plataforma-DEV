"use client";

import { useEffect, useState } from "react";
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
import type { TeamMember } from "@/lib/prisma-compat-types";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export const dynamic = "force-dynamic";

export default function AdminTeamMembersPage() {
  const { t } = useDivineParsing(["admin"]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/team-members");
        if (response.ok) {
          const data = await response.json();
          const members: TeamMember[] = data.success
            ? (data.data.map((member: any) => ({
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
          setTeamMembers(members);
          setError(null);
        } else {
          setError("Error loading team members");
        }
      } catch (err) {
        setError("Error loading team members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((member) => member.isActive).length;
  const hasError = !!error;

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
              {t("admin.equipo.title", "admin")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.equipo.description", "admin")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/equipo-multidisciplinario" target="_blank">
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />{" "}
                {t("admin.equipo.view_public", "admin")}
              </Button>
            </Link>
            <Link href="/admin/equipo-multidisciplinario/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />{" "}
                {t("admin.equipo.new_member", "admin")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {t("admin.equipo.active_members", "admin")}
                </CardTitle>
                <CardDescription>
                  {t("admin.equipo.active_members_desc", "admin")}
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
                <CardTitle className="text-base">
                  {t("admin.equipo.total_members", "admin")}
                </CardTitle>
                <CardDescription>
                  {t("admin.equipo.total_members_desc", "admin")}
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
              <CardTitle className="text-base">
                {t("admin.equipo.quick_access", "admin")}
              </CardTitle>
              <CardDescription>
                {t("admin.equipo.quick_access_desc", "admin")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/admin/equipo-multidisciplinario/new">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />{" "}
                  {t("admin.equipo.add_professional", "admin")}
                </Button>
              </Link>
              <Link href="/equipo-multidisciplinario" target="_blank">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Eye className="h-4 w-4" />{" "}
                  {t("admin.equipo.review_public", "admin")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {hasError ? (
          <Alert variant="destructive">
            <AlertTitle>{t("admin.equipo.error_loading", "admin")}</AlertTitle>
            <AlertDescription>
              {error || t("admin.equipo.error_loading_desc", "admin")}
            </AlertDescription>
          </Alert>
        ) : (
          <TeamMemberList
            teamMembers={teamMembers}
            variant="admin"
            showActions
            gridColumns={1}
            emptyMessage={t("admin.equipo.empty_message", "admin")}
          />
        )}
      </div>
    </PageTransition>
  );
}
