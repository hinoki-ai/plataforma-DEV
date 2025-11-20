"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
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
import { FileText, Database, Globe, BarChart3, Settings } from "lucide-react";

function ActasAlumnosMasterContent() {
  const globalStats = {
    totalActas: 2156,
    institutions: 12,
    averagePerInstitution: 179.7,
    complianceRate: 91.8,
  };

  const institutionStats = [
    { name: "Colegio San José", actas: 234, compliance: 96, trend: "+18%" },
    { name: "Liceo Nacional", actas: 198, compliance: 93, trend: "+12%" },
    { name: "Escuela República", actas: 167, compliance: 87, trend: "+22%" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Control Maestro - English Title
            </h1>
            <p className="text-muted-foreground mt-2">
              Supervisión global de actas de entrevistas con alumnos en todas
              las instituciones
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <Globe className="w-4 h-4 mr-2" />
              Sistema Global
            </Badge>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configuración Global
            </Button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Actas
                  </p>
                  <p className="text-2xl font-bold">
                    {globalStats.totalActas.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Instituciones
                  </p>
                  <p className="text-2xl font-bold">
                    {globalStats.institutions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Promedio por Inst.
                  </p>
                  <p className="text-2xl font-bold">
                    {globalStats.averagePerInstitution}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tasa de Cumplimiento
                  </p>
                  <p className="text-2xl font-bold">
                    {globalStats.complianceRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institution Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Institución</CardTitle>
            <CardDescription>
              Estado de las actas de entrevistas con alumnos en cada institución
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutionStats.map((institution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{institution.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {institution.actas} actas registradas
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {institution.compliance}% cumplimiento
                      </p>
                      <Badge variant="outline">{institution.trend}</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Master Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controles Maestros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Database className="w-6 h-6 mb-2" />
                <span className="text-sm">Sincronización Global</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Analytics Avanzado</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="w-6 h-6 mb-2" />
                <span className="text-sm">Políticas Globales</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Globe className="w-6 h-6 mb-2" />
                <span className="text-sm">Auditoría Global</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ActasAlumnosMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ActasAlumnosMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
