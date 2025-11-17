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
  Users,
  Globe,
  Database,
  Settings,
  BarChart3,
  RefreshCw as Sync,
} from "lucide-react";

function NormasMasterContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const globalNormsStats = {
    totalNorms: 145,
    institutions: 12,
    compliance: 87.3,
    lastSync: "2024-11-15 14:30",
  };

  const institutions = [
    { name: "Colegio San José", norms: 45, compliance: 92, status: "optimal" },
    { name: "Liceo Nacional", norms: 38, compliance: 85, status: "good" },
    {
      name: "Escuela República",
      norms: 42,
      compliance: 78,
      status: "needs_attention",
    },
    { name: "Instituto Técnico", norms: 20, compliance: 95, status: "optimal" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Control Maestro -{" "}
              {t("nav.protocolos_comportamiento.normas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestión global de normas de comportamiento en todas las
              instituciones
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <Sync className="w-4 h-4 mr-2" />
              Última sync: {globalNormsStats.lastSync}
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
                    Normas Totales
                  </p>
                  <p className="text-2xl font-bold">
                    {globalNormsStats.totalNorms}
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
                    {globalNormsStats.institutions}
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
                    Cumplimiento Global
                  </p>
                  <p className="text-2xl font-bold">
                    {globalNormsStats.compliance}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Sync className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado del Sistema
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Sincronizado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institutions Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Estado por Institución</CardTitle>
            <CardDescription>
              Monitoreo del cumplimiento de normas en cada institución educativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutions.map((institution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{institution.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {institution.norms} normas activas
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {institution.compliance}% cumplimiento
                      </p>
                      <Badge
                        variant={
                          institution.status === "optimal"
                            ? "secondary"
                            : institution.status === "good"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {institution.status === "optimal"
                          ? "Óptimo"
                          : institution.status === "good"
                            ? "Bueno"
                            : "Requiere Atención"}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Gestionar
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
                <Sync className="w-6 h-6 mb-2" />
                <span className="text-sm">Sincronización Global</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Database className="w-6 h-6 mb-2" />
                <span className="text-sm">Backup de Normas</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Analytics Global</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="w-6 h-6 mb-2" />
                <span className="text-sm">Configuración Avanzada</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function NormasMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <NormasMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
