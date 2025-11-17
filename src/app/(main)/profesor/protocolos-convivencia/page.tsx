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
  const { t } = useDivineParsing(["navigation", "common", "profesor"]);

  const { t: tp } = useDivineParsing(["profesor"]);

  const subcategories = [
    {
      title: t("nav.protocolos_convivencia.normas", "navigation"),
      description: tp("profesor.protocolos.normas.description"),
      href: "/profesor/protocolos-convivencia/normas",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: t("nav.protocolos_convivencia.disciplina", "navigation"),
      description: tp("profesor.protocolos.disciplina.description"),
      href: "/profesor/protocolos-convivencia/disciplina",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      title: t("nav.protocolos_convivencia.medidas", "navigation"),
      description: tp("profesor.protocolos.medidas.description"),
      href: "/profesor/protocolos-convivencia/medidas",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
    {
      title: t("nav.protocolos_convivencia.reconocimientos", "navigation"),
      description: tp("profesor.protocolos.reconocimientos.description"),
      href: "/profesor/protocolos-convivencia/reconocimientos",
      icon: Award,
      color: "bg-green-500",
    },
    {
      title: t("nav.protocolos_convivencia.actas_apoderados", "navigation"),
      description: tp("profesor.protocolos.actas_apoderados.description"),
      href: "/profesor/protocolos-convivencia/actas-apoderados",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: t("nav.protocolos_convivencia.actas_alumnos", "navigation"),
      description: tp("profesor.protocolos.actas_alumnos.description"),
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
              {t("profesor.protocolos.description", "profesor")}
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <BookOpen className="w-4 h-4 mr-2" />
            {t("profesor.protocolos.badge", "profesor")}
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
                    {t("profesor.protocolos.view_protocol", "profesor")}
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
              {t("profesor.protocolos.general_info", "profesor")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">
                  {t("profesor.protocolos.objective", "profesor")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("profesor.protocolos.objective_text", "profesor")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  {t("profesor.protocolos.scope", "profesor")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("profesor.protocolos.scope_text", "profesor")}
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
