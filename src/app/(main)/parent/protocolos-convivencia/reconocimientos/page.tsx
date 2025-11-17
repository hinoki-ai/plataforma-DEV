"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Star, Trophy, Heart, Users, Calendar, Eye } from "lucide-react";

function ReconocimientosParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const reconocimientos = [
    {
      title: "Estudiante del Mes",
      description: "Reconocimiento mensual al estudiante destacado en comportamiento y rendimiento",
      frequency: "Mensual",
      benefits: ["Diploma especial", "Mención en asamblea", "Privilegios en biblioteca"],
    },
    {
      title: "Equipo Solidario",
      description: "Premio a cursos que demuestran excelencia en trabajo colaborativo",
      frequency: "Trimestral",
      benefits: ["Actividad recreativa especial", "Certificado grupal", "Puntos para el curso"],
    },
    {
      title: "Ciudadano Ejemplar",
      description: "Reconocimiento al comportamiento cívico excepcional",
      frequency: "Semestral",
      benefits: ["Medalla especial", "Carta de recomendación", "Beneficios en evaluaciones"],
    },
  ];

  const upcomingEvents = [
    { name: "Estudiante del Mes - Noviembre", date: "2024-12-01", type: "individual" },
    { name: "Premio Equipo Solidario", date: "2024-12-15", type: "group" },
    { name: "Ceremonia Ciudadano Ejemplar", date: "2025-01-30", type: "individual" },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_comportamiento.reconocimientos", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Sistema de reconocimientos que motiva el buen comportamiento
            </p>
          </div>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            Ver Logros de Mi Hijo/a
          </Button>
        </div>

        {/* Parent Encouragement */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Apoya el Desarrollo de tu Hijo/a
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Los reconocimientos son una excelente oportunidad para celebrar los logros
              de tu hijo/a y motivarlo/a a mantener un comportamiento positivo:
            </p>
            <ul className="text-green-700 space-y-2">
              <li>• Celebra sus logros y esfuerzos</li>
              <li>• Refuerza los valores positivos en el hogar</li>
              <li>• Participa en las ceremonias de reconocimiento</li>
              <li>• Motiva el desarrollo de un carácter virtuoso</li>
            </ul>
          </CardContent>
        </Card>

        {/* Recognition Types */}
        <div className="space-y-4">
          {reconocimientos.map((reconocimiento, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  {reconocimiento.title}
                </CardTitle>
                <CardDescription>{reconocimiento.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Frecuencia
                    </h4>
                    <Badge variant="outline">{reconocimiento.frequency}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Beneficios
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {reconocimiento.benefits.map((benefit, i) => (
                        <li key={i}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Próximos Eventos de Reconocimiento
            </CardTitle>
            <CardDescription>
              Ceremonias y eventos programados para reconocer el buen comportamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {event.type === "individual" ? (
                      <Star className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Users className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {event.type === "individual" ? "Individual" : "Grupal"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Participate */}
        <Card>
          <CardHeader>
            <CardTitle>¿Cómo Participar?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Como Apoderado</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Asiste a las ceremonias de reconocimiento</li>
                  <li>• Refuerza los valores en el hogar</li>
                  <li>• Participa en reuniones de apoderados</li>
                  <li>• Colabora con el proyecto educativo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Apoyando a tu Hijo/a</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Celebra sus logros y esfuerzos</li>
                  <li>• Motiva el desarrollo de virtudes</li>
                  <li>• Participa en actividades escolares</li>
                  <li>• Mantén comunicación con profesores</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ReconocimientosParentPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ReconocimientosParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
