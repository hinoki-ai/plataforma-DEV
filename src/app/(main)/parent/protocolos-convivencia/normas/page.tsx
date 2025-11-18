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
  CheckCircle,
  Heart,
  AlertCircle,
  FileText,
  Download,
  MessageCircle,
} from "lucide-react";

function NormasParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const normasByCategory = {
    valores: [
      {
        title: "Respeto Mutuo",
        description:
          "Tratar a todos los miembros de la comunidad con respeto y cortesía",
        examples: [
          "Saludar a profesores y compañeros",
          "Escuchar atentamente",
          "Usar un lenguaje apropiado",
        ],
        importance: "high",
      },
      {
        title: "Honestidad",
        description:
          "Actuar con sinceridad y responsabilidad en todas las situaciones",
        examples: [
          "Decir la verdad",
          "Reconocer errores",
          "Cumplir compromisos",
        ],
        importance: "high",
      },
    ],
    disciplina: [
      {
        title: "Puntualidad",
        description: "Asistir a clases y actividades en el horario establecido",
        examples: [
          "Llegar antes del inicio de clases",
          "No abandonar temprano sin autorización",
          "Asistir a todas las actividades programadas",
        ],
        importance: "high",
      },
      {
        title: "Presentación Personal",
        description: "Mantener una higiene y presentación adecuada",
        examples: [
          "Usar uniforme completo",
          "Mantener cabello y uñas limpios",
          "Cuidar el material escolar",
        ],
        importance: "medium",
      },
    ],
    participacion: [
      {
        title: "Participación Activa",
        description: "Contribuir activamente en las actividades de aprendizaje",
        examples: [
          "Participar en clases",
          "Completar tareas",
          "Colaborar en trabajos grupales",
        ],
        importance: "high",
      },
      {
        title: "Cuidado del Entorno",
        description: "Mantener limpio y ordenado el establecimiento",
        examples: [
          "No tirar papeles al piso",
          "Usar basureros",
          "Cuidar las instalaciones",
        ],
        importance: "medium",
      },
    ],
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "high":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Muy Importante
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Importante
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Recomendado
          </Badge>
        );
      default:
        return <Badge variant="secondary">Importante</Badge>;
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      valores: "Valores Fundamentales",
      disciplina: "Normas de Disciplina",
      participacion: "Participación y Responsabilidad",
    };
    return titles[category as keyof typeof titles] || category;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "valores":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "disciplina":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "participacion":
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_convivencia.normas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Normas y reglas que promueven una convivencia sana y respetuosa
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Descargar Reglamento
            </Button>
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Consultar con Colegio
            </Button>
          </div>
        </div>

        {/* Parent Guide */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Guía para Apoderados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Como apoderado, tu rol es fundamental en el cumplimiento de estas
              normas. Te invitamos a:
            </p>
            <ul className="text-blue-700 space-y-2">
              <li>• Reforzar estas normas en el hogar</li>
              <li>• Mantener comunicación constante con los profesores</li>
              <li>• Participar activamente en la formación de tu hijo/a</li>
              <li>• Colaborar con el establecimiento educativo</li>
            </ul>
          </CardContent>
        </Card>

        {/* Norms by Category */}
        {Object.entries(normasByCategory).map(([category, normas]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getCategoryIcon(category)}
                <span className="ml-2">{getCategoryTitle(category)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {normas.map((norma, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{norma.title}</h4>
                      {getImportanceBadge(norma.importance)}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {norma.description}
                    </p>
                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        Ejemplos de aplicación:
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {norma.examples.map((example, i) => (
                          <li key={i}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <FileText className="w-5 h-5 mb-1" />
                <span className="text-sm">Reglamento Completo</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <MessageCircle className="w-5 h-5 mb-1" />
                <span className="text-sm">Preguntas Frecuentes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function NormasParentPage() {
  return (
    <ErrorBoundary fallback={<div>Error al cargar la página de normas</div>}>
      <Suspense fallback={<LoadingState />}>
        <NormasParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
