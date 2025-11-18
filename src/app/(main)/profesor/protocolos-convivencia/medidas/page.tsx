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
  AlertTriangle,
  Clock,
  Target,
  CheckCircle,
  FileText,
  Users,
} from "lucide-react";

function MedidasContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const medidas = [
    {
      title: "Amonestación Verbal",
      description: "Corrección inmediata en el momento de la falta",
      applicable: ["Faltas leves", "Comportamientos disruptivos menores"],
      duration: "Inmediata",
      responsible: "Profesor/a",
      followUp: "Registro en libro de clases",
      effectiveness: "high",
    },
    {
      title: "Amonestación Escrita",
      description: "Comunicación formal por escrito de la falta cometida",
      applicable: ["Faltas reiteradas", "Incumplimiento de normas"],
      duration: "1-2 días",
      responsible: "Jefe/a UTP",
      followUp: "Citación con apoderado",
      effectiveness: "high",
    },
    {
      title: "Trabajo de Reflexión",
      description: "Actividad escrita o práctica que promueva la reflexión",
      applicable: ["Faltas de respeto", "Comportamientos inadecuados"],
      duration: "1 semana",
      responsible: "Profesor/a asignado",
      followUp: "Entrega y evaluación",
      effectiveness: "medium",
    },
    {
      title: "Suspensión de Clases",
      description: "Separación temporal del estudiante del proceso educativo",
      applicable: ["Faltas graves", "Agresiones", "Daños"],
      duration: "1-5 días",
      responsible: "Inspectoría General",
      followUp: "Plan de reinserción",
      effectiveness: "medium",
    },
    {
      title: "Servicio Comunitario",
      description: "Trabajo voluntario en beneficio de la comunidad escolar",
      applicable: ["Daños a propiedad", "Faltas contra el entorno"],
      duration: "2-4 semanas",
      responsible: "Coordinador/a",
      followUp: "Informe de cumplimiento",
      effectiveness: "high",
    },
  ];

  const getEffectivenessBadge = (effectiveness: string) => {
    switch (effectiveness) {
      case "high":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Alta
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Media
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Baja
          </Badge>
        );
      default:
        return <Badge variant="secondary">Media</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_convivencia.medidas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Medidas correctivas y sanciones aplicables
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {medidas.length} Medidas Disponibles
            </Badge>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Aplicar Medida
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {medidas.map((medida, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-500" />
                    {medida.title}
                  </CardTitle>
                  {getEffectivenessBadge(medida.effectiveness)}
                </div>
                <CardDescription>{medida.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Aplicables a:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {medida.applicable.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Duración:
                      </span>
                      <p className="text-muted-foreground">{medida.duration}</p>
                    </div>
                    <div>
                      <span className="font-semibold flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Responsable:
                      </span>
                      <p className="text-muted-foreground">
                        {medida.responsible}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Seguimiento:
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {medida.followUp}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Criterios para la Aplicación de Medidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800">
                  Proporcionalidad
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  La medida debe corresponder a la gravedad de la falta
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800">Educativa</div>
                <p className="text-sm text-green-600 mt-1">
                  Buscar el aprendizaje y no solo el castigo
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-800">Oportunidad</div>
                <p className="text-sm text-purple-600 mt-1">
                  Aplicar en tiempo oportuno y efectivo
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="font-semibold text-orange-800">Registro</div>
                <p className="text-sm text-orange-600 mt-1">
                  Documentar todas las medidas aplicadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function MedidasPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de medidas correctivas</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <MedidasContent />
      </Suspense>
    </ErrorBoundary>
  );
}
