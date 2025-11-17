"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Target, CheckCircle, MessageCircle } from "lucide-react";

function MedidasParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const medidas = [
    {
      title: "Amonestación Verbal",
      description: "Corrección inmediata en el momento de la falta",
      parental: "Información vía correo o llamada telefónica",
      purpose: "Corrección inmediata y educativa",
    },
    {
      title: "Amonestación Escrita",
      description: "Comunicación formal por escrito de la falta cometida",
      parental: "Citación formal para reunión con profesor/jefe UTP",
      purpose: "Registro formal y reflexión",
    },
    {
      title: "Trabajo de Reflexión",
      description: "Actividad escrita que promueve la reflexión sobre el comportamiento",
      parental: "Seguimiento del cumplimiento en el hogar",
      purpose: "Desarrollo de conciencia y responsabilidad",
    },
    {
      title: "Suspensión de Clases",
      description: "Separación temporal del estudiante del proceso educativo",
      parental: "Reunión obligatoria con inspectoría y apoderado",
      purpose: "Reflexión profunda y cambio de actitud",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_comportamiento.medidas", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Información sobre medidas correctivas y criterios de aplicación
            </p>
          </div>
          <Button>
            <MessageCircle className="w-4 h-4 mr-2" />
            Consultar Situación
          </Button>
        </div>

        {/* Parent Role */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Rol de los Apoderados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Tu participación es crucial para el éxito de cualquier medida correctiva:
            </p>
            <ul className="text-blue-700 space-y-2">
              <li>• Reforzar el aprendizaje en el hogar</li>
              <li>• Mantener comunicación abierta con tu hijo/a</li>
              <li>• Colaborar con el colegio en el proceso educativo</li>
              <li>• Participar activamente en reuniones cuando sea requerido</li>
            </ul>
          </CardContent>
        </Card>

        {/* Measures Information */}
        <div className="space-y-4">
          {medidas.map((medida, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-500" />
                  {medida.title}
                </CardTitle>
                <CardDescription>{medida.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Participación de Apoderados
                    </h4>
                    <p className="text-sm text-muted-foreground">{medida.parental}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Propósito Educativo
                    </h4>
                    <p className="text-sm text-muted-foreground">{medida.purpose}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Considerations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Consideraciones Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Principio de Proporcionalidad</h4>
                <p className="text-sm text-muted-foreground">
                  Las medidas se aplican considerando la gravedad de la falta, las circunstancias
                  y los antecedentes del estudiante.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Enfoque Educativo</h4>
                <p className="text-sm text-muted-foreground">
                  Todas las medidas buscan formar y educar, promoviendo el desarrollo integral
                  del estudiante y el aprendizaje de valores.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Participación Familiar</h4>
                <p className="text-sm text-muted-foreground">
                  La familia es parte fundamental del proceso educativo. Tu apoyo y colaboración
                  son esenciales para el éxito de las medidas aplicadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function MedidasParentPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <MedidasParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
