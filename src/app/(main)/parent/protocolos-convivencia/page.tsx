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
  FileText,
  Shield,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  Eye,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

function ProtocolosComportamientoParentContent() {
  const { t } = useDivineParsing(["navigation", "common"]);

  const subcategories = [
    {
      title: t("nav.protocolos_comportamiento.normas", "navigation"),
      description:
        "Conoce las normas y reglas que rigen la convivencia escolar",
      href: "/parent/protocolos-comportamiento/normas",
      icon: Users,
      color: "bg-blue-500",
      importance: "Fundamental",
    },
    {
      title: t("nav.protocolos_comportamiento.disciplina", "navigation"),
      description:
        "Información sobre procedimientos disciplinarios y protocolos",
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
      description:
        "Sistema de reconocimientos y premios por buen comportamiento",
      href: "/parent/protocolos-comportamiento/reconocimientos",
      icon: Award,
      color: "bg-green-500",
      importance: "Motivacional",
    },
  ];

  const quickActions = [
    {
      title: t("parent.protocols.my_child"),
      description: t("parent.protocols.my_child_desc"),
      icon: Eye,
      href: "/parent/estudiantes",
    },
    {
      title: t("parent.protocols.communicate"),
      description: t("parent.protocols.communicate_desc"),
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
              {t("parent.protocols.page_description")}
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <BookOpen className="w-4 h-4 mr-2" />
            {t("parent.protocols.academic")}
          </Badge>
        </div>

        {/* Important Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              {t("parent.protocols.important_info")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              {t("parent.protocols.important_info_desc")}
            </p>
          </CardContent>
        </Card>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Badge variant="outline" className="w-fit">
                  {category.importance === "Fundamental" ? t("parent.protocols.fundamental") :
                   category.importance === "Importante" ? t("parent.protocols.important") :
                   category.importance === "Referencial" ? t("parent.protocols.referential") :
                   t("parent.protocols.motivational")}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                <Button asChild className="w-full">
                  <Link href={category.href}>
                    <FileText className="w-4 h-4 mr-2" />
                    {t("parent.protocols.view_info")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("parent.protocols.quick_actions")}</CardTitle>
            <CardDescription>
              {t("parent.protocols.quick_actions_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="w-6 h-6 mb-2" />
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
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
            <CardTitle>{t("parent.protocols.need_help")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">{t("parent.protocols.direct_contact")}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("parent.protocols.direct_contact_desc")}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("parent.protocols.inspector_email")}</li>
                  <li>• {t("parent.protocols.utp_chief")}</li>
                  <li>• {t("parent.protocols.orientator")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t("parent.protocols.attention_hours")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("parent.protocols.attention_hours_desc")}
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
      fallback={
        <div>Error loading behavior protocols page</div>
      }
    >
      <Suspense fallback={<LoadingState />}>
        <ProtocolosComportamientoParentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
