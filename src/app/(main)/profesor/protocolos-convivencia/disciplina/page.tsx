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
  Shield,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  Eye,
} from "lucide-react";

function DisciplinaContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const protocolos = [
    {
      title: "Faltas Leves",
      description:
        "Amonestaciones verbales y escritas por incumplimiento de normas básicas",
      examples: [
        "Llegada tarde",
        "Falta de material",
        "Comportamiento disruptivo",
      ],
      measures: [
        "Amonestación verbal",
        "Registro en libro de clases",
        "Citación con apoderado",
      ],
      severity: "low",
    },
    {
      title: "Faltas Graves",
      description:
        "Incumplimientos que afectan significativamente el proceso educativo",
      examples: ["Agresiones físicas", "Daño a propiedad", "Faltas reiteradas"],
      measures: [
        "Suspensión temporal",
        "Reunión disciplinaria",
        "Plan de corrección",
      ],
      severity: "high",
    },
    {
      title: "Faltas Muy Graves",
      description:
        "Conductas que ponen en riesgo la integridad de la comunidad educativa",
      examples: [
        "Violencia extrema",
        "Consumo de sustancias",
        "Acoso sistemático",
      ],
      measures: [
        "Expulsión temporal",
        "Consejo de profesores",
        "Intervención especializada",
      ],
      severity: "critical",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Leve
          </Badge>
        );
      case "high":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Grave
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Muy Grave
          </Badge>
        );
      default:
        return <Badge variant="secondary">Leve</Badge>;
    }
  };

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_comportamiento.disciplina", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Protocolos para el manejo de la disciplina y faltas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Sistema Disciplinario
            </Badge>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Gestionar Casos
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {protocolos.map((protocolo, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-red-500" />
                    {protocolo.title}
                  </CardTitle>
                  {getSeverityBadge(protocolo.severity)}
                </div>
                <CardDescription className="text-base">
                  {protocolo.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Ejemplos de Faltas
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {protocolo.examples.map((example, i) => (
                        <li key={i}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Medidas a Aplicar
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {protocolo.measures.map((measure, i) => (
                        <li key={i}>• {measure}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Responsables
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Profesor/a a cargo</li>
                      <li>• Jefe/a de UTP</li>
                      <li>• Inspectoría General</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Procedimiento General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Registro de la Falta</h4>
                  <p className="text-sm text-muted-foreground">
                    Documentar detalladamente el incidente, incluyendo fecha,
                    hora, involucrados y testigos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Aplicación de Medidas</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementar las medidas correspondientes según la gravedad
                    de la falta.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Seguimiento</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitorear el cumplimiento de las medidas y evaluar la
                    efectividad del proceso.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function DisciplinaPage() {
  return (
    <ErrorBoundary
      fallback={
        <div>Error al cargar la página de protocolos de disciplina</div>
      }
    >
      <Suspense fallback={<LoadingState />}>
        <DisciplinaContent />
      </Suspense>
    </ErrorBoundary>
  );
}
