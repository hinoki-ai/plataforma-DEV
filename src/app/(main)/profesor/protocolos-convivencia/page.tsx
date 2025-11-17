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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Shield,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

function ProtocolosConvivenciaContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const subcategories = [
    {
      title: t("nav.protocolos_convivencia.normas", "navigation"),
      description: "Normas y reglas de convivencia escolar",
      href: "/profesor/protocolos-convivencia/normas",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: t("nav.protocolos_convivencia.disciplina", "navigation"),
      description: "Protocolos para el manejo de la disciplina",
      href: "/profesor/protocolos-convivencia/disciplina",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      title: t("nav.protocolos_convivencia.medidas", "navigation"),
      description: "Medidas correctivas y sanciones",
      href: "/profesor/protocolos-convivencia/medidas",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
    {
      title: t("nav.protocolos_convivencia.reconocimientos", "navigation"),
      description: "Sistema de reconocimientos y premios",
      href: "/profesor/protocolos-convivencia/reconocimientos",
      icon: Award,
      color: "bg-green-500",
    },
    {
      title: t("nav.protocolos_convivencia.actas_apoderados", "navigation"),
      description: "Actas de entrevistas con apoderados",
      href: "/profesor/protocolos-convivencia/actas-apoderados",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: t("nav.protocolos_convivencia.actas_alumnos", "navigation"),
      description: "Actas de entrevistas con alumnos",
      href: "/profesor/protocolos-convivencia/actas-alumnos",
      icon: FileText,
      color: "bg-indigo-500",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("nav.protocolos_convivencia", "navigation")}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestión integral de los protocolos de convivencia escolar
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Académico
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((category, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                <Button asChild className="w-full">
                  <Link href={category.href}>
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Protocolo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Objetivo</h4>
                <p className="text-sm text-muted-foreground">
                  Establecer un marco claro de convivencia que promueva el
                  respeto, la responsabilidad y el desarrollo integral de los
                  estudiantes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Alcance</h4>
                <p className="text-sm text-muted-foreground">
                  Aplicable a todos los miembros de la comunidad educativa:
                  estudiantes, profesores, personal administrativo y apoderados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ProtocolosConvivenciaPage() {
  return (
    <ErrorBoundary
      fallback={
        <div>Error al cargar la página de protocolos de convivencia</div>
      }
    >
      <Suspense fallback={<LoadingState />}>
        <ProtocolosConvivenciaContent />
      </Suspense>
    </ErrorBoundary>
  );
}
