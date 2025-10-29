/**
 * 🎓 Educational Level Aware Navigation
 * Navigation component that adapts based on educational institution type
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  School,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  UserCheck,
  Clock,
  Camera,
} from "lucide-react";
import {
  EducationalInstitutionType,
  INSTITUTION_TYPE_INFO,
  shouldShowFeature,
} from "@/lib/educational-system";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiredFeatures?: string[];
  institutionTypes?: EducationalInstitutionType[];
}

interface EducationalLevelAwareNavigationProps {
  currentType: EducationalInstitutionType;
  userRole: "ADMIN" | "MASTER" | "PROFESOR" | "PARENT";
  className?: string;
}

export function EducationalLevelAwareNavigation({
  currentType,
  userRole,
  className,
}: EducationalLevelAwareNavigationProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  // Base navigation items - filtered by educational level
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: "Equipo",
        href: "/equipo-multidisciplinario",
        icon: Users,
        institutionTypes: [
          "PRESCHOOL",
          "BASIC_SCHOOL",
          "HIGH_SCHOOL",
          "TECHNICAL_INSTITUTE",
          "TECHNICAL_CENTER",
          "UNIVERSITY",
        ],
      },
      {
        label: "Fotos y Videos",
        href: "/fotos-videos",
        icon: Camera,
        institutionTypes: ["PRESCHOOL", "BASIC_SCHOOL", "HIGH_SCHOOL"],
      },
    ];

    // Role-specific items
    if (userRole === "ADMIN" || userRole === "MASTER") {
      baseItems.push(
        {
          label: "Panel Admin",
          href: "/admin",
          icon: Settings,
          badge: userRole === "MASTER" ? "🏛️" : "Admin",
        },
        {
          label: "Reportes",
          href: "/admin/reportes",
          icon: BarChart3,
          requiredFeatures: ["academic_planning", "grading_system"],
        },
      );
    }

    if (userRole === "MASTER") {
      baseItems.push({
        label: "🏛️ Master Control",
        href: "/master",
        icon: Building2,
        badge: "MASTER",
      });
    }

    // Educational level specific items
    switch (currentType) {
      case "PRESCHOOL":
        baseItems.push(
          {
            label: "Actividades NT1/NT2",
            href: "/profesor/actividades",
            icon: School,
            institutionTypes: ["PRESCHOOL"],
          },
          {
            label: "Desarrollo Infantil",
            href: "/desarrollo-infantil",
            icon: UserCheck,
            institutionTypes: ["PRESCHOOL"],
          },
        );
        break;

      case "BASIC_SCHOOL":
        baseItems.push(
          {
            label: "Planificaciones",
            href: "/admin/planificaciones",
            icon: FileText,
            institutionTypes: ["BASIC_SCHOOL", "HIGH_SCHOOL"],
          },
          {
            label: "Reuniones Apoderados",
            href: "/admin/reuniones",
            icon: MessageSquare,
            institutionTypes: ["BASIC_SCHOOL", "HIGH_SCHOOL"],
          },
          {
            label: "Horarios",
            href: "/admin/horarios",
            icon: Clock,
            institutionTypes: ["BASIC_SCHOOL", "HIGH_SCHOOL"],
          },
        );
        break;

      case "HIGH_SCHOOL":
        baseItems.push(
          {
            label: "Orientación Vocacional",
            href: "/orientacion-vocacional",
            icon: GraduationCap,
            institutionTypes: ["HIGH_SCHOOL"],
          },
          {
            label: "Preparación PSU/PAES",
            href: "/preparacion-psu",
            icon: BookOpen,
            institutionTypes: ["HIGH_SCHOOL"],
          },
          {
            label: "Formación TP",
            href: "/formacion-tecnica",
            icon: Settings,
            institutionTypes: ["HIGH_SCHOOL"],
          },
        );
        break;

      case "UNIVERSITY":
        baseItems.push(
          {
            label: "Investigación",
            href: "/investigacion",
            icon: FileText,
            institutionTypes: ["UNIVERSITY"],
          },
          {
            label: "Tesis y Proyectos",
            href: "/tesis-proyectos",
            icon: GraduationCap,
            institutionTypes: ["UNIVERSITY"],
          },
          {
            label: "Biblioteca Digital",
            href: "/biblioteca-digital",
            icon: BookOpen,
            institutionTypes: ["UNIVERSITY"],
          },
        );
        break;
    }

    // Filter items based on institution type and features
    return baseItems.filter((item) => {
      // Check institution type compatibility
      if (
        item.institutionTypes &&
        !item.institutionTypes.includes(currentType)
      ) {
        return false;
      }

      // Check required features
      if (item.requiredFeatures) {
        return item.requiredFeatures.some((feature) =>
          shouldShowFeature(feature, currentType),
        );
      }

      return true;
    });
  };

  const navigationItems = getNavigationItems();
  const currentInfo = INSTITUTION_TYPE_INFO[currentType];

  return (
    <nav className={cn("space-y-2", className)}>
      {/* Institution Type Badge */}
      <div className="mb-4 p-3 rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">{currentInfo.icon}</div>
          <div>
            <div className="font-medium text-sm text-blue-900">
              {currentInfo.chileanName}
            </div>
            <div className="text-xs text-blue-600">
              {currentInfo.levels.length} niveles educativos
            </div>
          </div>
        </div>
        <Badge className={currentInfo.color} variant="secondary">
          {currentInfo.name}
        </Badge>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {navigationItems.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={index} href={item.href} className="block">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-4",
                  isActive && "bg-blue-600 hover:bg-blue-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Educational Level Info */}
      <div className="mt-6 p-3 rounded border border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 mb-1">
          {t("navigation.current_config")}
        </div>
        <div className="text-sm font-medium text-gray-900">
          {currentInfo.levels.length} Niveles • ISCED{" "}
          {Math.min(...currentInfo.levels.map((l) => l.isced))}-
          {Math.max(...currentInfo.levels.map((l) => l.isced))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {currentInfo.description}
        </div>
      </div>
    </nav>
  );
}
