"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  GraduationCap,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Persona = "admin" | "profesor";

interface FetchCalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
  category: string;
  priority?: string;
  level?: string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
}

interface CalendarStatsData {
  total: number;
  upcoming: number;
  byCategory?: Record<string, number | undefined>;
  byPriority?: Record<string, number | undefined>;
}

interface EnrichedEvent extends FetchCalendarEvent {
  start: Date;
  end: Date;
  durationHours: number;
}

interface HorariosDashboardRealProps {
  persona?: Persona;
}

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: "Académico",
  ADMINISTRATIVE: "Administrativo",
  MEETING: "Reuniones UTP",
  SPECIAL: "Actos y Ceremonias",
  PARENT: "Familias y Apoderados",
  HOLIDAY: "Calendario MINEDUC",
  EXAM: "Evaluaciones",
  VACATION: "Receso",
  EVENT: "Eventos",
  DEADLINE: "Compromisos",
  OTHER: "Otros",
};

const CATEGORY_COLORS: Record<string, string> = {
  ACADEMIC: "from-sky-500/80 to-sky-400/80",
  ADMINISTRATIVE: "from-amber-500/80 to-amber-400/80",
  MEETING: "from-purple-500/80 to-purple-400/80",
  SPECIAL: "from-rose-500/80 to-rose-400/80",
  PARENT: "from-green-500/80 to-green-400/80",
  EXAM: "from-red-500/80 to-red-400/80",
  EVENT: "from-indigo-500/80 to-indigo-400/80",
  DEADLINE: "from-slate-500/80 to-slate-400/80",
  HOLIDAY: "from-teal-500/80 to-teal-400/80",
  VACATION: "from-emerald-500/80 to-emerald-400/80",
  OTHER: "from-zinc-500/80 to-zinc-400/80",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Alta prioridad",
  MEDIUM: "Prioridad media",
  LOW: "Prioridad baja",
};

const PRIORITY_TONES: Record<string, string> = {
  HIGH: "bg-rose-500/90 dark:bg-rose-500/80",
  MEDIUM: "bg-amber-500/90 dark:bg-amber-500/80",
  LOW: "bg-emerald-500/90 dark:bg-emerald-500/70",
};

const LEVEL_LABELS: Record<
  string,
  { title: string; detail: string; targetHours: number }
> = {
  inicial: {
    title: "Educación Parvularia",
    detail: "NT1 - NT2",
    targetHours: 28,
  },
  basica: {
    title: "Educación Básica",
    detail: "1º a 8º Básico",
    targetHours: 38,
  },
  media: {
    title: "Educación Media",
    detail: "1º a 4º Medio",
    targetHours: 38,
  },
  adultos: {
    title: "Modalidad Adultos",
    detail: "Planes 2x2 • Flexible",
    targetHours: 22,
  },
  especial: {
    title: "Programas PIE",
    detail: "Apoyos Decreto 170",
    targetHours: 24,
  },
  general: {
    title: "Institucional",
    detail: "Transversal / Multi-nivel",
    targetHours: 16,
  },
};

const LOCALE = "es-CL";

const formatterDate = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "short",
});

const formatterTime = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
});

const WEEKDAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function normaliseLevel(level?: string | null): keyof typeof LEVEL_LABELS {
  if (!level) return "general";
  const normalised = level.toLowerCase().trim();
  if (normalised.includes("parv")) return "inicial";
  if (normalised.includes("nt")) return "inicial";
  if (normalised.includes("básic") || normalised.includes("basic"))
    return "basica";
  if (normalised.includes("media") || normalised.includes("tecn"))
    return "media";
  if (normalised.includes("adult")) return "adultos";
  if (normalised.includes("pie") || normalised.includes("inclus"))
    return "especial";
  return "general";
}

function computeDurationHours(event: FetchCalendarEvent) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      start: new Date(),
      end: new Date(),
      durationHours: 0,
    };
  }

  const milliseconds = Math.max(end.getTime() - start.getTime(), 0);
  const durationHours = event.isAllDay ? 6 : milliseconds / (1000 * 60 * 60);

  return {
    start,
    end,
    durationHours: Number.isFinite(durationHours) ? durationHours : 0,
  };
}

function getProgressTone(value: number) {
  if (value >= 100) return "bg-emerald-500";
  if (value >= 90) return "bg-primary";
  if (value >= 75) return "bg-amber-500";
  return "bg-rose-500";
}

export function HorariosDashboardReal({
  persona = "admin",
}: HorariosDashboardRealProps) {
  const [events, setEvents] = useState<FetchCalendarEvent[]>([]);
  const [stats, setStats] = useState<CalendarStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch(
          "/api/calendar/events?categories=ACADEMIC,MEETING,ADMINISTRATIVE,SPECIAL,EXAM,PARENT",
        ).then((response) => response.json()),
        fetch("/api/calendar/statistics").then((response) => response.json()),
      ]);

      if (eventsRes?.success && Array.isArray(eventsRes.data)) {
        setEvents(eventsRes.data);
      } else {
        setEvents([]);
        setErrorMessage(
          (prev) =>
            prev ??
            "No pudimos cargar los eventos en vivo. Intenta nuevamente.",
        );
      }

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        setStats(null);
        setErrorMessage(
          (prev) =>
            prev ?? "No pudimos obtener las estadísticas ministeriales.",
        );
      }
    } catch (error) {
      console.error("Error loading horarios dashboard:", error);
      setEvents([]);
      setStats(null);
      setErrorMessage("Tuvimos un problema al conectar con el planificador.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const {
    agenda,
    totals,
    categories,
    weekDistribution,
    levelMetrics,
    campusTension,
    priorityBreakdown,
    insights,
  } = useMemo(() => {
    if (!events.length && !stats) {
      return {
        agenda: [],
        totals: {
          totalEvents: 0,
          upcoming: 0,
          weeklyHours: 0,
          extendedHours: 0,
          weekendCount: 0,
          jecCoverage: 0,
        },
        categories: [],
        weekDistribution: Array.from({ length: 7 }, (_, index) => ({
          label: WEEKDAY_LABELS[index],
          value: 0,
          percent: 0,
        })),
        levelMetrics: [],
        campusTension: [],
        priorityBreakdown: [],
        insights: {
          principal:
            persona === "admin"
              ? "Aún no registras horarios en Convex. Activa el calendario para comenzar a visualizar métricas estratégicas."
              : "Tu agenda docente está vacía por ahora. Suma bloques o actividades para ver recomendaciones inmediatas.",
          secondary:
            persona === "admin"
              ? "Carga los horarios oficiales desde SIGE o crea eventos directamente en la plataforma."
              : "Coordina con UTP para validar tus bloques y asegurar la cobertura semanal.",
        },
      };
    }

    const enrichedEvents: EnrichedEvent[] = events.map((event) => {
      const { start, end, durationHours } = computeDurationHours(event);
      return {
        ...event,
        start,
        end,
        durationHours,
      };
    });

    const now = new Date();
    const upcomingAgenda = enrichedEvents
      .filter(
        (event) => event.start.getTime() >= now.getTime() - 15 * 60 * 1000,
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, persona === "admin" ? 6 : 5);

    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDay + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const eventsThisWeek = enrichedEvents.filter(
      (event) => event.start >= monday && event.start <= sunday,
    );

    const weeklyHours = eventsThisWeek.reduce(
      (total, event) => total + event.durationHours,
      0,
    );

    const extendedHours = enrichedEvents
      .filter(
        (event) =>
          event.start.getHours() >= 18 ||
          event.end.getHours() >= 18 ||
          event.durationHours >= 3,
      )
      .reduce((total, event) => total + event.durationHours, 0);

    const weekendCount = enrichedEvents.filter((event) => {
      const day = event.start.getDay();
      return day === 0 || day === 6;
    }).length;

    const jecTarget = persona === "admin" ? 44 : 32;
    const jecCoverage =
      weeklyHours > 0
        ? Math.min(125, Math.round((weeklyHours / jecTarget) * 100))
        : 0;

    const totals = {
      totalEvents: stats?.total ?? enrichedEvents.length,
      upcoming: stats?.upcoming ?? upcomingAgenda.length,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      extendedHours: Math.round(extendedHours * 10) / 10,
      weekendCount,
      jecCoverage,
    };

    const categoriesSource = stats?.byCategory ?? {};
    const categoryEntries =
      Object.entries(categoriesSource).length > 0
        ? Object.entries(categoriesSource)
        : Object.entries(
            enrichedEvents.reduce<Record<string, number>>((acc, event) => {
              acc[event.category] = (acc[event.category] ?? 0) + 1;
              return acc;
            }, {}),
          );

    const maxCategoryValue =
      categoryEntries.reduce(
        (max, [, value]) => Math.max(max, value ?? 0),
        0,
      ) || 1;

    const categories = categoryEntries
      .map(([key, count]) => {
        const value = count ?? 0;
        return {
          key,
          label: CATEGORY_LABELS[key] ?? key,
          value,
          percent: Math.round((value / maxCategoryValue) * 100),
          tone: CATEGORY_COLORS[key] ?? "from-slate-500/80 to-slate-400/80",
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const dayDistribution = Array.from({ length: 7 }, () => 0);
    enrichedEvents.forEach((event) => {
      const dayIndex = event.start.getDay();
      const index = dayIndex === 0 ? 6 : dayIndex - 1;
      dayDistribution[index] += 1;
    });

    const maxDayValue =
      dayDistribution.reduce((max, value) => Math.max(max, value), 0) || 1;

    const weekDistribution = dayDistribution.map((value, index) => ({
      label: WEEKDAY_LABELS[index],
      value,
      percent: Math.round((value / maxDayValue) * 100),
    }));

    const levelAggregation = enrichedEvents.reduce<
      Record<keyof typeof LEVEL_LABELS, { count: number; hours: number }>
    >((acc, event) => {
      const key = normaliseLevel(event.level);
      if (!acc[key]) {
        acc[key] = { count: 0, hours: 0 };
      }
      acc[key].count += 1;
      acc[key].hours += event.durationHours;
      return acc;
    }, {} as any);

    const levelMetrics = Object.entries(levelAggregation)
      .map(([levelKey, value]) => {
        const level = levelKey as keyof typeof LEVEL_LABELS;
        const metadata = LEVEL_LABELS[level] ?? LEVEL_LABELS.general;
        const coverage =
          value.hours > 0
            ? Math.min(
                130,
                Math.round((value.hours / (metadata.targetHours || 1)) * 100),
              )
            : 0;

        return {
          key: levelKey,
          title: metadata.title,
          detail: metadata.detail,
          count: value.count,
          hours: Math.round(value.hours * 10) / 10,
          coverage,
          target: metadata.targetHours,
        };
      })
      .sort((a, b) => b.coverage - a.coverage);

    const campusAggregation = enrichedEvents.reduce<
      Record<string, { count: number; extended: number }>
    >((acc, event) => {
      const location = event.location?.trim() || "Sin ubicación declarada";
      if (!acc[location]) {
        acc[location] = { count: 0, extended: 0 };
      }
      acc[location].count += 1;
      if (event.durationHours >= 3) {
        acc[location].extended += 1;
      }
      return acc;
    }, {});

    const campusTension = Object.entries(campusAggregation)
      .map(([location, metric]) => ({
        location,
        count: metric.count,
        extended: metric.extended,
        saturation:
          metric.count > 0
            ? Math.min(110, Math.round((metric.extended / metric.count) * 100))
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const priorityEntries =
      stats?.byPriority && Object.keys(stats.byPriority).length > 0
        ? Object.entries(stats.byPriority)
        : Object.entries(
            enrichedEvents.reduce<Record<string, number>>((acc, event) => {
              if (!event.priority) return acc;
              acc[event.priority] = (acc[event.priority] ?? 0) + 1;
              return acc;
            }, {}),
          );

    const totalPriorities =
      priorityEntries.reduce((sum, [, count]) => sum + (count ?? 0), 0) || 1;

    const priorityBreakdown = priorityEntries.map(([key, count]) => {
      const value = count ?? 0;
      return {
        key,
        label: PRIORITY_LABELS[key] ?? key,
        value,
        percent: Math.round((value / totalPriorities) * 100),
        tone: PRIORITY_TONES[key] ?? "bg-primary",
      };
    });

    const insights = {
      principal:
        persona === "admin"
          ? "Jornada Escolar Completa con cobertura sobresaliente. Revisa los bloques extendidos para resguardar horas de apoyo PIE."
          : "Tu planificación docente está alineada con la Jornada Escolar Completa. Aprovecha bloques extendidos para profundizar aprendizajes clave.",
      secondary:
        persona === "admin"
          ? "Verifica con UTP la distribución de horas JEC y comunica a los equipos PIE y SEP cualquier ajuste de última hora."
          : "Comparte tu agenda con coordinación pedagógica y resguarda tiempo para reuniones de retroalimentación con apoderados.",
    };

    return {
      agenda: upcomingAgenda,
      totals,
      categories,
      weekDistribution,
      levelMetrics,
      campusTension,
      priorityBreakdown,
      insights,
    };
  }, [events, stats, persona]);

  const showSkeleton = loading && !events.length;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border border-primary/40 bg-primary/10 text-primary shadow-none">
            {persona === "admin"
              ? "Gobernanza MINEDUC"
              : "Planificación Docente"}
          </Badge>
          <Badge
            variant="outline"
            className="border-sky-300 bg-sky-100/60 text-sky-700 dark:border-sky-500/60 dark:bg-sky-500/10 dark:text-sky-200"
          >
            Jornada Escolar Completa 2024
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-100/70 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            Decreto 67 • Evaluación para Aprendizaje
          </Badge>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {persona === "admin"
                ? "Horarios Institucionales Inteligentes"
                : "Agenda Docente Integral"}
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
              {persona === "admin"
                ? "Orquesta todos los bloques horarios con indicadores ministeriales, cobertura JEC y focos UTP en un mismo tablero para la red educativa Astral."
                : "Visualiza tu semana con métricas ministeriales, focos pedagógicos y recomendaciones UTP que potencian tu acción en aula."}
            </p>
          </div>

          <Card className="bg-linear-to-br from-primary/20 via-primary/10 to-transparent shadow-lg">
            <CardContent className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary/80">
                <ShieldCheck className="h-4 w-4" />
                Sello Astral
              </div>
              <div className="text-lg font-semibold text-primary">
                Coordinación pedagógica en tiempo real
              </div>
              <p className="text-xs text-muted-foreground">
                Datos sincronizados desde Convex • Firmado con trazabilidad UTP
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {errorMessage && (
        <Card className="border-amber-300/60 bg-amber-50/70 dark:border-amber-500/50 dark:bg-amber-500/10">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {errorMessage}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-200/80">
                  Si el problema persiste, valida tus credenciales o contacta al
                  equipo soporte Astral.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void loadDashboard();
              }}
              className="border-amber-400/60 bg-white text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-transparent dark:text-amber-200"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <CalendarClock className="h-4 w-4 text-primary" />
              Bloques Activos
            </div>
            <div className="text-3xl font-bold">
              {showSkeleton ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                totals.totalEvents
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Registro curricular conectado con Convex y respaldo SIGE.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Clock3 className="h-4 w-4 text-sky-500" />
              Horas Programadas (Semana)
            </div>
            <div className="text-3xl font-bold">
              {showSkeleton ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                `${totals.weeklyHours.toLocaleString(LOCALE, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                })} h`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Objetivo ministerial:{" "}
              {persona === "admin" ? "44 h JEC Básica" : "32 h foco docente"}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Target className="h-4 w-4 text-emerald-500" />
              Cobertura JEC
            </div>
            <div className="flex items-baseline gap-2">
              {showSkeleton ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {totals.jecCoverage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    meta ≥ 95%
                  </span>
                </>
              )}
            </div>
            <Progress
              value={showSkeleton ? 0 : totals.jecCoverage}
              className="h-2"
              indicatorClassName={getProgressTone(totals.jecCoverage)}
            />
            <p className="text-xs text-muted-foreground">
              {persona === "admin"
                ? "Integra JEC y reforzamiento SEP en la misma malla horaria."
                : "Mantén bloques pedagógicos y reforzamiento dentro del marco JEC."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-rose-500" />
              Extensión & Fines de Semana
            </div>
            <div className="text-3xl font-bold">
              {showSkeleton ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                totals.weekendCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Bloques fuera de jornada oficial (
              {totals.extendedHours.toFixed(1)} h extendidas).
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Agenda inmediata</CardTitle>
              <CardDescription>
                Próximos hitos para{" "}
                {persona === "admin"
                  ? "equipo directivo y UTP"
                  : "tu labor docente"}
                .
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="gap-1 border-primary/30 text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Inteligencia en vivo
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSkeleton ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : agenda.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center">
                <CalendarCheck2 className="h-8 w-8 text-muted-foreground/60" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    No hay bloques próximos registrados
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suma actividades en el calendario para activar las métricas
                    predictivas de Astral.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void loadDashboard();
                  }}
                >
                  Actualizar ahora
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {agenda.map((event, index) => (
                  <div
                    key={
                      event._id ?? `${event.title}-${event.startDate}-${index}`
                    }
                    className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-none bg-linear-to-r text-xs font-medium text-white shadow",
                              CATEGORY_COLORS[event.category] ??
                                "from-slate-500/80 to-slate-400/80",
                            )}
                          >
                            {CATEGORY_LABELS[event.category] ?? "Bloque"}
                          </Badge>
                          {event.priority ? (
                            <Badge
                              className={cn(
                                "border-none text-xs text-white shadow-sm",
                                PRIORITY_TONES[event.priority] ?? "bg-primary",
                              )}
                            >
                              {PRIORITY_LABELS[event.priority] ??
                                event.priority}
                            </Badge>
                          ) : null}
                        </div>
                        <h3 className="text-base font-semibold">
                          {event.title ?? "Bloque sin título"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatterDate.format(event.start)} ·{" "}
                          {formatterTime.format(event.start)} —{" "}
                          {formatterTime.format(event.end)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location ?? "Ubicación por confirmar"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="h-3.5 w-3.5" />
                          {LEVEL_LABELS[normaliseLevel(event.level)].title}
                        </div>
                      </div>
                    </div>
                    {event.description ? (
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Panel estratégico</CardTitle>
            <CardDescription>
              Indicadores críticos para decisiones rápidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                <GraduationCap className="h-4 w-4" />
                Cobertura JEC
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-3xl font-bold text-primary">
                  {showSkeleton ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    `${totals.jecCoverage}%`
                  )}
                </span>
                <span className="text-xs text-primary/80">
                  Meta MINEDUC ≥ 95%
                </span>
              </div>
              <Progress
                value={showSkeleton ? 0 : totals.jecCoverage}
                className="mt-3 h-2"
                indicatorClassName={getProgressTone(totals.jecCoverage)}
              />
              <p className="mt-2 text-xs text-primary/80">
                {insights.principal}
              </p>
            </div>

            <div className="space-y-3">
              {priorityBreakdown.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-muted-foreground/80">
                      {item.value} ({item.percent}%)
                    </span>
                  </div>
                  <Progress
                    value={item.percent}
                    className="h-1.5"
                    indicatorClassName={item.tone}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-muted/50 bg-muted/20 p-4">
              <div className="flex items-start gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Siguientes recomendaciones
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Flag className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  Alinea bloques PIE con reforzamiento SEP para evitar
                  duplicidades.
                </li>
                <li className="flex items-start gap-2">
                  <Users2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  Coordina reuniones de apoderados en bloques con baja
                  saturación.
                </li>
                <li className="flex items-start gap-2">
                  <Activity className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  Revisa bloques extendidos para fijar tutorías y apoyos
                  diferenciados.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Distribución por categoría</CardTitle>
            <CardDescription>
              Visión ministerial de actividades programadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSkeleton ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Crea nuevos eventos para visualizar la distribución por
                categoría.
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      {category.label}
                    </span>
                    <span className="text-muted-foreground/80">
                      {category.value} bloques
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-2 rounded-full bg-linear-to-r",
                        category.tone,
                      )}
                      style={
                        {
                          width: `var(--progress-width, ${category.percent}%)`,
                          "--progress-width": `${category.percent}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Ritmo semanal</CardTitle>
            <CardDescription>
              Equilibrio de cargas por día hábil conforme a JEC.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekDistribution.map((day) => (
              <div key={day.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{day.label}</span>
                  <span>{day.value} bloques</span>
                </div>
                <Progress
                  value={day.percent}
                  className="h-1.5"
                  indicatorClassName="bg-primary"
                />
              </div>
            ))}
            <div className="rounded-md border border-muted/50 bg-muted/20 p-3 text-xs text-muted-foreground">
              {insights.secondary}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Foco UTP y sostenedor</CardTitle>
            <CardDescription>
              Alertas y oportunidades de mejora inmediata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50/80 p-3 dark:border-emerald-400/40 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Cumplimiento SEP validado
                </p>
                <p>
                  Bloques de reforzamiento registrados dentro de la carga
                  horaria protegida.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/70 p-3 dark:border-amber-400/40 dark:bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-100">
                  Revisa bloques de fin de semana
                </p>
                <p>
                  Coordina con bienestar docente si las actividades responden a
                  campañas o refuerzo extraordinario.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-sky-200/60 bg-sky-50/60 p-3 dark:border-sky-400/40 dark:bg-sky-500/10">
              <BarChart3 className="h-4 w-4 text-sky-600" />
              <div>
                <p className="font-medium text-sky-800 dark:text-sky-200">
                  Transparenta la información al sostenedor
                </p>
                <p>
                  Exporta los bloques a CSV o ICS para respaldar auditorías de
                  cumplimiento ante MINEDUC y Supereduc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cobertura por nivel educativo</CardTitle>
            <CardDescription>
              Horas, bloques y metas diferenciadas por nivel MINEDUC.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSkeleton ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
              </div>
            ) : levelMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Etiqueta tus eventos por nivel (parvularia, básica, media, PIE)
                para visualizar la cobertura segmentada.
              </p>
            ) : (
              levelMetrics.map((level) => (
                <div
                  key={level.key}
                  className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{level.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {level.detail}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/40 text-primary"
                    >
                      {level.hours.toFixed(1)} h · {level.count} bloques
                    </Badge>
                  </div>
                  <Progress
                    value={level.coverage}
                    className="mt-3 h-2"
                    indicatorClassName={getProgressTone(level.coverage)}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Meta semanal: {level.target} h · Cobertura actual{" "}
                    {level.coverage}%.
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacidad de sedes y salas</CardTitle>
            <CardDescription>
              Identifica puntos de tensión para ajustes logísticos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSkeleton ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-10/12 rounded-lg" />
                <Skeleton className="h-4 w-8/12 rounded-lg" />
              </div>
            ) : campusTension.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Agrega ubicaciones (sede, sala, laboratorio) para anticipar
                saturación y ordenar logística.
              </p>
            ) : (
              campusTension.map((campus) => (
                <div
                  key={campus.location}
                  className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        {campus.location}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {campus.count} bloques programados · {campus.extended}{" "}
                        extendidos
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-none text-xs font-semibold text-white",
                        campus.saturation >= 80
                          ? "bg-rose-500"
                          : campus.saturation >= 60
                            ? "bg-amber-500"
                            : "bg-emerald-500",
                      )}
                    >
                      {campus.saturation}%
                    </Badge>
                  </div>
                  <Progress
                    value={campus.saturation}
                    className="mt-3 h-2"
                    indicatorClassName={
                      campus.saturation >= 80
                        ? "bg-rose-500"
                        : campus.saturation >= 60
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {campus.saturation >= 80
                      ? "Activa plan de contingencia: considera espacios alternativos o división de grupos."
                      : campus.saturation >= 60
                        ? "Monitorea disponibilidad y confirma asistencia de talleres y reforzamientos."
                        : "Capacidad equilibrada. Mantén monitoreo semanal con equipos de convivencia."}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
