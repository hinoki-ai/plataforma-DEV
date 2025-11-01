"use client";

import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/ui/page-transition";
import { HorariosDashboardReal } from "@/components/horarios/HorariosDashboardReal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminHorariosPage() {
  const { data: session } = useSession();

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950/70 dark:to-slate-900" />
        <div className="relative">
          <div className="container mx-auto space-y-8 px-4 py-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <Badge className="gap-1 rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Modo administrador
                  </Badge>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Coordinación integral de horarios
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {session?.user?.name
                      ? `Hola ${session.user.name.split(" ")[0]}, administra la malla horaria con indicadores estratégicos, cobertura JEC y focos UTP en un mismo tablero.`
                      : "Administra la malla horaria con indicadores estratégicos, cobertura JEC y focos UTP en un mismo tablero."}
                  </p>
                </div>

                <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-sm backdrop-blur">
                  <CardContent className="flex items-center gap-3 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">Panel Astral 360</p>
                      <p className="text-muted-foreground">
                        Integrado con Convex y reportes Mineduc
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
