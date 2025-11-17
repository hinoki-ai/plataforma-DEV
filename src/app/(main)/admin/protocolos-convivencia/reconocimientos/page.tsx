"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Star, Trophy, Heart, Users, FileText, Plus, Calendar, TrendingUp } from "lucide-react";

function ReconocimientosAdminContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const reconocimientos = [
    {
      title: "Estudiante del Mes",
      awarded: 12,
      trend: "+15%",
      category: "individual",
      nextAward: "2024-12-01",
    },
    {
      title: "Equipo Solidario",
      awarded: 8,
      trend: "+25%",
      category: "group",
      nextAward: "2024-11-30",
    },
    {
      title: "Ciudadano Ejemplar",
      awarded: 6,
      trend: "+10%",
      category: "individual",
      nextAward: "2024-12-15",
    },
    {
      title: "Proyecto Innovador",
      awarded: 3,
      trend: "0%",
      category: "project",
      nextAward: "2025-01-15",
    },
  ];

  const recentAwards = [
    { recipient: "Ana García", type: "Estudiante del Mes", date: "2024-11-15", category: "individual" },
    { recipient: "Curso 8°A", type: "Equipo Solidario", date: "2024-11-10", category: "group" },
    { recipient: "Proyecto Reciclaje", type: "Proyecto Innovador", date: "2024-11-08", category: "project" },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "individual":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "group":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "project":
        return <Trophy className="w-5 h-5 text-purple-500" />;
      default:
        return <Award className="w-5 h-5 text-green-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "individual":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Individual</Badge>;
      case "group":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Grupal</Badge>;
      case "project":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Proyecto</Badge>;
      default:
        return <Badge variant="secondary">Individual</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de {t("nav.protocolos_comportamiento.reconocimientos", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Administración del sistema de reconocimientos y premios
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Award className="w-4 h-4 mr-2" />
              {reconocimientos.reduce((sum, r) => sum + r.awarded, 0)} Reconocimientos
            </Badge>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Reconocimiento
            </Button>
          </div>
        </div>

        {/* Recognition Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reconocimientos.map((reconocimiento, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getCategoryIcon(reconocimiento.category)}
                    <span className="ml-2">{reconocimiento.title}</span>
                  </CardTitle>
                  {getCategoryBadge(reconocimiento.category)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{reconocimiento.awarded}</p>
                    <p className="text-sm text-muted-foreground">Otorgados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {reconocimiento.trend}
                    </p>
                    <p className="text-sm text-muted-foreground">Tendencia</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{reconocimiento.nextAward}</p>
                    <p className="text-sm text-muted-foreground">Próximo</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Este año</span>
                  <Button size="sm" variant="outline">
                    Gestionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Awards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Reconocimientos Recientes
            </CardTitle>
            <CardDescription>
              Últimos reconocimientos otorgados en el establecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAwards.map((award, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(award.category)}
                    <div>
                      <p className="font-medium">{award.recipient}</p>
                      <p className="text-sm text-muted-foreground">{award.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{award.date}</p>
                      {getCategoryBadge(award.category)}
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

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Award className="w-6 h-6 mb-2" />
            Otorgar Reconocimiento
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="w-6 h-6 mb-2" />
            Programar Eventos
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <TrendingUp className="w-6 h-6 mb-2" />
            Ver Estadísticas
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <FileText className="w-6 h-6 mb-2" />
            Generar Certificados
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

export default function ReconocimientosAdminPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de gestión de reconocimientos</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <ReconocimientosAdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
