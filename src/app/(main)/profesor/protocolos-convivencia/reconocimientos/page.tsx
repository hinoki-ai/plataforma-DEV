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
  Award,
  Star,
  Trophy,
  Heart,
  Users,
  FileText,
  Calendar,
} from "lucide-react";

function ReconocimientosContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const reconocimientos = [
    {
      title: "Estudiante del Mes",
      description: "Reconocimiento mensual al estudiante destacado",
      criteria: [
        "Excelencia académica",
        "Comportamiento ejemplar",
        "Participación activa",
      ],
      benefits: ["Diploma", "Mención en asamblea", "Prioridad en actividades"],
      frequency: "Mensual",
      category: "individual",
    },
    {
      title: "Equipo Solidario",
      description: "Reconocimiento a grupos que demuestran solidaridad",
      criteria: [
        "Ayuda a compañeros",
        "Trabajo colaborativo",
        "Iniciativas solidarias",
      ],
      benefits: [
        "Certificado grupal",
        "Sesión recreativa",
        "Puntos para curso",
      ],
      frequency: "Trimestral",
      category: "group",
    },
    {
      title: "Ciudadano Ejemplar",
      description: "Premio al comportamiento cívico excepcional",
      criteria: ["Respeto a normas", "Cuidado del entorno", "Actitud positiva"],
      benefits: [
        "Medalla especial",
        "Privilegios en biblioteca",
        "Carta de recomendación",
      ],
      frequency: "Anual",
      category: "individual",
    },
    {
      title: "Proyecto Innovador",
      description: "Reconocimiento a proyectos creativos y originales",
      criteria: ["Creatividad", "Impacto positivo", "Trabajo en equipo"],
      benefits: [
        "Presentación especial",
        "Recursos adicionales",
        "Difusión institucional",
      ],
      frequency: "Semestral",
      category: "project",
    },
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
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Individual
          </Badge>
        );
      case "group":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Grupal
          </Badge>
        );
      case "project":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Proyecto
          </Badge>
        );
      default:
        return <Badge variant="secondary">Individual</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground mt-2">
              Sistema de reconocimientos y premios por buen comportamiento
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Award className="w-4 h-4 mr-2" />
              {reconocimientos.length} Tipos de Reconocimiento
            </Badge>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Nuevo Reconocimiento
            </Button>
          </div>
        </div>

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
                <CardDescription>{reconocimiento.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      Criterios:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {reconocimiento.criteria.map((criterio, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {criterio}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      Beneficios:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {reconocimiento.benefits.map((benefit, i) => (
                        <li key={i}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Frecuencia: {reconocimiento.frequency}
                    </span>
                    <Button size="sm" variant="outline">
                      Ver Ganadores
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Sistema de Puntos y Reconocimientos
            </CardTitle>
            <CardDescription>
              Marco general para el reconocimiento del comportamiento positivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-green-500" />
                  Puntos por Categoría
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Académico:</span> 1-5 puntos
                  </li>
                  <li>
                    <span className="font-medium">Comportamiento:</span> 1-3
                    puntos
                  </li>
                  <li>
                    <span className="font-medium">Participación:</span> 1-2
                    puntos
                  </li>
                  <li>
                    <span className="font-medium">Solidaridad:</span> 2-4 puntos
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-blue-500" />
                  Umbrales de Reconocimiento
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Bronce:</span> 10-24 puntos
                  </li>
                  <li>
                    <span className="font-medium">Plata:</span> 25-49 puntos
                  </li>
                  <li>
                    <span className="font-medium">Oro:</span> 50-99 puntos
                  </li>
                  <li>
                    <span className="font-medium">Diamante:</span> 100+ puntos
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                  Ciclo de Evaluación
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Semanal: Reconocimientos menores</li>
                  <li>• Mensual: Resumen parcial</li>
                  <li>• Trimestral: Premiaciones</li>
                  <li>• Anual: Reconocimientos finales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ReconocimientosPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de reconocimientos</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <ReconocimientosContent />
      </Suspense>
    </ErrorBoundary>
  );
}
