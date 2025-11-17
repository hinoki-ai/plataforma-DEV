"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, Search, Filter } from "lucide-react";

function ActasAlumnosAdminContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const actasStats = {
    total: 267,
    thisMonth: 34,
    pendingReview: 12,
    approved: 255,
  };

  const recentActas = [
    { id: 1, student: "María González", grade: "8° Básico", interviewer: "Psicólogo", date: "2024-11-15", status: "approved" },
    { id: 2, student: "Carlos Rodríguez", grade: "7° Básico", interviewer: "Inspector", date: "2024-11-14", status: "pending" },
    { id: 3, student: "Pedro Martínez", grade: "9° Básico", interviewer: "Orientadora", date: "2024-11-13", status: "approved" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de {t("nav.protocolos_convivencia.actas_alumnos", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Panel administrativo para gestión de actas de entrevistas con alumnos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              {actasStats.total} Actas Totales
            </Badge>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Subir Nueva Acta
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Actas</p>
                  <p className="text-2xl font-bold">{actasStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Upload className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                  <p className="text-2xl font-bold">{actasStats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold">{actasStats.pendingReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Aprobadas</p>
                  <p className="text-2xl font-bold">{actasStats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por estudiante, curso o entrevistador..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Actas */}
        <Card>
          <CardHeader>
            <CardTitle>Actas Recientes</CardTitle>
            <CardDescription>
              Últimas actas de entrevistas con alumnos registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActas.map((acta) => (
                <div key={acta.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{acta.student}</p>
                    <p className="text-sm text-muted-foreground">Curso: {acta.grade} • Entrevistador: {acta.interviewer} • {acta.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={acta.status === 'approved' ? 'secondary' : 'outline'}>
                      {acta.status === 'approved' ? 'Aprobada' : 'Pendiente'}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Institutional Documents Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Institucionales Vinculados</CardTitle>
            <CardDescription>
              Documentos del listado institucional relacionados con seguimientos estudiantiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">#50 Documentos PIE</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Programas de Integración Escolar con actas y evaluaciones.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">#52 Fichas de Derivación Psicosocial</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Registro de derivaciones y seguimientos psicosociales.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">#53 Informes de Seguimiento Individual</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Documentación detallada del seguimiento de estudiantes.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ActasAlumnosAdminPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ActasAlumnosAdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
