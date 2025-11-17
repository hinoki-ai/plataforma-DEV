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
import { Award, Trophy, Star, TrendingUp, Globe, Users } from "lucide-react";

function ReconocimientosMasterContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const globalRecognitionStats = {
    totalRecognitions: 892,
    institutionsActive: 12,
    averagePerInstitution: 74.3,
    growthRate: 23.5,
  };

  const topPerformingInstitutions = [
    { name: "Colegio San José", recognitions: 156, growth: "+35%", rank: 1 },
    { name: "Instituto Técnico", recognitions: 134, growth: "+28%", rank: 2 },
    { name: "Liceo Nacional", recognitions: 98, growth: "+15%", rank: 3 },
  ];

  const recognitionTypes = [
    { type: "Estudiante del Mes", count: 145, percentage: 16.3 },
    { type: "Equipo Solidario", count: 89, percentage: 10.0 },
    { type: "Ciudadano Ejemplar", count: 67, percentage: 7.5 },
    { type: "Proyecto Innovador", count: 43, percentage: 4.8 },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Control Maestro -{" "}
              {t("nav.protocolos_comportamiento.reconocimientos", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Sistema global de reconocimientos y premios en todas las
              instituciones
            </p>
          </div>
          <Button>
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics Global
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Reconocimientos Totales
                  </p>
                  <p className="text-2xl font-bold">
                    {globalRecognitionStats.totalRecognitions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Instituciones Activas
                  </p>
                  <p className="text-2xl font-bold">
                    {globalRecognitionStats.institutionsActive}
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
                    Promedio por Institución
                  </p>
                  <p className="text-2xl font-bold">
                    {globalRecognitionStats.averagePerInstitution}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tasa de Crecimiento
                  </p>
                  <p className="text-2xl font-bold">
                    +{globalRecognitionStats.growthRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Institutions */}
        <Card>
          <CardHeader>
            <CardTitle>Instituciones Destacadas</CardTitle>
            <CardDescription>
              Ranking de instituciones con mayor número de reconocimientos
              otorgados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingInstitutions.map((institution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{institution.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ranking #{institution.rank}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {institution.recognitions} reconocimientos
                      </p>
                      <Badge variant="secondary">{institution.growth}</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recognition Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Reconocimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recognitionTypes.map((recognition, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{recognition.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {recognition.count} otorgados
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{recognition.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Salud del Sistema de Reconocimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <div className="text-sm text-green-700">Sistema Operativo</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">23.5%</div>
                <div className="text-sm text-blue-700">Crecimiento Anual</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-purple-700">
                  Satisfacción Global
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ReconocimientosMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ReconocimientosMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
