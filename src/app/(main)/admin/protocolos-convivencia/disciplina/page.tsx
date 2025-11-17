"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Clock, Users, FileText, Plus, BarChart3 } from "lucide-react";

function DisciplinaAdminContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const protocolos = [
    {
      title: "Faltas Leves",
      cases: 45,
      trend: "+12%",
      severity: "low",
    },
    {
      title: "Faltas Graves",
      cases: 23,
      trend: "-5%",
      severity: "high",
    },
    {
      title: "Faltas Muy Graves",
      cases: 3,
      trend: "0%",
      severity: "critical",
    },
  ];

  const recentCases = [
    { student: "Juan Pérez", infraction: "Llegada tarde", measure: "Amonestación", date: "2024-11-15", status: "resolved" },
    { student: "María González", infraction: "Falta de material", measure: "Trabajo de reflexión", date: "2024-11-14", status: "in_progress" },
    { student: "Carlos López", infraction: "Comportamiento disruptivo", measure: "Citación apoderado", date: "2024-11-13", status: "pending" },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Leve</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Grave</Badge>;
      case "critical":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Muy Grave</Badge>;
      default:
        return <Badge variant="secondary">Leve</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resuelto</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En Progreso</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de {t("nav.protocolos_comportamiento.disciplina", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Panel administrativo para gestión de casos disciplinarios
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Sistema Disciplinario
            </Badge>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Caso
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {protocolos.map((protocolo, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{protocolo.title}</CardTitle>
                  {getSeverityBadge(protocolo.severity)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{protocolo.cases}</p>
                    <p className="text-sm text-muted-foreground">casos este mes</p>
                  </div>
                  <Badge variant={protocolo.trend.startsWith('+') ? "secondary" : "outline"}>
                    {protocolo.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Casos Recientes
            </CardTitle>
            <CardDescription>
              Últimos casos disciplinarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.map((case_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{case_.student}</p>
                        <p className="text-sm text-muted-foreground">{case_.infraction}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{case_.measure}</p>
                      <p className="text-sm text-muted-foreground">{case_.date}</p>
                    </div>
                    {getStatusBadge(case_.status)}
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <BarChart3 className="w-6 h-6 mb-2" />
            Reportes Disciplinarios
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2" />
            Gestión de Apoderados
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Clock className="w-6 h-6 mb-2" />
            Seguimiento de Casos
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Shield className="w-6 h-6 mb-2" />
            Configurar Protocolos
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

export default function DisciplinaAdminPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de gestión disciplinaria</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <DisciplinaAdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
