"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AdaptiveCard,
  AdaptiveCardContent,
} from "@/components/ui/adaptive-card";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  TrendingUp,
  BookOpen,
  UserCheck,
  Target,
} from "lucide-react";

export type DashboardStatsVariant =
  | "admin"
  | "profesor"
  | "parent"
  | "public"
  | "auto";

export interface DashboardStatsProps {
  /**
   * Display variant - auto-detects by default
   */
  variant?: DashboardStatsVariant;

  /**
   * Statistics data
   */
  stats?: {
    totalUsers?: number;
    totalDocuments?: number;
    monthlyGrowth?: number;
    activeStudents?: number;
    completedTasks?: number;
    pendingApprovals?: number;
  };

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Role-aware statistics display component
 */
export function DashboardStats({
  variant = "auto",
  stats = {},
  className,
}: DashboardStatsProps) {
  const pathname = usePathname();
  const { data: _session } = useSession();

  // Auto-detect variant based on route and session
  const detectedVariant: Exclude<DashboardStatsVariant, "auto"> =
    variant !== "auto"
      ? variant
      : pathname?.startsWith("/admin")
        ? "admin"
        : pathname?.startsWith("/profesor")
          ? "profesor"
          : pathname?.startsWith("/parent")
            ? "parent"
            : "public";

  const context = detectedVariant === "public" ? "public" : "auth";

  // Role-specific stat configurations
  const getStatsConfig = () => {
    switch (detectedVariant) {
      case "admin":
        return [
          {
            label: "Total Usuarios",
            value: stats.totalUsers || 0,
            icon: Users,
            color: "blue",
            description: "Usuarios registrados",
          },
          {
            label: "Documentos",
            value: stats.totalDocuments || 0,
            icon: FileText,
            color: "purple",
            description: "Documentos de planificación",
          },
          {
            label: "Crecimiento",
            value: `${stats.monthlyGrowth || 0}%`,
            icon: TrendingUp,
            color: "orange",
            description: "Crecimiento mensual",
          },
        ];

      case "profesor":
        return [
          {
            label: "Estudiantes Activos",
            value: stats.activeStudents || 0,
            icon: UserCheck,
            color: "blue",
            description: "Estudiantes bajo tu supervisión",
          },
          {
            label: "Tareas Completadas",
            value: stats.completedTasks || 0,
            icon: Target,
            color: "green",
            description: "Tareas finalizadas este mes",
          },
          {
            label: "Documentos",
            value: stats.totalDocuments || 0,
            icon: FileText,
            color: "orange",
            description: "Planificaciones creadas",
          },
        ];

      case "parent":
        return [
          {
            label: "Actividades",
            value: stats.activeStudents || 0,
            icon: BookOpen,
            color: "green",
            description: "Actividades escolares",
          },
          {
            label: "Documentos",
            value: stats.totalDocuments || 0,
            icon: FileText,
            color: "orange",
            description: "Recursos disponibles",
          },
        ];

      case "public":
        return [
          {
            label: "Actividades",
            value: stats.activeStudents || 0,
            icon: BookOpen,
            color: "green",
            description: "Actividades estudiantiles",
          },
          {
            label: "Comunidad",
            value: stats.totalUsers || 0,
            icon: Users,
            color: "purple",
            description: "Miembros de la comunidad",
          },
          {
            label: "Recursos",
            value: stats.totalDocuments || 0,
            icon: FileText,
            color: "orange",
            description: "Recursos educativos",
          },
        ];

      default:
        return [];
    }
  };

  const statsConfig = getStatsConfig();

  // Color configurations
  const colorConfig = {
    blue: {
      bg:
        context === "public"
          ? "bg-blue-500/20"
          : "bg-blue-100 dark:bg-blue-900/30",
      text:
        context === "public"
          ? "text-blue-300"
          : "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg:
        context === "public"
          ? "bg-green-500/20"
          : "bg-green-100 dark:bg-green-900/30",
      text:
        context === "public"
          ? "text-green-300"
          : "text-green-600 dark:text-green-400",
    },
    purple: {
      bg:
        context === "public"
          ? "bg-purple-500/20"
          : "bg-purple-100 dark:bg-purple-900/30",
      text:
        context === "public"
          ? "text-purple-300"
          : "text-purple-600 dark:text-purple-400",
    },
    orange: {
      bg:
        context === "public"
          ? "bg-orange-500/20"
          : "bg-orange-100 dark:bg-orange-900/30",
      text:
        context === "public"
          ? "text-orange-300"
          : "text-orange-600 dark:text-orange-400",
    },
  };

  return (
    <AdaptiveCard variant={context} className={className}>
      <AdaptiveCardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            const colors = colorConfig[stat.color as keyof typeof colorConfig];

            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={cn("p-3 rounded-lg", colors.bg)}>
                  <Icon className={cn("w-6 h-6", colors.text)} />
                </div>
                <div>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      context === "public" ? "text-white" : "text-foreground",
                    )}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={cn(
                      "text-sm",
                      context === "public"
                        ? "text-gray-300"
                        : "text-muted-foreground",
                    )}
                  >
                    {stat.label}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      context === "public"
                        ? "text-gray-400"
                        : "text-muted-foreground/70",
                    )}
                  >
                    {stat.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AdaptiveCardContent>
    </AdaptiveCard>
  );
}

export default DashboardStats;
