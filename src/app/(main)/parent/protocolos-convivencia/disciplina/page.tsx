"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Clock, Users, MessageCircle, Phone } from "lucide-react";

function DisciplinaParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const procedures = [
    {
      title: "Registro del Incidente",
      description: "Todo incidente es registrado detalladamente por el profesor o inspectoría",
      steps: ["Observación del comportamiento", "Registro escrito del hecho", "Información a las partes involucradas"],
    },
    {
      title: "Evaluación de la Situación",
      description: "Se evalúa la gravedad y las circunstancias del incidente",
      steps: ["Análisis de los hechos", "Consideración de antecedentes", "Determinación de la medida apropiada"],
    },
    {
      title: "Aplicación de Medidas",
      description: "Se implementa la medida correctiva correspondiente",
      steps: ["Comunicación de la medida", "Aplicación inmediata", "Registro de la acción tomada"],
    },
    {
      title: "Seguimiento y Evaluación",
      description: "Se monitorea el cumplimiento y efectividad de la medida",
      steps: ["Verificación del cumplimiento", "Evaluación de resultados", "Registro de lecciones aprendidas"],
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_comportamiento.disciplina", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Información sobre procedimientos disciplinarios y resolución de conflictos
            </p>
          </div>
          <Button>
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar Inspectoría
          </Button>
        </div>

        {/* Important Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Información para Apoderados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              Los procedimientos disciplinarios buscan formar y educar, no solo sancionar.
              La participación activa de los apoderados es fundamental para el éxito de estos procesos.
            </p>
          </CardContent>
        </Card>

        {/* Procedure Steps */}
        <div className="space-y-4">
          {procedures.map((procedure, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  {procedure.title}
                </CardTitle>
                <CardDescription>{procedure.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {procedure.steps.map((step, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Canales de Comunicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">En caso de emergencia</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Si se presenta una situación que requiera atención inmediata:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Llamar directamente al colegio</li>
                  <li>• Contactar al inspector de turno</li>
                  <li>• Comunicarse con la jefatura</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Comunicación regular</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Para consultas sobre procedimientos disciplinarios:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Correo electrónico institucional</li>
                  <li>• Reuniones de apoderados programadas</li>
                  <li>• Libro de clases digital</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function DisciplinaParentPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de protocolos de disciplina</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <DisciplinaParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
