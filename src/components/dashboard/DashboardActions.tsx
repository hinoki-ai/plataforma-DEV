"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  AdaptiveCard,
  AdaptiveCardContent,
  AdaptiveCardHeader,
  AdaptiveCardTitle,
} from "@/components/ui/adaptive-card";
import { AdaptiveButton } from "@/components/ui/adaptive-button";
import { cn } from "@/lib/utils";
import {
  Plus,
  Calendar,
  FileText,
  Users,
  Settings,
  BookOpen,
  UserPlus,
  Clock,
  MessageSquare,
} from "lucide-react";

export type DashboardActionsVariant =
  | "admin"
  | "profesor"
  | "parent"
  | "public"
  | "auto";

export interface DashboardActionsProps {
  /**
   * Display variant - auto-detects by default
   */
  variant?: DashboardActionsVariant;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom actions to include
   */
  customActions?: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    primary?: boolean;
  }>;
}

/**
 * Context-appropriate quick actions component
 */
export function DashboardActions({
  variant = "auto",
  className,
  customActions = [],
}: DashboardActionsProps) {
  const pathname = usePathname();
  const { data: _session } = useSession();

  // Auto-detect variant based on route and session
  const detectedVariant: Exclude<DashboardActionsVariant, "auto"> =
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

  // Role-specific action configurations
  const getActionsConfig = () => {
    const baseActions = customActions.length > 0 ? customActions : [];

    switch (detectedVariant) {
      case "admin":
        return [
          ...baseActions,
          {
            label: "Nuevo Usuario",
            href: "/admin/users/new",
            icon: UserPlus,
            description: "Agregar nuevo usuario al sistema",
            primary: true,
          },
          {
            label: "Crear Evento",
            href: "/admin/calendar/new",
            icon: Plus,
            description: "Programar nuevo evento",
          },
          {
            label: "Gestionar Equipo",
            href: "/admin/equipo-multidisciplinario",
            icon: Users,
            description: "Administrar equipo multidisciplinario",
          },
          {
            label: "Configuración",
            href: "/admin/settings",
            icon: Settings,
            description: "Configuración del sistema",
          },
          {
            label: "Ver Calendario",
            href: "/admin/calendar",
            icon: Calendar,
            description: "Gestionar calendario completo",
          },
          {
            label: "Documentos",
            href: "/admin/documents",
            icon: FileText,
            description: "Gestionar documentos del sistema",
          },
        ];

      case "profesor":
        return [
          ...baseActions,
          {
            label: "Nueva Planificación",
            href: "/profesor/planning/new",
            icon: Plus,
            description: "Crear nueva planificación",
            primary: true,
          },
          {
            label: "Mi Calendario",
            href: "/profesor/calendar",
            icon: Calendar,
            description: "Ver mi calendario de clases",
          },
          {
            label: "PME",
            href: "/profesor/pme",
            icon: BookOpen,
            description: "Plan de Mejoramiento Educativo",
          },
          {
            label: "Horarios",
            href: "/profesor/horarios",
            icon: Clock,
            description: "Gestionar horarios de clases",
          },
          {
            label: "Mis Documentos",
            href: "/profesor/documents",
            icon: FileText,
            description: "Mis planificaciones y documentos",
          },
        ];

      case "parent":
        return [
          ...baseActions,
          {
            label: "Calendario Escolar",
            href: "/parent/calendario-escolar",
            icon: Calendar,
            description: "Ver eventos y actividades",
            primary: true,
          },
          {
            label: "Equipo Multidisciplinario",
            href: "/public/equipo-multidisciplinario",
            icon: Users,
            description: "Conocer al equipo de profesionales",
          },
          {
            label: "Recursos",
            href: "/parent/resources",
            icon: BookOpen,
            description: "Recursos educativos disponibles",
          },
          {
            label: "Reuniones",
            href: "/parent/reuniones",
            icon: MessageSquare,
            description: "Gestionar reuniones con profesores",
          },
        ];

      case "public":
        return [
          ...baseActions,
          {
            label: "Ver Calendario",
            href: "/calendario-escolar",
            icon: Calendar,
            description: "Consultar eventos públicos",
            primary: true,
          },
          {
            label: "Conocer Equipo",
            href: "/equipo-multidisciplinario",
            icon: Users,
            description: "Nuestro equipo multidisciplinario",
          },
        ];

      default:
        return baseActions;
    }
  };

  const actionsConfig = getActionsConfig();

  return (
    <AdaptiveCard variant={context} className={className}>
      <AdaptiveCardHeader>
        <AdaptiveCardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Acciones Rápidas
        </AdaptiveCardTitle>
      </AdaptiveCardHeader>
      <AdaptiveCardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actionsConfig.map((action, index) => {
            const Icon = action.icon;

            return (
              <Link key={index} href={action.href} className="block">
                <div
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 hover:shadow-md group",
                    context === "public"
                      ? "border-gray-600/50 bg-gray-800/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                      : "border-border bg-card hover:bg-accent/50",
                    action.primary &&
                      context === "public" &&
                      "ring-2 ring-blue-500/30",
                    action.primary &&
                      context === "auth" &&
                      "ring-2 ring-primary/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        context === "public"
                          ? "bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30"
                          : "bg-primary/10 text-primary group-hover:bg-primary/20",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-medium text-sm mb-1",
                          context === "public"
                            ? "text-white"
                            : "text-foreground",
                        )}
                      >
                        {action.label}
                      </h3>
                      {action.description && (
                        <p
                          className={cn(
                            "text-xs leading-relaxed",
                            context === "public"
                              ? "text-gray-300"
                              : "text-muted-foreground",
                          )}
                        >
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick action buttons for primary actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {actionsConfig
            .filter((action) => action.primary)
            .slice(0, 2)
            .map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <AdaptiveButton
                    variant="default"
                    enhancement="gradient"
                    dramatic={context === "public"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </AdaptiveButton>
                </Link>
              );
            })}
        </div>
      </AdaptiveCardContent>
    </AdaptiveCard>
  );
}

export default DashboardActions;
