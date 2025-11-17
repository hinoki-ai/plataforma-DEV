"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Award, AlertTriangle, Users, BookOpen, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";

function ProtocolosConvivenciaAdminContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const subcategories = [
    {
      title: t("nav.protocolos_convivencia.normas", "navigation"),
      description: "Gestión de normas y reglas de convivencia escolar",
      href: "/admin/protocolos-convivencia/normas",
      icon: Users,
      color: "bg-blue-500",
      stats: "12 normas activas",
    },
    {
      title: t("nav.protocolos_convivencia.disciplina", "navigation"),
      description: "Configuración de protocolos de disciplina y procedimientos",
      href: "/admin/protocolos-convivencia/disciplina",
      icon: Shield,
      color: "bg-red-500",
      stats: "3 protocolos definidos",
    },
    {
      title: t("nav.protocolos_convivencia.medidas", "navigation"),
      description: "Administración de medidas correctivas y sanciones",
      href: "/admin/protocolos-convivencia/medidas",
      icon: AlertTriangle,
      color: "bg-orange-500",
      stats: "8 medidas disponibles",
    },
    {
      title: t("nav.protocolos_convivencia.reconocimientos", "navigation"),
      description: "Sistema de reconocimientos y premios",
      href: "/admin/protocolos-convivencia/reconocimientos",
      icon: Award,
      color: "bg-green-500",
      stats: "4 tipos de reconocimiento",
    },
    {
      title: t("nav.protocolos_convivencia.actas_apoderados", "navigation"),
      description: "Gestión de actas de entrevistas con apoderados",
      href: "/admin/protocolos-convivencia/actas-apoderados",
      icon: FileText,
      color: "bg-purple-500",
      stats: "45 actas registradas",
    },
    {
      title: t("nav.protocolos_convivencia.actas_alumnos", "navigation"),
      description: "Gestión de actas de entrevistas con alumnos",
      href: "/admin/protocolos-convivencia/actas-alumnos",
      icon: FileText,
      color: "bg-indigo-500",
      stats: "67 actas registradas",
    },
  ];

  const recentActivity = [
    { action: "Nueva norma creada", user: "María González", time: "2 horas atrás" },
    { action: "Medida correctiva aplicada", user: "Carlos Rodríguez", time: "5 horas atrás" },
    { action: "Reconocimiento otorgado", user: "Ana López", time: "1 día atrás" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_convivencia", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Panel administrativo para gestión integral de protocolos de convivencia
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <BookOpen className="w-4 h-4 mr-2" />
              Académico
            </Badge>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configuración General
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Normas Activas</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Casos este Mes</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Reconocimientos</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Éxito</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {category.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {category.stats}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={category.href}>
                      <FileText className="w-4 h-4 mr-2" />
                      Gestionar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el sistema de protocolos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">por {activity.user}</p>
                  </div>
                  <Badge variant="outline">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ProtocolosComportamientoAdminPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar el panel administrativo de protocolos de convivencia</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <ProtocolosConvivenciaAdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
