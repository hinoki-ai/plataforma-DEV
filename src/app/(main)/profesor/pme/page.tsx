import Link from "next/link";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, ArrowRight } from "lucide-react";
import { getPlanningDocuments } from "@/services/queries/planning";
import { getUpcomingEvents } from "@/services/queries/calendar";

export const dynamic = "force-dynamic";

export default async function ProfesorPMEPage() {
  const planning = await getPlanningDocuments({});
  const upcoming = await getUpcomingEvents(8);

  const planningCount =
    planning.success && planning.data ? planning.data.length : 0;
  const upcomingCount =
    upcoming.success && upcoming.data ? upcoming.data.length : 0;

  return (
    <PageTransition
      skeletonType="cards"
      skeletonProps={{ columns: 2, rows: 1 }}
      duration={700}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión PME</h1>
          <p className="text-muted-foreground">
            Accesos directos y métricas basadas en tus planificaciones y
            calendario.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Planificaciones
                </CardTitle>
                <CardDescription>
                  Documentos creados recientemente
                </CardDescription>
              </div>
              <div className="text-3xl font-bold">{planningCount}</div>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild>
                <Link href="/profesor/planificaciones">
                  Abrir Planificaciones <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Calendario
                </CardTitle>
                <CardDescription>
                  Próximos eventos en los próximos 30 días
                </CardDescription>
              </div>
              <div className="text-3xl font-bold">{upcomingCount}</div>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild variant="outline">
                <Link href="/profesor/calendario-escolar">
                  Ver Calendario <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
