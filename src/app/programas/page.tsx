"use client";

import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useLanguage } from "@/components/language/LanguageContext";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Calendar,
  Compass,
  FileText,
  GraduationCap,
  Handshake,
  Layers,
  Lightbulb,
  MessageSquare,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  INSTITUTION_TYPE_INFO,
  getGradesForInstitutionType,
  getSubjectsForInstitutionType,
  type EducationalInstitutionType,
} from "@/lib/educational-system";

// Note: Metadata removed because this is now a client component for i18n support
// If metadata is needed, consider using a layout or moving to a server component with different i18n approach

const heroHighlights = [
  {
    icon: ShieldCheck,
    title: "Gobernanza por rol",
    description:
      "Dashboards diferenciados para administración, docentes y apoderados con permisos y navegación contextual.",
  },
  {
    icon: Calendar,
    title: "Calendario centralizado",
    description:
      "Unifica eventos, reuniones y horarios con exportación, importación masiva y categorías dinámicas.",
  },
  {
    icon: Layers,
    title: "Cobertura completa",
    description:
      "Configura educación parvularia, básica, media y superior desde un solo selector institucional.",
  },
];

const institutionProgramDetails: Record<
  EducationalInstitutionType,
  {
    icon: LucideIcon;
    tagline: string;
    modules: string[];
  }
> = {
  PRESCHOOL: {
    icon: Sparkles,
    tagline:
      "Trayectorias NT1-NT2 con seguimiento socioemocional y colaboración familia-escuela.",
    modules: [
      "Calendario institucional con filtros para actividades pedagógicas y familiares.",
      "Planificaciones iniciales con plantillas adaptables y recursos multimedia.",
      "Panel de apoderados con reuniones y comunicaciones en tiempo real.",
    ],
  },
  BASIC_SCHOOL: {
    icon: Lightbulb,
    tagline:
      "Cobertura 1° básico a 8° básico con foco en interdisciplinariedad y gestión comunitaria.",
    modules: [
      "Planificaciones colaborativas con buscador por asignatura, curso y autor.",
      "Metas PME consolidadas con evidencia y seguimiento de cumplimiento.",
      "Libro de clases digital y gestión formal de reuniones con apoderados.",
    ],
  },
  HIGH_SCHOOL: {
    icon: Layers,
    tagline:
      "Rutas científico-humanistas y técnico-profesionales con participación estudiantil.",
    modules: [
      "Horarios sincronizados y calendario de evaluaciones en tiempo real.",
      "Repositorio documental y votaciones para consejos escolares y centros de estudiantes.",
      "Reportes de progreso y asistencia disponibles para equipos directivos y familias.",
    ],
  },
  TECHNICAL_INSTITUTE: {
    icon: Wrench,
    tagline:
      "Formación técnica especializada con certificación profesional y práctica laboral.",
    modules: [
      "Planes de estudio modulares con especializaciones técnicas.",
      "Gestión de prácticas profesionales y certificaciones técnicas.",
      "Coordinación docente especializada y evaluación técnica.",
    ],
  },
  TECHNICAL_CENTER: {
    icon: Settings,
    tagline:
      "Centros de formación técnica con certificación SENCE y empleabilidad inmediata.",
    modules: [
      "Programas técnicos certificados con seguimiento de competencias.",
      "Gestión de prácticas laborales y certificaciones estatales.",
      "Coordinación técnica y evaluación de habilidades prácticas.",
    ],
  },
  UNIVERSITY: {
    icon: GraduationCap,
    tagline:
      "Diplomados, programas técnicos y universitarios con trazabilidad académica y administrativa.",
    modules: [
      "Planificación modular para asignaturas electivas y talleres intensivos.",
      "Coordinación de equipos docentes con agenda y reuniones integradas.",
      "Gestión documental y reportes para procesos de acreditación y cumplimiento.",
    ],
  },
};

const institutionPrograms = (
  Object.entries(INSTITUTION_TYPE_INFO) as Array<
    [
      EducationalInstitutionType,
      (typeof INSTITUTION_TYPE_INFO)[EducationalInstitutionType],
    ]
  >
).map(([type, info]) => {
  const details = institutionProgramDetails[type];
  const grades = getGradesForInstitutionType(type);
  const subjects = getSubjectsForInstitutionType(type).slice(0, 4);
  const levelRange = info.levels.length
    ? info.levels.length > 1
      ? `${info.levels[0].chileanName} → ${info.levels[info.levels.length - 1].chileanName}`
      : info.levels[0].chileanName
    : info.chileanName;

  return {
    type,
    title: info.chileanName,
    description: info.description,
    icon: details.icon,
    tagline: details.tagline,
    modules: details.modules,
    subjects,
    levelRange,
    grades,
  };
});

const roleDashboards = [
  {
    id: "admin",
    icon: ShieldCheck,
    title: "Panel Administrativo",
    description:
      "Dirección y equipos de gestión configuran niveles, usuarios y el ecosistema de datos de la institución.",
    modules: [
      "Selector de tipo de institución con matriz curricular integrada.",
      "Gestión de usuarios, permisos y equipos desde /admin/usuarios.",
      "Calendario, reuniones, votaciones y documentos con trazabilidad completa.",
    ],
  },
  {
    id: "profesor",
    icon: Lightbulb,
    title: "Panel Docente",
    description:
      "Docentes sincronizan planificaciones, recursos y libro de clases en un flujo continuo.",
    modules: [
      "UnifiedCalendarView con búsqueda, exportación y vistas personales.",
      "Creador y repositorio de planificaciones con versiones y filtros avanzados.",
      "Libro de clases, actividades y recursos pedagógicos listos para aula.",
    ],
  },
  {
    id: "parent",
    icon: Handshake,
    title: "Panel de Familias",
    description:
      "Apoderados siguen el progreso académico y coordinan comunicación directa con docentes.",
    modules: [
      "Ficha por estudiante con asistencia, notas y actividades próximas.",
      "Mensajería, notificaciones y actas disponibles en un solo lugar.",
      "Solicitudes de reuniones y participación en votaciones colegiadas.",
    ],
  },
];

const platformModules = [
  {
    icon: Calendar,
    title: "Calendario institucional unificado",
    description:
      "UnifiedCalendarView centraliza eventos académicos, administrativos y familiares con importación/exportación CSV e integración iCal.",
    href: "/admin/calendario-escolar",
  },
  {
    icon: FileText,
    title: "Planificaciones y recursos",
    description:
      "PlanningDashboard, recursos docentes y actividades permiten diseñar, publicar y compartir clases con criterios comunes.",
    href: "/profesor/planificaciones",
  },
  {
    icon: BarChart3,
    title: "Seguimiento PME y analítica",
    description:
      "Los tableros PME consolidan metas, evidencias y avances por equipo, con estados y alertas configurables.",
    href: "/admin/pme",
  },
  {
    icon: MessageSquare,
    title: "Reuniones y comunicación",
    description:
      "Módulos de reuniones y mensajería integran agenda, confirmaciones, actas y seguimiento para toda la comunidad.",
    href: "/admin/reuniones",
  },
  {
    icon: ShieldCheck,
    title: "Gestión documental",
    description:
      "Repositorio por categorías con carga de reglamentos, protocolos y planes, visor PDF y control de versiones.",
    href: "/admin/documentos",
  },
  {
    icon: Users,
    title: "Participación y votaciones",
    description:
      "Flujos participativos con opciones múltiples, autenticación obligatoria y reportes descargables para actas.",
    href: "/admin/votaciones",
  },
];

const implementationPhases = [
  {
    icon: Compass,
    title: "Diagnóstico y configuración",
    duration: "Semana 1",
    description:
      "Levantamos el contexto institucional, definimos niveles y activamos la estructura con el selector educativo.",
    focus: "Matriz curricular, usuarios y permisos iniciales",
  },
  {
    icon: Layers,
    title: "Carga de información",
    duration: "Semanas 2-3",
    description:
      "Importamos calendarios, planificaciones históricas y documentos clave para comenzar con datos reales.",
    focus: "Eventos, planificaciones y repositorio documental",
  },
  {
    icon: Rocket,
    title: "Capacitación y despliegue",
    duration: "Mes 1",
    description:
      "Acompañamos a equipos directivos, docentes y familias en sesiones prácticas por rol para asegurar adopción.",
    focus: "Sesiones guiadas por dashboard y módulos críticos",
  },
  {
    icon: BarChart3,
    title: "Monitoreo continuo",
    duration: "Meses 2-3",
    description:
      "Seguimos indicadores PME, uso de módulos y retroalimentación para ajustes iterativos.",
    focus: "Reportes compartidos y planes de mejora",
  },
];

const supportHighlights = [
  {
    title: "Equipo interdisciplinario dedicado",
    description:
      "Especialistas pedagógicos, tecnológicos y de convivencia acompañan cada hito y coordinan con la institución.",
    bullets: [
      "Mesa técnica semanal con dirección",
      "Soporte priorizado para incidencias críticas",
      "Plan de comunicación con apoderados",
    ],
  },
  {
    title: "Acompañamiento operativo",
    description:
      "Documentamos procesos, configuramos integraciones y proveemos guías para sacar el máximo de cada módulo.",
    bullets: [
      "Playbooks de calendario, reuniones y votaciones",
      "Checklist de cumplimiento y documentación",
      "Capacitaciones grabadas y microlearning",
    ],
  },
  {
    title: "Comunidad y recursos",
    description:
      "Acceso a banco de planificaciones, proyectos y evaluaciones compartidas entre establecimientos aliados.",
    bullets: [
      "Calendario de comunidades de práctica",
      "Repositorio abierto de proyectos STEAM",
      "Microcursos certificados para docentes",
    ],
  },
];

const impactHighlights = [
  "RoleAwareDashboard sincroniza indicadores y navegación según el perfil del usuario.",
  "Los módulos de calendario, reuniones y votaciones comparten estados y notificaciones en tiempo real.",
  "Las familias acceden a informes, mensajes y actas sin depender de múltiples plataformas.",
  "Los equipos directivos monitorean PME, planificaciones y documentación desde un solo panel.",
];

export default function ProgramasPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-responsive-desktop bg-programas">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-6xl mx-auto space-y-16">
            <section className="text-center space-y-6">
              <div className="space-y-4">
                <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block">
                  <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out md:text-5xl">
                    Programas educativos basados en datos reales y colaboración
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
                  Activamos experiencias formativas integrales con módulos de
                  gestión, planificación y comunicación que conectan a
                  administración, docentes y familias.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/contacto">{t("programas.request_demo")}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-background/70"
                >
                  <Link href="/docs">{t("programas.view_specs")}</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 pt-6">
                {heroHighlights.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Trayectorias educativas por nivel institucional
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Configuramos el ecosistema digital a partir de los cuatro
                  tipos de establecimiento definidos por MINEDUC, personalizando
                  planificaciones, calendario y comunicación según cada tramo.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {institutionPrograms.map(
                  ({
                    type,
                    icon: Icon,
                    title,
                    tagline,
                    description,
                    modules,
                    subjects,
                    levelRange,
                    grades,
                  }) => (
                    <Card
                      key={type}
                      className="relative backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl flex flex-col"
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-foreground">
                              {title}
                            </CardTitle>
                            <p className="text-xs uppercase tracking-wide text-primary">
                              {levelRange}
                            </p>
                          </div>
                        </div>
                        <CardDescription className="text-base text-muted-foreground">
                          {tagline}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="bg-white/5 border border-white/10"
                          >
                            {description}
                          </Badge>
                          {grades.length > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-white/5 border border-white/10"
                            >
                              {grades.slice(0, 3).join(" • ")}
                              {grades.length > 3 ? "…" : ""}
                            </Badge>
                          )}
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {modules.map((item) => (
                            <li key={item} className="flex gap-2 text-left">
                              <span
                                className="mt-1 h-2 w-2 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        {subjects.length > 0 && (
                          <div className="pt-2 border-t border-border/40">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                              Enfoque curricular
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {subjects.map((subject) => (
                                <span
                                  key={subject}
                                  className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-foreground border border-white/10"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Dashboards diseñados para cada rol
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  RoleAwareDashboard adapta navegación, métricas y accesos para
                  administración, docentes y familias, manteniendo una
                  experiencia coherente en toda la plataforma.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {roleDashboards.map(
                  ({ id, icon: Icon, title, description, modules }) => (
                    <Card
                      key={id}
                      className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full flex flex-col"
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <CardTitle className="text-xl text-foreground">
                          {title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {modules.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span
                                className="mt-1 h-2 w-2 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Módulos transversales de la plataforma
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Cada programa combina herramientas académicas, administrativas
                  y de participación para mantener a toda la comunidad
                  sincronizada.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {platformModules.map(
                  ({ icon: Icon, title, description, href }) => (
                    <Card
                      key={title}
                      className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full"
                    >
                      <CardHeader>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <CardTitle className="text-lg text-foreground">
                          {title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-sm text-muted-foreground">
                          {description}
                        </CardDescription>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={href}>{t("programas.see_in_action")}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Así desplegamos cada programa
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Un roadmap práctico que asegura adopción y resultados medibles
                  desde el primer trimestre.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
                {implementationPhases.map(
                  (
                    { icon: Icon, title, duration, description, focus },
                    index,
                  ) => (
                    <Card
                      key={title}
                      className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full"
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-foreground">
                              {title}
                            </CardTitle>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {duration}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {focus}
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Acompañamiento y soporte continuo
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Nuestro equipo se integra a la institución para garantizar
                  operación diaria, soporte y mejora continua.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {supportHighlights.map(({ title, description, bullets }) => (
                  <Card
                    key={title}
                    className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl h-full"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      {bullets.map((item) => (
                        <div key={item} className="flex gap-2">
                          <span
                            className="mt-1 h-2 w-2 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-border/60 backdrop-blur-xl bg-card/80 shadow-2xl">
              <div
                className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-transparent"
                aria-hidden="true"
              />
              <div className="relative grid gap-8 lg:grid-cols-[1.2fr,1fr] p-10 md:p-14">
                <div className="space-y-6">
                  <Badge className="bg-primary text-primary-foreground uppercase tracking-wide">
                    Impacto medible
                  </Badge>
                  <h2 className="text-3xl font-semibold text-foreground">
                    Gestión integral con información en contexto
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Toda la comunidad utiliza los mismos datos, sincronizados
                    por rol y alimentados en tiempo real por nuestros módulos.
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {impactHighlights.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span
                          className="mt-1 h-2 w-2 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {platformModules.slice(0, 4).map(({ title }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-foreground font-medium"
                    >
                      {title}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="text-center space-y-6">
              <h2 className="text-3xl font-semibold text-foreground">
                Construyamos la próxima etapa de tu proyecto educativo
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Agenda una conversación para mapear necesidades y definir el
                plan de roll-out por niveles y roles.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/contacto">{t("programas.schedule_meeting")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/docs#programas">
                    Descargar ficha de programas
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </main>
        <MinEducFooter />
        <LegalFooter />
      </div>
    </div>
  );
}
