"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Heart } from "lucide-react";

function ActasAlumnosParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_convivencia.actas_alumnos", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Información sobre entrevistas realizadas con estudiantes
            </p>
          </div>
          <Button>
            <Heart className="w-4 h-4 mr-2" />
            Apoyar a Mi Hijo/a
          </Button>
        </div>

        {/* Parent Guidance */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Apoyo a su Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Las entrevistas con estudiantes son parte del proceso de acompañamiento y desarrollo
              integral. Como apoderado, su rol es fundamental para apoyar el crecimiento de su hijo/a.
            </p>
            <ul className="text-green-700 space-y-2">
              <li>• Mantenga una comunicación abierta con su hijo/a</li>
              <li>• Colabore con las orientaciones del colegio</li>
              <li>• Participe activamente en el proceso educativo</li>
              <li>• Refuerce los valores positivos en el hogar</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>¿Cuándo se Realizan Entrevistas?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Entrevistas de Orientación</h4>
                <p className="text-sm text-muted-foreground">
                  Se realizan para apoyar el desarrollo académico, personal y social del estudiante.
                  Participan psicólogos, orientadores y profesores.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Entrevistas Disciplinarias</h4>
                <p className="text-sm text-muted-foreground">
                  Se llevan a cabo cuando existen situaciones que requieren intervención específica,
                  siempre buscando el bienestar del estudiante.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Entrevistas de Seguimiento</h4>
                <p className="text-sm text-muted-foreground">
                  Permiten evaluar el progreso y efectividad de las medidas implementadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos de Apoyo</CardTitle>
            <CardDescription>
              Recursos disponibles para apoyar el desarrollo de su hijo/a
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Plan de Orientación Escolar</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Estrategias para apoyar el desarrollo integral de los estudiantes.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Plan de Formación Ciudadana</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Desarrollo de valores y habilidades sociales.
                </p>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ActasAlumnosParentPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ActasAlumnosParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
