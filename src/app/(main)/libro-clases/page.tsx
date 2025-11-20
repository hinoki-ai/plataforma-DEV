import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  Layers,
  ShieldCheck,
  Users,
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
  MASTER: "/admin/libro-clases",
  ADMIN: "/admin/libro-clases",
  PROFESOR: "/profesor/libro-clases",
  PARENT: "/parent/libro-clases",
};

const HERO_METRICS = [
  {
    value: "100%",
    label: "Formato compatible MINEDUC",
  },
  {
    value: "24/7",
    label: "Seguimiento en tiempo real",
  },
  {
    value: "3 roles",
    label: "Administra, enseña y acompaña",
  },
];

const MODULES = [
  {
    title: "Gestión institucional",
    description:
      "Administra asistencia, calificaciones y observaciones con reportes consolidados por curso y nivel.",
    icon: ShieldCheck,
    highlights: [
      "Alertas automáticas de ausentismo y seguimiento PIE",
      "Actas oficiales y cierres de periodo listos para supervisión",
      "Integración con firmas digitales y respaldo documental",
    ],
  },
  {
    title: "Operación docente",
    description:
      "Facilita el registro diario de clases, contenidos, evaluaciones y reuniones con apoderados.",
    icon: BookOpenCheck,
    highlights: [
      "Planificación conectada a objetivos priorizados",
      "Registro rápido de asistencia, notas y observaciones",
      "Tableros inteligentes por asignatura y curso",
    ],
  },
  {
    title: "Experiencia familias",
    description:
      "Transparencia total para apoderados con seguimiento académico y comunicaciones trazables.",
    icon: Users,
    highlights: [
      "Portal familiar con calificaciones y observaciones",
      "Historial de entrevistas y compromisos pro-resignados",
      "Notificaciones inmediatas vía correo y app móvil",
    ],
  },
];

const IMPLEMENTATION_STEPS = [
  {
    title: "1. Levantamiento express",
    description:
      "Migramos cursos, docentes y estudiantes desde planillas existentes respetando normativa vigente.",
  },
  {
    title: "2. Capacitación práctica",
    description:
      "Sesiones guiadas para equipos directivos, docentes y asistentes de la educación.",
  },
  {
    title: "3. Puesta en marcha",
    description:
      "Activamos reportes diarios, métricas automáticas y canales de soporte continuo.",
  },
];

export default async function LibroClasesLandingPage() {
  const session = await auth();
  const role = session?.user.role;
  const destination = role ? ROLE_DESTINATIONS[role] : undefined;

  if (destination) {
    redirect(destination);
  }

  return (
    <PageTransition className="space-y-16">
      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-background to-background p-8 md:p-12 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 md:max-w-2xl">
            <Badge variant="secondary" className="w-fit text-sm">
              Libro de Clases Digital Certificado
            </Badge>
            <p className="text-lg text-muted-foreground md:text-xl">
              Centraliza asistencia, calificaciones, contenidos y observaciones
              en un solo panel. Diseñado para cumplir con las exigencias del
              MINEDUC y entregar trazabilidad real a equipos directivos,
              docentes y familias.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contacto">Solicitar demostración</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/registro-centro">Implementar en mi colegio</Link>
              </Button>
            </div>
          </div>
          <Card className="w-full max-w-sm self-stretch">
            <CardHeader>
              <CardTitle className="text-lg">Indicadores clave</CardTitle>
              <CardDescription>
                Métricas instantáneas disponibles para dirección, UTP e
                inspectoría.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {HERO_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border bg-muted/40 p-4"
                >
                  <div className="text-2xl font-semibold text-primary">
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <Badge variant="outline" className="text-sm">
            Plataforma unificada
          </Badge>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-muted-foreground md:text-lg">
                Flujos diseñados para directivos, docentes y familias con
                accesos controlados.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="/admin/libro-clases">Vista administrativa</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/profesor/libro-clases">Panel docente</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/parent/libro-clases">Portal familias</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {MODULES.map((module) => (
            <Card key={module.title} className="flex h-full flex-col">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <module.icon className="h-5 w-5" />
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-2 space-y-2 text-sm text-muted-foreground">
                {module.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border bg-card p-8 md:grid-cols-[2fr_3fr] md:p-12">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm">
            Marco normativo chileno
          </Badge>
          <p className="text-muted-foreground md:text-lg">
            Diseñamos cada módulo junto a equipos UTP e inspectoría para
            asegurar trazabilidad en auditorías y cierres de año escolar.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <span>
                Formato oficial compatible con Libro de Clases Digital MINEDUC.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Layers className="mt-0.5 h-4 w-4 text-primary" />
              <span>
                Histórico por curso con respaldo de firmas electrónicas y
                bitácora.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
              <span>
                Actas de evaluación, consejos de profesores y reportes listos
                para supervisión.
              </span>
            </div>
          </div>
        </div>
        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle className="text-lg">Implementación acompañada</CardTitle>
            <CardDescription>
              Nos encargamos de habilitar el libro digital en menos de 10 días
              hábiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {IMPLEMENTATION_STEPS.map((step) => (
              <div key={step.title} className="rounded-xl border p-4">
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
              Acceso a mesa de ayuda nacional, capacitaciones recurrentes y
              reportes personalizados.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border bg-muted/20 p-8 text-center md:p-12">
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground md:text-lg">
          Agenda una demostración personalizada y descubre cómo centralizar
          gestión académica, convivencia escolar y comunicación con familias.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/contacto">Hablar con un especialista</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs">Ver documentación técnica</Link>
          </Button>
        </div>
      </section>
    </PageTransition>
  );
}
