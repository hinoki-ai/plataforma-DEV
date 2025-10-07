"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Star,
} from "lucide-react";

interface PerformanceMetric {
  subject: string;
  currentGrade: number;
  previousGrade: number;
  trend: "up" | "down" | "stable";
  improvement: number;
  target: number;
}

interface AttendanceData {
  month: string;
  present: number;
  absent: number;
  late: number;
}

interface BehaviorMetric {
  category: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "needs_improvement";
}

export default function ParentAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedStudent, setSelectedStudent] = useState("all");

  // Mock data - in real implementation, this would come from API
  const performanceMetrics: PerformanceMetric[] = [
    {
      subject: "Matemáticas",
      currentGrade: 6.8,
      previousGrade: 6.5,
      trend: "up",
      improvement: 0.3,
      target: 7.0,
    },
    {
      subject: "Lenguaje",
      currentGrade: 7.2,
      previousGrade: 7.0,
      trend: "up",
      improvement: 0.2,
      target: 7.5,
    },
    {
      subject: "Ciencias",
      currentGrade: 6.5,
      previousGrade: 6.8,
      trend: "down",
      improvement: -0.3,
      target: 7.0,
    },
    {
      subject: "Historia",
      currentGrade: 7.0,
      previousGrade: 6.7,
      trend: "up",
      improvement: 0.3,
      target: 7.2,
    },
  ];

  const attendanceData: AttendanceData[] = [
    { month: "Enero", present: 18, absent: 1, late: 1 },
    { month: "Febrero", present: 19, absent: 0, late: 1 },
    { month: "Marzo", present: 17, absent: 2, late: 1 },
    { month: "Abril", present: 20, absent: 0, late: 0 },
  ];

  const behaviorMetrics: BehaviorMetric[] = [
    { category: "Respeto", score: 8, maxScore: 10, status: "excellent" },
    { category: "Responsabilidad", score: 7, maxScore: 10, status: "good" },
    { category: "Colaboración", score: 9, maxScore: 10, status: "excellent" },
    {
      category: "Puntualidad",
      score: 6,
      maxScore: 10,
      status: "needs_improvement",
    },
    { category: "Organización", score: 8, maxScore: 10, status: "excellent" },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "needs_improvement":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return Star;
      case "good":
        return CheckCircle;
      case "needs_improvement":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const calculateOverallProgress = () => {
    const total = performanceMetrics.reduce(
      (sum, metric) => sum + metric.currentGrade,
      0,
    );
    return (total / performanceMetrics.length).toFixed(1);
  };

  const calculateAttendanceRate = () => {
    const total = attendanceData.reduce(
      (sum, data) => sum + data.present + data.absent + data.late,
      0,
    );
    const present = attendanceData.reduce((sum, data) => sum + data.present, 0);
    return ((present / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Analytics Avanzados
          </h2>
          <p className="text-muted-foreground">
            Métricas detalladas del progreso académico y comportamiento
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estudiantes</SelectItem>
              <SelectItem value="maria">María González</SelectItem>
              <SelectItem value="juan">Juan Pérez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio General
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateOverallProgress()}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.2 desde el período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAttendanceRate()}%
            </div>
            <p className="text-xs text-muted-foreground">
              74 de 78 días asistidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comportamiento
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2</div>
            <p className="text-xs text-muted-foreground">
              Promedio de 10 puntos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Metas Alcanzadas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/4</div>
            <p className="text-xs text-muted-foreground">
              75% de objetivos cumplidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Análisis de Rendimiento</span>
            </CardTitle>
            <CardDescription>
              Comparación de calificaciones por asignatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div
                  key={metric.subject}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(metric.trend)}
                    <div>
                      <h4 className="font-medium">{metric.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        Meta: {metric.target}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {metric.currentGrade}
                    </div>
                    <div
                      className={`text-xs ${metric.improvement >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                    >
                      {metric.improvement >= 0 ? "+" : ""}
                      {metric.improvement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Métricas de Comportamiento</span>
            </CardTitle>
            <CardDescription>
              Evaluación de habilidades sociales y académicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behaviorMetrics.map((metric) => (
                <div key={metric.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {React.createElement(getStatusIcon(metric.status), {
                        className: "h-4 w-4",
                      })}
                      <span className="text-sm font-medium">
                        {metric.category}
                      </span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.score}/{metric.maxScore}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      data-progress={Math.round(
                        (metric.score / metric.maxScore) * 100,
                      )}
                      style={
                        {
                          width: `${(metric.score / metric.maxScore) * 100}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Tendencias de Asistencia</span>
          </CardTitle>
          <CardDescription>
            Análisis mensual de asistencia y puntualidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((data) => (
              <div
                key={data.month}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{data.month}</h4>
                  <p className="text-sm text-muted-foreground">
                    Total: {data.present + data.absent + data.late} días
                  </p>
                </div>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {data.present}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Presente
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-destructive">
                      {data.absent}
                    </div>
                    <div className="text-xs text-muted-foreground">Ausente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {data.late}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tardanza
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Recomendaciones</span>
          </CardTitle>
          <CardDescription>
            Sugerencias basadas en el análisis de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Fortaleza en Matemáticas
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  El estudiante muestra excelente progreso en matemáticas.
                  Considerar actividades de enriquecimiento.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100">
                  Atención en Ciencias
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Se observa una ligera disminución en ciencias. Recomendamos
                  reforzar los conceptos básicos.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <Star className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Excelente Comportamiento
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  El estudiante mantiene un comportamiento ejemplar. Continuar
                  fomentando estas actitudes positivas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
