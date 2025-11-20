"use client";

import { useSession } from "@/lib/auth-client";
import { PageTransition } from "@/components/ui/page-transition";
import { HorariosDashboardReal } from "@/components/horarios/HorariosDashboardReal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Sparkles } from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export const dynamic = "force-dynamic";

export default function AdminHorariosPage() {
  const { data: session } = useSession();
  const { t } = useDivineParsing(["admin"]);

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="relative overflow-hidden">
        <div className="relative">
          <div className="container mx-auto space-y-8 px-4 py-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <Badge className="gap-1 rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("admin.horarios.badge", "admin")}
                  </Badge>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {t("admin.horarios.title", "admin")}
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {session?.user?.name
                      ? t("admin.horarios.subtitle_greeting", "admin").replace(
                          "{name}",
                          session.data?.user.name.split(" ")[0],
                        )
                      : t("admin.horarios.subtitle", "admin")}
                  </p>
                </div>

                <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-sm backdrop-blur">
                  <CardContent className="flex items-center gap-3 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">
                        {t("admin.horarios.panel_title", "admin")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("admin.horarios.panel_description", "admin")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <HorariosDashboardReal persona="admin" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
