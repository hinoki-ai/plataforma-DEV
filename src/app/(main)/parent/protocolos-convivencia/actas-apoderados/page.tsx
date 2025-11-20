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
import { FileText, Download, Eye, MessageCircle } from "lucide-react";

function ActasApoderadosParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const myInterviews = [
    {
      id: 1,
      student: "Mi Hijo/a",
      date: "2024-11-15",
      type: "Entrevista Inicial",
      reason: "Comportamiento disruptivo en clases",
      status: "completado",
    },
    {
      id: 2,
      student: "Mi Hijo/a",
      date: "2024-10-20",
      type: "Seguimiento",
      reason: "Revisión de medidas correctivas",
      status: "completado",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground mt-2">
              Acceso a las actas de entrevistas realizadas con apoderados
            </p>
          </div>
          <Button>
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar Colegio
          </Button>
        </div>

        {/* Important Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Información sobre Actas de Entrevistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Las actas de entrevistas documentan las conversaciones mantenidas
              entre el colegio y los apoderados. Estas actas son confidenciales
              y solo pueden ser accedidas por las partes involucradas según las
              normativas de protección de datos.
            </p>
          </CardContent>
        </Card>

        {/* My Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Entrevistas</CardTitle>
            <CardDescription>
              Actas de entrevistas en las que he participado como apoderado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{interview.student}</p>
                    <p className="text-sm text-muted-foreground">
                      {interview.type} • {interview.date}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Motivo: {interview.reason}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {interview.status === "completado"
                        ? "Completada"
                        : "Pendiente"}
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

        {/* Related Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Relacionados</CardTitle>
            <CardDescription>
              Documentos institucionales que complementan las actas de
              entrevistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">
                  Reglamento de Convivencia Escolar
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Marco normativo que regula la convivencia escolar.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">
                  Protocolos de Comunicación
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Guías para una comunicación efectiva con el colegio.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ActasApoderadosParentPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ActasApoderadosParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
