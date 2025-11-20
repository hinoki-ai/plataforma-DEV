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
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

function NormasContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const normas = [
    {
      title: "Respeto Mutuo",
      description:
        "Tratar a todos los miembros de la comunidad con respeto y cortesía",
      status: "active",
      category: "Valores",
    },
    {
      title: "Puntualidad",
      description: "Asistir a clases y actividades en el horario establecido",
      status: "active",
      category: "Disciplina",
    },
    {
      title: "Participación Activa",
      description: "Contribuir activamente en las actividades de aprendizaje",
      status: "active",
      category: "Aprendizaje",
    },
    {
      title: "Cuidado del Medio Ambiente",
      description: "Mantener limpio el establecimiento y sus alrededores",
      status: "active",
      category: "Responsabilidad",
    },
    {
      title: "Uso Apropiado de Tecnología",
      description:
        "Utilizar dispositivos tecnológicos de manera responsable y educativa",
      status: "review",
      category: "Tecnología",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "review":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Activa
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Inactiva
          </Badge>
        );
      case "review":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            En Revisión
          </Badge>
        );
      default:
        return <Badge variant="secondary">Activa</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground mt-2">
              Normas y reglas de convivencia escolar
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Users className="w-4 h-4 mr-2" />
              {normas.filter((n) => n.status === "active").length} Activas
            </Badge>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Editar Normas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {normas.map((norma, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(norma.status)}
                    <span className="ml-2">{norma.title}</span>
                  </CardTitle>
                  {getStatusBadge(norma.status)}
                </div>
                <Badge variant="outline" className="w-fit">
                  {norma.category}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {norma.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marco General de Convivencia</CardTitle>
            <CardDescription>
              Principios fundamentales que rigen la convivencia en el
              establecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Principios Básicos</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Respeto a la dignidad de las personas</li>
                  <li>• Igualdad de oportunidades</li>
                  <li>• Participación democrática</li>
                  <li>• Responsabilidad individual y colectiva</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">
                  Derechos de los Estudiantes
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Derecho a la educación</li>
                  <li>• Derecho a la expresión</li>
                  <li>• Derecho a la participación</li>
                  <li>• Derecho a la seguridad</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function NormasPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de normas de convivencia</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <NormasContent />
      </Suspense>
    </ErrorBoundary>
  );
}
