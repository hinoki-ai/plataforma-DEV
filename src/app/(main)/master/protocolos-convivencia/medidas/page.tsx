"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Target, BarChart3, TrendingUp, Database } from "lucide-react";

function MedidasMasterContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const globalMeasuresStats = {
    totalApplications: 1247,
    averageEffectiveness: 82.5,
    mostUsedMeasure: "Amonestación Verbal",
    systemOptimization: 91.3,
  };

  const measuresEffectiveness = [
    { measure: "Amonestación Verbal", applications: 456, effectiveness: 78, trend: "+5%" },
    { measure: "Trabajo de Reflexión", applications: 234, effectiveness: 91, trend: "+12%" },
    { measure: "Suspensión de Clases", applications: 89, effectiveness: 65, trend: "-8%" },
    { measure: "Servicio Comunitario", applications: 67, effectiveness: 88, trend: "+15%" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Control Maestro - {t("nav.protocolos_comportamiento.medidas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestión global y analytics de medidas correctivas
            </p>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Avanzado
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Aplicaciones Totales</p>
                  <p className="text-2xl font-bold">{globalMeasuresStats.totalApplications.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Efectividad Promedio</p>
                  <p className="text-2xl font-bold">{globalMeasuresStats.averageEffectiveness}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Medida Más Usada</p>
                  <p className="text-sm font-bold">{globalMeasuresStats.mostUsedMeasure}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Optimización del Sistema</p>
                  <p className="text-2xl font-bold">{globalMeasuresStats.systemOptimization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Measures Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Efectividad por Medida</CardTitle>
            <CardDescription>
              Análisis de rendimiento de cada medida correctiva en el sistema global
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {measuresEffectiveness.map((measure, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{measure.measure}</p>
                        <p className="text-sm text-muted-foreground">{measure.applications} aplicaciones</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{measure.effectiveness}% efectividad</p>
                      <Badge variant="outline">{measure.trend}</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones de Optimización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Medidas Altamente Efectivas</h4>
                <p className="text-sm text-green-700 mt-1">
                  El "Trabajo de Reflexión" y "Servicio Comunitario" muestran efectividad superior al 85%.
                  Recomendamos aumentar su uso en 15-20%.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Medidas a Revisar</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  La "Suspensión de Clases" tiene efectividad por debajo del promedio.
                  Sugerimos revisar criterios de aplicación.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Oportunidades de Mejora</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Implementar seguimiento post-medida para todas las instituciones
                  mejoraría la efectividad general en un 10-15%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function MedidasMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <MedidasMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
