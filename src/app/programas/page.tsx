import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
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
  Compass,
  GraduationCap,
  Handshake,
  Layers,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programas Educativos | Plataforma Astral",
  description:
    "Conoce nuestros programas educativos diseñados para el desarrollo integral de los estudiantes.",
};

export default function ProgramasPage() {
  const heroHighlights = [
    {
      icon: Compass,
      title: "Cobertura nacional",
      description: "Implementación en 12 regiones de Chile",
    },
    {
      icon: Users,
      title: "+15.000 estudiantes",
      description: "Participando activamente en 2023-2024",
    },
    {
      icon: ShieldCheck,
      title: "Alineado a MINEDUC",
      description: "Programas con reportes y trazabilidad",
    },
  ];

  const programTracks = [
    {
      title: "Trayectoria STEM Integrada",
      icon: Lightbulb,
      tagline:
        "Laboratorios virtuales, pensamiento computacional y ciencias aplicadas con evaluación auténtica.",
      audience: "5° básico a IV medio",
      duration: "Módulos trimestrales adaptables",
      focusAreas: [
        "Laboratorios de ciencias guiados por IA y simulaciones",
        "Proyectos STEAM interdisciplinarios con rúbricas compartidas",
        "Resolución de desafíos reales en comunidad",
      ],
    },
    {
      title: "Competencias Socioemocionales y Ciudadanas",
      icon: Handshake,
      tagline:
        "Fortalecemos convivencia, bienestar y participación estudiantil con enfoque de derechos.",
      audience: "Educación parvularia a enseñanza media",
      duration: "Ciclos de 6 a 8 semanas",
      focusAreas: [
        "Programas SEL validados internacionalmente",
        "Planes de convivencia y mediación escolar",
        "Vinculación con familias y redes territoriales",
      ],
    },
    {
      title: "Innovación Pedagógica y Cultura Digital",
      icon: Layers,
      tagline:
        "Acompañamos a docentes y equipos académicos en la adopción de metodologías activas y tecnología significativa.",
      audience: "Equipos docentes y UTP",
      duration: "Trayectos de 4 módulos flexibles",
      focusAreas: [
        "Co-diseño de secuencias activas y aprendizaje basado en proyectos",
        "Integración de recursos digitales con foco en competencias TIC",
        "Optimización del tiempo docente mediante analítica de aprendizaje",
      ],
    },
    {
      title: "Liderazgo Directivo y Gestión Escolar",
      icon: GraduationCap,
      tagline:
        "Desarrollamos capacidades en liderazgo pedagógico, gestión del cambio y planificación estratégica.",
      audience: "Equipos directivos y sostenedores",
      duration: "Diplomados y rutas intensivas",
      focusAreas: [
        "Gobernanza escolar basada en datos",
        "Gestión del talento docente y plan de mejoras continuas",
        "Evaluación de impacto y rendición de cuentas",
      ],
    },
  ];

  const benefitHighlights = [
    {
      icon: Sparkles,
      title: "Diseño personalizado",
      description:
        "Diagnósticos iniciales y rutas flexibles por curso, con metas consensuadas con cada establecimiento.",
    },
    {
      icon: BarChart3,
      title: "Aprendizaje basado en evidencia",
      description:
        "Instrumentos de seguimiento alineados a estándares MINEDUC y UNESCO, con reportes accionables.",
    },
    {
      icon: Handshake,
      title: "Acompañamiento 360°",
      description:
        "Mentorías docentes, co-planificación y seguimiento socioemocional permanente para toda la comunidad escolar.",
    },
    {
      icon: ShieldCheck,
      title: "Cultura digital segura",
      description:
        "Protocolos de ciberseguridad, bienestar digital y alfabetización mediática adaptados a cada contexto.",
    },
  ];

  const implementationPhases = [
    {
      icon: Compass,
      title: "Diagnóstico y visión compartida",
      duration: "Semanas 1 a 3",
      description:
        "Analizamos resultados, cultura escolar y expectativas para co-construir una hoja de ruta realista.",
      focus: "Mapeo de actores y metas institucionales",
    },
    {
      icon: Layers,
      title: "Co-diseño curricular",
      duration: "Semanas 4 a 8",
      description:
        "Adaptamos contenidos, recursos y evaluaciones al contexto de cada curso con equipos docentes.",
      focus: "Secuencias activas y materiales contextualizados",
    },
    {
      icon: Rocket,
      title: "Despliegue y pilotaje",
      duration: "Meses 3 a 6",
      description:
        "Implementamos clases modelo, monitoreamos sesiones y recogemos evidencia para ajustar sobre la marcha.",
      focus: "Mentorías en aula y acompañamiento socioemocional",
    },
    {
      icon: BarChart3,
      title: "Escalamiento y mejora continua",
      duration: "Meses 6 a 12",
      description:
        "Comparte resultados, fortalece capacidades internas y consolida la sostenibilidad del programa.",
      focus: "Indicadores, comunidades de práctica y nuevos ciclos",
    },
  ];

  const supportHighlights = [
    {
      title: "Equipo interdisciplinario dedicado",
      description:
        "Un líder de proyecto y especialistas pedagógicos, tecnológicos y socioemocionales acompañan cada implementación.",
      bullets: [
        "Mentores con experiencia aula + gestión",
        "Reuniones tácticas quincenales",
        "Plan de comunicación con familias",
      ],
    },
    {
      title: "Panel de seguimiento en tiempo real",
      description:
        "Visualiza asistencia, avances por indicador y alertas tempranas desde un solo tablero integrado.",
      bullets: [
        "Integración con sistemas institucionales",
        "Alertas automatizadas a tutores",
        "Informes descargables para sostenedores",
      ],
    },
    {
      title: "Red de comunidades y recursos",
      description:
        "Facilitamos la colaboración entre establecimientos y compartimos buenas prácticas comprobadas.",
      bullets: [
        "Comunidades de práctica mensuales",
        "Banco de proyectos y evaluaciones",
        "Microcursos certificados para docentes",
      ],
    },
  ];

  const complementaryResources = [
    {
      title: "Guías metodológicas y kit de aula",
      description:
        "Planificaciones, rúbricas y materiales listos para imprimir o usar en formato digital.",
    },
    {
      title: "Evaluaciones formativas y de impacto",
      description:
        "Instrumentos pre y post con indicadores cognitivos, socioemocionales y de gestión.",
    },
    {
      title: "Eventos y bootcamps estudiantiles",
      description:
        "Festivales STEAM, hackatones y encuentros de liderazgo con aliados estratégicos.",
    },
  ];

  return (
    <div className="min-h-screen bg-responsive-desktop bg-programas">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1">
          <div className="max-w-6xl mx-auto space-y-16">
            <section className="text-center space-y-6">
              <Badge
                variant="outline"
                className="mx-auto uppercase tracking-wider bg-white/10 text-white border-white/20"
              >
                Programas modulares + acompañamiento continuo
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Programas educativos que aceleran el impacto de tu proyecto
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Co-diseñamos experiencias formativas integrales para
                  estudiantes, docentes y equipos directivos, con resultados
                  medibles y sostenibles.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/planes#programas">Explorar rutas y módulos</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-background/70"
                >
                  <Link href="/contacto">Agenda una reunión</Link>
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
                  Portafolio integral de programas
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Diseñamos trayectorias con foco en aprendizaje profundo,
                  habilidades socioemocionales y liderazgo institucional.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {programTracks.map(
                  ({
                    icon: Icon,
                    title,
                    tagline,
                    audience,
                    duration,
                    focusAreas,
                  }) => (
                    <Card
                      key={title}
                      className="relative backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl flex flex-col"
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <CardTitle className="text-xl text-foreground">
                            {title}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-base text-muted-foreground">
                          {tagline}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                            <span className="font-medium text-foreground">
                              Público:
                            </span>{" "}
                            {audience}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                            <span className="font-medium text-foreground">
                              Duración:
                            </span>{" "}
                            {duration}
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {focusAreas.map((item) => (
                            <li key={item} className="flex gap-2 text-left">
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
                  Experiencia que marca la diferencia
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Conjugamos pedagogía, tecnología y acompañamiento humano para
                  asegurar resultados sostenibles.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {benefitHighlights.map(({ icon: Icon, title, description }) => (
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
                    <CardContent>
                      <CardDescription className="text-sm text-muted-foreground">
                        {description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  Cómo implementamos junto a tu equipo
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Un roadmap claro y colaborativo para desplegar los programas
                  sin sobrecargar a la comunidad educativa.
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
              <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-foreground">
                      Acompañamiento y soporte continuo
                    </h2>
                    <p className="text-muted-foreground">
                      Cada establecimiento cuenta con un plan de soporte
                      adaptativo para asegurar que la implementación se mantenga
                      viva en el día a día.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {supportHighlights.map(
                      ({ title, description, bullets }) => (
                        <Card
                          key={title}
                          className="backdrop-blur-xl bg-card/80 border border-border/60 rounded-2xl shadow-2xl"
                        >
                          <CardHeader>
                            <CardTitle className="text-lg text-foreground">
                              {title}
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              {description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {bullets.map((item) => (
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
                </div>
                <Card className="backdrop-blur-xl bg-primary/10 border border-primary/40 rounded-2xl shadow-2xl flex flex-col justify-between">
                  <CardHeader className="space-y-3">
                    <Badge className="w-fit bg-white/15 text-white border-white/20 uppercase tracking-wide">
                      Recursos incluidos
                    </Badge>
                    <CardTitle className="text-2xl text-foreground">
                      Todo lo que necesitas para escalar el aprendizaje
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Materiales actualizados, experiencias inmersivas y redes
                      de colaboración para sostener el cambio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {complementaryResources.map(({ title, description }) => (
                      <div
                        key={title}
                        className="rounded-xl border border-white/20 bg-white/10 p-4"
                      >
                        <p className="font-medium text-foreground">{title}</p>
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-border/60 backdrop-blur-xl bg-card/80 shadow-2xl">
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"
                aria-hidden="true"
              />
              <div className="relative grid gap-8 lg:grid-cols-[1.2fr,1fr] p-10 md:p-14">
                <div className="space-y-6">
                  <Badge className="bg-primary text-primary-foreground uppercase tracking-wide">
                    Resultados observables
                  </Badge>
                  <h2 className="text-3xl font-semibold text-foreground">
                    Impacto medible para toda la comunidad educativa
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Nuestros equipos acompañan la toma de decisiones pedagógicas
                    con datos oportunos, historias de éxito y ciclos de mejora
                    continua.
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span>
                        Reportes trimestrales con análisis de logro, bienestar y
                        participación.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span>
                        Sesiones de retroalimentación con directivos y docentes
                        para ajustar estrategias.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span>
                        Historias de aprendizaje compartidas para visibilizar
                        avances con familias y comunidad.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "87% de docentes reportan mayor confianza metodológica",
                    "+22% en asistencia a talleres extracurriculares",
                    "93% de estudiantes valora el acompañamiento personalizado",
                    "+18 puntos en habilidades socioemocionales evaluadas",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-foreground font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="text-center space-y-6">
              <h2 className="text-3xl font-semibold text-foreground">
                Construyamos juntos el próximo capítulo de tu proyecto educativo
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Agenda una conversación para conocer tus desafíos y co-diseñar
                un plan de implementación a medida.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/contacto">Conversemos sobre tus objetivos</Link>
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
