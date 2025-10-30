/**
 * 🎓 Level-Specific Dashboard Component
 * Dashboard that adapts content based on educational institution type
 */

"use client";

import React from "react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
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
  School,
  GraduationCap,
  BookOpen,
  Building2,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Clock,
  Trophy,
  Heart,
  Lightbulb,
  Target,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  shouldShowFeature,
} from "@/lib/educational-system";

interface LevelSpecificDashboardProps {
  currentType: EducationalInstitutionType;
  userRole: "ADMIN" | "MASTER" | "PROFESOR" | "PARENT";
}

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  change?: string;
  color: string;
  action?: {
    label: string;
    href: string;
  };
}

export function LevelSpecificDashboard({
  currentType,
  userRole,
}: LevelSpecificDashboardProps) {
  const { t } = useDivineParsing(["common"]);
  const currentInfo = INSTITUTION_TYPE_INFO[currentType];

  const getDashboardCards = (): DashboardCard[] => {
    const baseCards: DashboardCard[] = [
      {
        title: "Estudiantes Activos",
        description: "Total de estudiantes matriculados",
        icon: Users,
        value: "156",
        change: "+12%",
        color: "text-blue-600",
        action: { label: "Ver Lista", href: "/admin/estudiantes" },
      },
      {
        title: "Docentes",
        description: "Profesores y educadores",
        icon: GraduationCap,
        value: "18",
        change: "+2",
        color: "text-green-600",
        action: { label: "Gestionar", href: "/admin/docentes" },
      },
    ];

    // Educational level specific cards
    switch (currentType) {
      case "PRESCHOOL":
        baseCards.push(
          {
            title: "Niños NT1",
            description: "Pre-Kinder (4-5 años)",
            icon: Heart,
            value: "32",
            color: "text-pink-600",
            action: { label: "Ver Grupo", href: "/admin/nt1" },
          },
          {
            title: "Niños NT2",
            description: "Kinder (5-6 años)",
            icon: School,
            value: "28",
            color: "text-purple-600",
            action: { label: "Ver Grupo", href: "/admin/nt2" },
          },
          {
            title: "Actividades Lúdicas",
            description: "Juegos y aprendizaje",
            icon: Lightbulb,
            value: "45",
            change: "+8",
            color: "text-orange-600",
            action: { label: "Crear Nueva", href: "/admin/actividades" },
          },
          {
            title: "Desarrollo Integral",
            description: "Evaluaciones de desarrollo",
            icon: Target,
            value: "92%",
            change: "+5%",
            color: "text-emerald-600",
            action: { label: "Ver Reportes", href: "/admin/desarrollo" },
          },
        );
        break;

      case "BASIC_SCHOOL":
        baseCards.push(
          {
            title: "Promedio General",
            description: "Rendimiento académico",
            icon: BarChart3,
            value: "6.2",
            change: "+0.3",
            color: "text-blue-600",
            action: { label: "Ver Notas", href: "/admin/notas" },
          },
          {
            title: "Asignaturas",
            description: "Materias impartidas",
            icon: BookOpen,
            value: "10",
            color: "text-indigo-600",
            action: {
              label: "Planificaciones",
              href: "/admin/planificaciones",
            },
          },
          {
            title: "Reuniones Pendientes",
            description: "Con apoderados",
            icon: Calendar,
            value: "8",
            color: "text-amber-600",
            action: { label: "Programar", href: "/admin/reuniones" },
          },
          {
            title: "Proyectos Activos",
            description: "Investigación escolar",
            icon: FileText,
            value: "12",
            change: "+3",
            color: "text-teal-600",
            action: { label: "Gestionar", href: "/admin/proyectos" },
          },
        );
        break;

      case "HIGH_SCHOOL":
        baseCards.push(
          {
            title: "Estudiantes 4° Medio",
            description: "Próximos a egresar",
            icon: GraduationCap,
            value: "42",
            color: "text-purple-600",
            action: { label: "Seguimiento", href: "/admin/egreso" },
          },
          {
            title: "Orientación Vocacional",
            description: "Sesiones realizadas",
            icon: Target,
            value: "28",
            change: "+12",
            color: "text-green-600",
            action: { label: "Programar", href: "/admin/orientacion" },
          },
          {
            title: "Preparación PSU/PAES",
            description: "Estudiantes en programa",
            icon: Trophy,
            value: "89%",
            change: "+15%",
            color: "text-amber-600",
            action: { label: "Resultados", href: "/admin/psu-paes" },
          },
          {
            title: "Formación Técnica",
            description: "Especialidades TP",
            icon: Building2,
            value: "4",
            color: "text-cyan-600",
            action: {
              label: "Ver Especialidades",
              href: "/admin/tecnico-profesional",
            },
          },
        );
        break;

      case "UNIVERSITY":
        baseCards.push(
          {
            title: "Carreras Activas",
            description: "Programas académicos",
            icon: BookOpen,
            value: "12",
            color: "text-blue-600",
            action: { label: "Gestionar", href: "/admin/carreras" },
          },
          {
            title: "Investigaciones",
            description: "Proyectos en curso",
            icon: Lightbulb,
            value: "34",
            change: "+8",
            color: "text-purple-600",
            action: { label: "Ver Proyectos", href: "/admin/investigacion" },
          },
          {
            title: "Tesis Defendidas",
            description: "Este semestre",
            icon: Trophy,
            value: "18",
            change: "+6",
            color: "text-green-600",
            action: { label: "Calendario", href: "/admin/tesis" },
          },
          {
            title: "Publicaciones",
            description: "Artículos académicos",
            icon: FileText,
            value: "25",
            change: "+12",
            color: "text-amber-600",
            action: { label: "Biblioteca", href: "/admin/publicaciones" },
          },
        );
        break;
    }

    return baseCards;
  };

  const dashboardCards = getDashboardCards();

  return (
    <div className="space-y-6">
      {/* Institution Type Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentInfo.icon}</div>
              <div>
                <CardTitle className="text-xl">
                  {currentInfo.chileanName}
                </CardTitle>
                <CardDescription>
                  Dashboard especializado para {currentInfo.name.toLowerCase()}
                </CardDescription>
              </div>
            </div>
            <Badge className={currentInfo.color} variant="secondary">
              {currentInfo.levels.length} Niveles
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                {card.change && (
                  <Badge variant="secondary" className="text-xs">
                    {card.change}
                  </Badge>
                )}
              </div>
              {card.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => (window.location.href = card.action!.href)}
                >
                  {card.action.label}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level-specific features info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.enabled_features")}</CardTitle>
          <CardDescription>
            Funcionalidades disponibles para {currentInfo.chileanName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries({
              parent_meetings: "Reuniones con Apoderados",
              academic_planning: "Planificación Académica",
              grading_system: "Sistema de Calificaciones",
              daycare_features: "Características de Jardín",
              university_features: "Funciones Universitarias",
              technical_training: "Formación Técnica",
              thesis_management: "Gestión de Tesis",
              play_based_learning: "Aprendizaje Lúdico",
              career_guidance: "Orientación Vocacional",
              research_projects: "Proyectos de Investigación",
            }).map(([feature, label]) => {
              const isEnabled = shouldShowFeature(feature, currentType);
              return (
                <div
                  key={feature}
                  className={`flex items-center gap-2 p-2 rounded ${isEnabled ? "bg-green-50" : "bg-gray-50"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isEnabled ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  <span
                    className={`text-sm ${isEnabled ? "text-green-800" : "text-gray-600"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
