"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Shield,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Globe,
  Database,
} from "lucide-react";
import Link from "next/link";

function ProtocolosComportamientoMasterContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const systemOverview = {
    totalNormas: 145,
    activeCases: 23,
    totalRecognitions: 892,
    systemHealth: 98.5,
    institutions: 12,
    totalStudents: 3450,
  };

  const globalStats = [
    {
      label: "Casos Resueltos (Mes)",
      value: "156",
      change: "+12%",
      trend: "up",
    },
    { label: "Tasa de Éxito", value: "94.2%", change: "+2.1%", trend: "up" },
    {
      label: "Tiempo Promedio Resolución",
      value: "3.2 días",
      change: "-0.5 días",
      trend: "up",
    },
    {
      label: "Satisfacción Institucional",
      value: "96%",
      change: "+1.5%",
      trend: "up",
    },
  ];

  const subcategories = [
    {
      title: t("nav.protocolos_convivencia.normas", "navigation"),
      description: "Gestión global de normas de comportamiento",
      href: "/master/protocolos-convivencia/normas",
      icon: Users,
      color: "bg-blue-500",
      stats: `${systemOverview.totalNormas} normas activas`,
      priority: "Alto",
    },
    {
      title: t("nav.protocolos_convivencia.disciplina", "navigation"),
      description:
        "Supervisión de casos disciplinarios en todas las instituciones",
      href: "/master/protocolos-convivencia/disciplina",
      icon: Shield,
      color: "bg-red-500",
      stats: `${systemOverview.activeCases} casos activos`,
      priority: "Crítico",
    },
    {
      title: t("nav.protocolos_convivencia.medidas", "navigation"),
      description: "Administración global de medidas correctivas",
      href: "/master/protocolos-convivencia/medidas",
      icon: AlertTriangle,
      color: "bg-orange-500",
      stats: "Analytics disponibles",
      priority: "Alto",
    },
    {
      title: t("nav.protocolos_convivencia.reconocimientos", "navigation"),
      description: "Sistema global de reconocimientos y premios",
      href: "/master/protocolos-convivencia/reconocimientos",
      icon: Award,
      color: "bg-green-500",
      stats: `${systemOverview.totalRecognitions} reconocimientos`,
      priority: "Medio",
    },
    {
      title: t("nav.protocolos_convivencia.actas_apoderados", "navigation"),
      description: "Supervisión global de actas de apoderados",
      href: "/master/protocolos-convivencia/actas-apoderados",
      icon: FileText,
      color: "bg-purple-500",
      stats: "Actas globales",
      priority: "Medio",
    },
    {
      title: t("nav.protocolos_convivencia.actas_alumnos", "navigation"),
      description: "Supervisión global de actas de alumnos",
      href: "/master/protocolos-convivencia/actas-alumnos",
      icon: FileText,
      color: "bg-indigo-500",
      stats: "Actas globales",
      priority: "Medio",
    },
  ];

  const criticalAlerts = [
    {
      institution: "Colegio San José",
      issue: "Aumento de casos disciplinarios",
      severity: "high",
    },
    {
      institution: "Liceo Nacional",
      issue: "Sistema de reconocimientos inactivo",
      severity: "medium",
    },
    {
      institution: "Escuela República",
      issue: "Normas desactualizadas",
      severity: "low",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Protocolos de Comportamiento - Control Maestro
            </h1>
            <p className="text-muted-foreground mt-2">
              Supervisión global del sistema de comportamiento en todas las
              instituciones
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="w-4 h-4 mr-2" />
              Sistema Global
            </Badge>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configuración Global
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Instituciones
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.institutions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estudiantes
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.totalStudents.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Casos Activos
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.activeCases}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Salud del Sistema
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.systemHealth}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Globales del Sistema</CardTitle>
            <CardDescription>
              Rendimiento general del sistema de protocolos de comportamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {globalStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas Críticas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{alert.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.issue}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "high"
                        ? "destructive"
                        : alert.severity === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {alert.severity === "high"
                      ? "Alta"
                      : alert.severity === "medium"
                        ? "Media"
                        : "Baja"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subcategories.map((category, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Prioridad: {category.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {category.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {category.stats}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={category.href}>
                      <FileText className="w-4 h-4 mr-2" />
                      Control Maestro
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Master Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controles Maestros del Sistema</CardTitle>
            <CardDescription>
              Herramientas avanzadas para gestión global del sistema de
              comportamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <Database className="w-5 h-5 mb-1" />
                <span className="text-sm">Backup Global</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="text-sm">Analytics Avanzado</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-sm">Configuración Global</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Globe className="w-5 h-5 mb-1" />
                <span className="text-sm">Sincronización</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ProtocolosComportamientoMasterPage() {
  return (
    <ErrorBoundary
      fallback={
        <div>
          Error al cargar el panel maestro de protocolos de comportamiento
        </div>
      }
    >
      <Suspense fallback={<LoadingState />}>
        <ProtocolosComportamientoMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
