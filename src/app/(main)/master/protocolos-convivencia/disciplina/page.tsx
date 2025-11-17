"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, BarChart3, Globe, Database, TrendingUp } from "lucide-react";

function DisciplinaMasterContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const globalDisciplineStats = {
    activeCases: 23,
    resolvedThisMonth: 156,
    averageResolutionTime: "3.2 días",
    systemEfficiency: 94.2,
  };

  const criticalCases = [
    { institution: "Colegio San José", cases: 8, severity: "high", trend: "+25%" },
    { institution: "Liceo Nacional", cases: 6, severity: "medium", trend: "+10%" },
    { institution: "Escuela República", cases: 9, severity: "high", trend: "+40%" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Control Maestro - {t("nav.protocolos_comportamiento.disciplina", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Supervisión global de casos disciplinarios en todas las instituciones
            </p>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Global
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Casos Activos</p>
                  <p className="text-2xl font-bold">{globalDisciplineStats.activeCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Resueltos (Mes)</p>
                  <p className="text-2xl font-bold">{globalDisciplineStats.resolvedThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">{globalDisciplineStats.averageResolutionTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Eficiencia</p>
                  <p className="text-2xl font-bold">{globalDisciplineStats.systemEfficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Cases by Institution */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Casos Críticos por Institución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalCases.map((institution, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">{institution.institution}</p>
                    <p className="text-sm text-muted-foreground">{institution.cases} casos activos</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={institution.severity === 'high' ? 'destructive' : 'secondary'}>
                      {institution.severity === 'high' ? 'Alta Prioridad' : 'Media Prioridad'}
                    </Badge>
                    <Badge variant="outline">{institution.trend}</Badge>
                    <Button size="sm" variant="outline">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Salud del Sistema Disciplinario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">94.2%</div>
                <div className="text-sm text-green-700">Casos Resueltos</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3.2 días</div>
                <div className="text-sm text-blue-700">Tiempo Promedio</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">87%</div>
                <div className="text-sm text-purple-700">Satisfacción</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function DisciplinaMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <DisciplinaMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
