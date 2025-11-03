import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlarmClock,
  CalendarCheck2,
  FileWarning,
  MapPin,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { PageTransition } from "@/components/ui/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExtendedUserRole } from "@/lib/authorization";

const ROLE_DESTINATIONS: Partial<Record<ExtendedUserRole, string>> = {
  MASTER: "/admin/libro-clases/asistencia",
  ADMIN: "/admin/libro-clases/asistencia",
  PROFESOR: "/profesor/libro-clases/asistencia",
  PARENT: "/parent/libro-clases/asistencia",
};

const ATTENDANCE_BENEFITS = [
  {
    icon: CalendarCheck2,
    title: "Marcaciones en tiempo real",
    description:
      "Registra asistencia, atrasos y retiros con sellos horarios automáticos y trazabilidad completa.",
  },
  {
    icon: UsersRound,
    title: "Alertas inteligentes",
    description:
      "Detecta cursos con ausentismo crítico, envía notificaciones y genera reportes preventivos.",
  },
  {
    icon: ShieldAlert,
    title: "Cumplimiento normativo",
    description:
      "Reportes listos para inspección y cierres de periodo según lineamientos MINEDUC.",
  },
];

const WORKFLOWS = [
  {
    title: "Docentes",
    steps: [
      "Registro diario desde computador, tablet o móvil",
      "Justificación con adjuntos y comentarios",
      "Resúmenes automáticos para reuniones de curso",
    ],
  },
  {
    title: "Inspectoría y UTP",
    steps: [
      "Panel consolidado con filtros por nivel y jornada",
      "Alertas de inasistencias reiteradas y PIE",
      "Exportación de planillas oficiales y actas",
    ],
  },
  {
    title: "Familias",
    steps: [
      "Notificaciones inmediatas vía correo y app",
      "Historial de asistencias, atrasos y retiros",
      "Canal directo para justificar ausencias",
    ],
  },
];

const FIELD_METRICS = [
  {
    icon: AlarmClock,
    label: "Respuesta en aula",
    value: "< 45 seg",
  },
  {
    icon: FileWarning,
    label: "Alertas enviadas",
    value: "Automáticas",
  },
  {
    icon: MapPin,
    label: "Orígenes",
    value: "Sala, inspectoría o móvil",
  },
];

export default async function LibroClasesAttendancePage() {
  const session = await auth();
  const role = session?.user.role;
  const destination = role ? ROLE_DESTINATIONS[role] : undefined;

  if (destination) {
    redirect(destination);
  }

  return (
    <PageTransition className="space-y-16">
      <section className="rounded-3xl border bg-primary/5 p-8 md:p-12">
        <div className="space-y-6">
          <Badge variant="secondary" className="w-fit text-sm">
            Módulo de asistencia digital
          </Badge>
          <div className="space-y-4 md:max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Control de asistencia trazable para toda la comunidad escolar
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Registra asistencia, atrasos, justificativos y retiros en tiempo real.
              Todas las acciones quedan documentadas y listas para inspectoría, UTP y MINEDUC.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/contacto">Solicitar demostración</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/libro-clases">Volver al libro de clases</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/docs">Ver manual de asistencia</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FIELD_METRICS.map((metric) => (
              <Card key={metric.label} className="border-primary/20 bg-background/80">
                <CardContent className="flex flex-col gap-2 p-5">
                  <metric.icon className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-semibold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <Badge variant="outline" className="text-sm">
            Impacto directo
          </Badge>
          <h2 className="text-2xl font-semibold md:text-3xl">
            Reduce ausentismo y mejora la respuesta ante eventualidades
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Un módulo diseñado junto a equipos de inspectoría y convivencia escolar.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ATTENDANCE_BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="h-full">
              <CardHeader className="space-y-2">
                <benefit.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-8 md:p-12">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm">
            Flujos operativos
          </Badge>
          <h2 className="text-2xl font-semibold md:text-3xl">
            Cada actor tiene una vista focalizada
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Implementamos procesos simples para registrar, justificar y monitorear asistencia desde cualquier dispositivo.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {WORKFLOWS.map((workflow) => (
            <Card key={workflow.title} className="h-full">
              <CardHeader>
                <CardTitle>{workflow.title}</CardTitle>
                <CardDescription>
                  Operación diaria pensada para equipos educativos chilenos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {workflow.steps.map((step) => (
                  <div key={step} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center md:p-12">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Controla asistencia con la misma plataforma que gestiona calificaciones y convivencia
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground md:text-lg">
          Libera planillas manuales, evita reprocesos y entrega información al instante a quienes toman decisiones.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/contacto">Coordinar capacitación</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/registro-centro">Sumar mi establecimiento</Link>
          </Button>
        </div>
      </section>
    </PageTransition>
  );
}
