"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Award, AlertTriangle, Users, BookOpen, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";

function ProtocolosComportamientoParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const subcategories = [
    {
      title: t("nav.protocolos_comportamiento.normas", "navigation"),
      description: "Conoce las normas y reglas que rigen la convivencia escolar",
      href: "/parent/protocolos-comportamiento/normas",
      icon: Users,
      color: "bg-blue-500",
      importance: "Fundamental",
    },
    {
      title: t("nav.protocolos_comportamiento.disciplina", "navigation"),
      description: "Información sobre procedimientos disciplinarios y protocolos",
      href: "/parent/protocolos-comportamiento/disciplina",
      icon: Shield,
      color: "bg-red-500",
      importance: "Importante",
    },
    {
      title: t("nav.protocolos_comportamiento.medidas", "navigation"),
      description: "Medidas correctivas aplicables y criterios de aplicación",
      href: "/parent/protocolos-comportamiento/medidas",
      icon: AlertTriangle,
      color: "bg-orange-500",
      importance: "Referencial",
    },
    {
      title: t("nav.protocolos_comportamiento.reconocimientos", "navigation"),
      description: "Sistema de reconocimientos y premios por buen comportamiento",
      href: "/parent/protocolos-comportamiento/reconocimientos",
      icon: Award,
      color: "bg-green-500",
      importance: "Motivacional",
    },
  ];

  const quickActions = [
    {
      title: "Mi Hijo/a",
      description: "Ver situación disciplinaria de tu hijo/a",
      icon: Eye,
      href: "/parent/estudiantes",
    },
    {
      title: "Comunicarme",
      description: "Contactar con profesores o inspectoria",
      icon: MessageCircle,
      href: "/parent/comunicacion",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_comportamiento", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Información sobre las normas de comportamiento y convivencia escolar
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Académico
          </Badge>
        </div>

        {/* Important Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Información Importante para Apoderados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Como apoderado, es fundamental que conozcas las normas de comportamiento que rigen
              el establecimiento educativo. Esta información te ayudará a apoyar el desarrollo
              integral de tu hijo/a y mantener una comunicación efectiva con el colegio.
            </p>
          </CardContent>
        </Card>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subcategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <Badge variant="outline" className="w-fit">
                  {category.importance}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                <Button asChild className="w-full">
                  <Link href={category.href}>
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Información
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a información relevante sobre tu hijo/a
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button key={index} variant="outline" className="h-20 flex-col" asChild>
                  <Link href={action.href}>
                    <action.icon className="w-6 h-6 mb-2" />
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>¿Necesitas Ayuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Contacto Directo</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Si tienes dudas sobre algún protocolo o situación específica:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Inspectoría General: inspectoria@colegio.cl</li>
                  <li>• Jefe/a de UTP de tu hijo/a</li>
                  <li>• Orientador/a del establecimiento</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Horarios de Atención</h4>
                <p className="text-sm text-muted-foreground">
                  Puedes contactar al establecimiento de lunes a viernes
                  de 8:00 a 17:00 horas para consultas relacionadas con
                  temas disciplinarios o de comportamiento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ProtocolosComportamientoParentPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de protocolos de comportamiento</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <ProtocolosComportamientoParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
