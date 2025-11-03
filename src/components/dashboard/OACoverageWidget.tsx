"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface OACoverageData {
  totalCourses: number;
  overallCoverage: number;
  totalOA: number;
  coverageByStatus: {
    noIniciado: number;
    enProgreso: number;
    cubierto: number;
    reforzado: number;
  };
  byCourse?: Array<{
    courseId: string;
    courseName: string;
    total: number;
    coverage: number;
    cubierto: number;
    reforzado: number;
  }>;
}

interface OACoverageWidgetProps {
  data: OACoverageData | null;
  loading?: boolean;
  className?: string;
}

export function OACoverageWidget({
  data,
  loading = false,
  className,
}: OACoverageWidgetProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes("/admin");
  const detailsLink = isAdmin
    ? "/admin/objetivos-aprendizaje"
    : "/profesor/libro-clases/cobertura";

  if (loading || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Cobertura Curricular (OA)
          </CardTitle>
          <CardDescription>
            Seguimiento de Objetivos de Aprendizaje según Decreto 67
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overallCoverage, totalOA, coverageByStatus, totalCourses, byCourse } =
    data;

  const coverageColor =
    overallCoverage >= 80
      ? "text-green-600"
      : overallCoverage >= 50
        ? "text-yellow-600"
        : "text-red-600";

  const coverageBadgeVariant =
    overallCoverage >= 80
      ? "default"
      : overallCoverage >= 50
        ? "secondary"
        : "destructive";

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cobertura Curricular (OA)
            </CardTitle>
            <CardDescription>
              Seguimiento de Objetivos de Aprendizaje según Decreto 67
            </CardDescription>
          </div>
          <Link href={detailsLink}>
            <Button variant="ghost" size="sm">
              Ver Detalles
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Coverage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Cobertura General</span>
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-bold", coverageColor)}>
                {overallCoverage.toFixed(1)}%
              </span>
              <Badge variant={coverageBadgeVariant}>
                {overallCoverage >= 80
                  ? "Excelente"
                  : overallCoverage >= 50
                    ? "En Progreso"
                    : "Requiere Atención"}
              </Badge>
            </div>
          </div>
          <Progress value={overallCoverage} className="h-3" />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            <Target className="h-5 w-5 text-blue-600 mb-1" />
            <div className="text-2xl font-bold">{totalOA}</div>
            <div className="text-xs text-muted-foreground">Total OA</div>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <Clock className="h-5 w-5 text-yellow-600 mb-1" />
            <div className="text-2xl font-bold">
              {coverageByStatus.enProgreso}
            </div>
            <div className="text-xs text-muted-foreground">En Progreso</div>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 mb-1" />
            <div className="text-2xl font-bold">
              {coverageByStatus.cubierto}
            </div>
            <div className="text-xs text-muted-foreground">Cubiertos</div>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <TrendingUp className="h-5 w-5 text-purple-600 mb-1" />
            <div className="text-2xl font-bold">
              {coverageByStatus.reforzado}
            </div>
            <div className="text-xs text-muted-foreground">Reforzados</div>
          </div>
        </div>

        {/* Course Breakdown */}
        {byCourse && byCourse.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Por Curso</h4>
            <div className="space-y-2">
              {byCourse.slice(0, 3).map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {course.courseName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {course.total} OA totales
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={course.coverage} className="h-2 w-20" />
                    <span className="text-sm font-medium w-12 text-right">
                      {course.coverage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {byCourse.length > 3 && (
                <Link href={detailsLink}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos los {byCourse.length} cursos
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Alert for low coverage */}
        {overallCoverage < 50 && totalOA > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Cobertura baja detectada
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                {coverageByStatus.noIniciado} OA no iniciados. Considera revisar
                tu planificación.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
