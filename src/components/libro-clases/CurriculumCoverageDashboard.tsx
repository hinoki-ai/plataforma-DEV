"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CurriculumCoverageDashboardProps {
  courseId: Id<"courses">;
}

export function CurriculumCoverageDashboard({
  courseId,
}: CurriculumCoverageDashboardProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    undefined,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL" | undefined
  >(undefined);

  // Get course details
  const course = useQuery(
    api.courses.getCourseById,
    courseId ? { courseId } : "skip",
  );

  // Get coverage statistics
  const coverageStats = useQuery(
    api.learningObjectives.getCoverageStatistics,
    courseId
      ? {
          courseId,
          subject: selectedSubject,
          period: selectedPeriod,
        }
      : "skip",
  );

  if (!course || coverageStats === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-muted-foreground">
          Cargando estadísticas de cobertura...
        </div>
      </div>
    );
  }

  const {
    total,
    noIniciado,
    enProgreso,
    cubierto,
    reforzado,
    percentage,
    objectives,
  } = coverageStats;

  const stats = [
    {
      label: "Total OA",
      value: total,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "No Iniciados",
      value: noIniciado,
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900",
    },
    {
      label: "En Progreso",
      value: enProgreso,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      label: "Cubiertos",
      value: cubierto,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Reforzados",
      value: reforzado,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Filtrar por Asignatura
          </label>
          <Select
            value={selectedSubject || "all"}
            onValueChange={(value) =>
              setSelectedSubject(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las asignaturas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las asignaturas</SelectItem>
              {course.subjects.map((subject: string) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Filtrar por Período
          </label>
          <Select
            value={selectedPeriod || "all"}
            onValueChange={(value) =>
              setSelectedPeriod(
                value === "all"
                  ? undefined
                  : (value as "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL"),
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los períodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los períodos</SelectItem>
              <SelectItem value="PRIMER_SEMESTRE">Primer Semestre</SelectItem>
              <SelectItem value="SEGUNDO_SEMESTRE">Segundo Semestre</SelectItem>
              <SelectItem value="ANUAL">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div
                    className={cn("p-3 rounded-full", stat.bgColor, stat.color)}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Cobertura</CardTitle>
          <CardDescription>
            Porcentaje de OA cubiertos y reforzados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Cobertura General: {percentage.toFixed(1)}%
              </span>
              <Badge
                variant={
                  percentage >= 80
                    ? "default"
                    : percentage >= 50
                      ? "secondary"
                      : "destructive"
                }
              >
                {percentage >= 80
                  ? "Excelente"
                  : percentage >= 50
                    ? "En progreso"
                    : "Requiere atención"}
              </Badge>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {noIniciado}
              </div>
              <div className="text-xs text-muted-foreground">No Iniciados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {enProgreso}
              </div>
              <div className="text-xs text-muted-foreground">En Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {cubierto}
              </div>
              <div className="text-xs text-muted-foreground">Cubiertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reforzado}
              </div>
              <div className="text-xs text-muted-foreground">Reforzados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed OA List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Detallada de Objetivos de Aprendizaje</CardTitle>
          <CardDescription>
            Estado individual de cada OA del curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos ({total})</TabsTrigger>
              <TabsTrigger value="no_iniciado">
                No Iniciados ({noIniciado})
              </TabsTrigger>
              <TabsTrigger value="en_progreso">
                En Progreso ({enProgreso})
              </TabsTrigger>
              <TabsTrigger value="cubierto">Cubiertos ({cubierto})</TabsTrigger>
              <TabsTrigger value="reforzado">
                Reforzados ({reforzado})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-4">
              {objectives.map((obj) => (
                <ObjectiveCard key={obj._id} objective={obj} />
              ))}
            </TabsContent>

            <TabsContent value="no_iniciado" className="space-y-2 mt-4">
              {objectives
                .filter(
                  (o) =>
                    !o.coverage || o.coverage.coverageStatus === "NO_INICIADO",
                )
                .map((obj) => (
                  <ObjectiveCard key={obj._id} objective={obj} />
                ))}
            </TabsContent>

            <TabsContent value="en_progreso" className="space-y-2 mt-4">
              {objectives
                .filter((o) => o.coverage?.coverageStatus === "EN_PROGRESO")
                .map((obj) => (
                  <ObjectiveCard key={obj._id} objective={obj} />
                ))}
            </TabsContent>

            <TabsContent value="cubierto" className="space-y-2 mt-4">
              {objectives
                .filter((o) => o.coverage?.coverageStatus === "CUBIERTO")
                .map((obj) => (
                  <ObjectiveCard key={obj._id} objective={obj} />
                ))}
            </TabsContent>

            <TabsContent value="reforzado" className="space-y-2 mt-4">
              {objectives
                .filter((o) => o.coverage?.coverageStatus === "REFORZADO")
                .map((obj) => (
                  <ObjectiveCard key={obj._id} objective={obj} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ObjectiveCard({ objective }: { objective: any }) {
  const status = objective.coverage?.coverageStatus || "NO_INICIADO";
  const statusConfig = {
    NO_INICIADO: {
      label: "No Iniciado",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      icon: AlertCircle,
    },
    EN_PROGRESO: {
      label: "En Progreso",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: Clock,
    },
    CUBIERTO: {
      label: "Cubierto",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: CheckCircle2,
    },
    REFORZADO: {
      label: "Reforzado",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      icon: TrendingUp,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{objective.code}</Badge>
              <Badge className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
              {objective.semester && (
                <Badge variant="secondary" className="text-xs">
                  {objective.semester === "PRIMER_SEMESTRE"
                    ? "1er Semestre"
                    : objective.semester === "SEGUNDO_SEMESTRE"
                      ? "2do Semestre"
                      : "Anual"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {objective.description}
            </p>
            {objective.coverage && (
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                <span>Veces cubierto: {objective.coverage.timesCovered}</span>
                {objective.coverage.lastCoveredDate && (
                  <span>
                    Última vez:{" "}
                    {new Date(
                      objective.coverage.lastCoveredDate,
                    ).toLocaleDateString("es-CL")}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="shrink-0">
            {config.icon && (
              <config.icon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
