"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Target, CheckCircle, FileText, Plus, Edit, TrendingUp } from "lucide-react";

function MedidasAdminContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const medidas = [
    {
      title: "Amonestación Verbal",
      applications: 145,
      effectiveness: 78,
      trend: "+5%",
      category: "leve",
    },
    {
      title: "Amonestación Escrita",
      applications: 89,
      effectiveness: 82,
      trend: "+12%",
      category: "leve",
    },
    {
      title: "Trabajo de Reflexión",
      applications: 67,
      effectiveness: 91,
      trend: "+8%",
      category: "medio",
    },
    {
      title: "Suspensión de Clases",
      applications: 23,
      effectiveness: 65,
      trend: "-15%",
      category: "grave",
    },
    {
      title: "Servicio Comunitario",
      applications: 12,
      effectiveness: 88,
      trend: "+20%",
      category: "medio",
    },
  ];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "leve":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Leve</Badge>;
      case "medio":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medio</Badge>;
      case "grave":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Grave</Badge>;
      default:
        return <Badge variant="secondary">Leve</Badge>;
    }
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 85) return "text-green-600";
    if (effectiveness >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de {t("nav.protocolos_comportamiento.medidas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Administración y seguimiento de medidas correctivas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {medidas.length} Medidas Activas
            </Badge>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Medida
            </Button>
          </div>
        </div>

        {/* Measures Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {medidas.map((medida, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-500" />
                    {medida.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getCategoryBadge(medida.category)}
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{medida.applications}</p>
                    <p className="text-sm text-muted-foreground">Aplicaciones</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getEffectivenessColor(medida.effectiveness)}`}>
                      {medida.effectiveness}%
                    </p>
                    <p className="text-sm text-muted-foreground">Efectividad</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {medida.trend}
                    </p>
                    <p className="text-sm text-muted-foreground">Tendencia</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Último mes</span>
                  <Button size="sm" variant="outline">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Acciones de Gestión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">Aplicar Medida</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="text-sm">Ver Reportes</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <CheckCircle className="w-6 h-6 mb-2" />
                <span className="text-sm">Seguimiento</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <Target className="w-6 h-6 mb-2" />
                <span className="text-sm">Configurar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Directrices de Aplicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Criterios Generales</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Proporcionalidad entre falta y medida</li>
                  <li>• Carácter educativo y formativo</li>
                  <li>• Respeto a los derechos del estudiante</li>
                  <li>• Participación de apoderados cuando corresponda</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Procedimiento</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Registro detallado del incidente</li>
                  <li>• Aplicación oportuna de la medida</li>
                  <li>• Seguimiento del cumplimiento</li>
                  <li>• Evaluación de resultados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function MedidasAdminPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de gestión de medidas</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <MedidasAdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
