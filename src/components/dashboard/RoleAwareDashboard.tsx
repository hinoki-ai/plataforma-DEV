"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/components/language/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  User,
  Eye,
  Plus,
  Bell,
  Activity,
  Database,
  Code,
  Globe,
  Vote,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/prisma-compat-types";
import { getRoleDisplayName } from "@/lib/role-utils";
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";
import {
  RoleGuard,
  RoleBasedComponent,
  FeatureToggle,
} from "@/components/auth/RoleGuard";
import { useNavigation } from "@/components/layout/NavigationContext";
import { usePathname } from "next/navigation";
import { useDashboardData } from "@/hooks/useDashboardData";
import UnifiedCalendarView from "@/components/calendar/UnifiedCalendarView";
import { OACoverageWidget } from "@/components/dashboard/OACoverageWidget";

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  roles?: UserRole[];
}

const quickActions: Record<UserRole, QuickAction[]> = {
  MASTER: [
    {
      id: "supreme-control",
      title: "🏛️ Supreme Control",
      description: "Panel de control absoluto",
      icon: Crown,
      href: "/master",
      variant: "default",
    },
    {
      id: "system-monitor",
      title: "Monitor del Sistema",
      description: "Supervisión en tiempo real",
      icon: Activity,
      href: "/master/system-monitor",
    },
    {
      id: "database-tools",
      title: "Herramientas BD",
      description: "Gestión avanzada",
      icon: Database,
      href: "/master/database-tools",
    },
    {
      id: "security-center",
      title: "Centro de Seguridad",
      description: "Análisis de amenazas",
      icon: Shield,
      href: "/master/security",
    },
    {
      id: "debug-console",
      title: "Consola Debug",
      description: "Herramientas de desarrollo",
      icon: Code,
      href: "/master/debug-console",
    },
    {
      id: "user-analytics",
      title: "Análisis de Usuarios",
      description: "Estadísticas detalladas",
      icon: TrendingUp,
      href: "/master/user-analytics",
    },
    {
      id: "role-switch",
      title: "Cambiar Rol",
      description: "Probar perspectivas",
      icon: Users,
      href: "#role-switch",
      variant: "outline",
    },
    {
      id: "audit-logs",
      title: "Auditoría Suprema",
      description: "Registros completos",
      icon: Eye,
      href: "/master/audit-logs",
    },
  ],
  ADMIN: [
    {
      id: "new-user",
      title: "Nuevo Usuario",
      description: "Crear usuario",
      icon: Plus,
      href: "/admin/usuarios/new",
    },
    {
      id: "schedule-meeting",
      title: "Agendar Reunión",
      description: "Programar reunión",
      icon: Calendar,
      href: "/admin/reuniones/new",
    },
    {
      id: "create-voting",
      title: "Crear Votación",
      description: "Nueva votación",
      icon: MessageSquare,
      href: "/admin/votaciones/new",
    },
    {
      id: "team-management",
      title: "Gestionar Equipo",
      description: "Equipo multidisciplinario",
      icon: Users,
      href: "/admin/equipo-multidisciplinario",
    },
    {
      id: "calendar",
      title: "Calendario Escolar",
      description: "Gestionar calendario académico",
      icon: Calendar,
      href: "/admin/calendario-escolar",
    },
    {
      id: "notifications",
      title: "Notificaciones",
      description: "Gestionar notificaciones",
      icon: Bell,
      href: "#notifications",
    },
  ],
  PROFESOR: [
    {
      id: "new-planning",
      title: "Nueva Planificación",
      description: "Crear nueva planificación",
      icon: Plus,
      href: "/profesor/planificaciones/crear",
    },
    {
      id: "schedule-parent-meeting",
      title: "Reunión con Padres",
      description: "Agendar reunión",
      icon: Calendar,
      href: "/profesor/reuniones",
    },
    {
      id: "view-calendar",
      title: "Ver Calendario",
      description: "Calendario académico",
      icon: Calendar,
      href: "/profesor/calendario-escolar",
    },
    {
      id: "update-profile",
      title: "Actualizar Perfil",
      description: "Editar información",
      icon: User,
      href: "/profesor/perfil",
    },
  ],
  PARENT: [
    {
      id: "view-children",
      title: "Ver Hijos",
      description: "Información de estudiantes",
      icon: User,
      href: "/parent/estudiantes",
    },
    {
      id: "schedule-meeting",
      title: "Agendar Reunión",
      description: "Con profesor",
      icon: Calendar,
      href: "/parent/reuniones",
    },
    {
      id: "contact-teacher",
      title: "Contactar Profesor",
      description: "Enviar mensaje",
      icon: MessageSquare,
      href: "/parent/comunicacion",
    },
  ],
  PUBLIC: [
    {
      id: "view-team",
      title: "Conocer Equipo",
      description: "Equipo multidisciplinario",
      icon: Users,
      href: "/equipo-multidisciplinario",
    },
    {
      id: "photos-videos",
      title: "Multimedia",
      description: "Fotos y videos",
      icon: Eye,
      href: "/fotos-videos",
    },
    {
      id: "contact",
      title: "CFMG Center of Fathers, Mothers and Guardians",
      description: "Center information",
      icon: MessageSquare,
      href: "/cpma",
    },
  ],
};

interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function DashboardCard({
  title,
  description,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <RoleGuard
            key={action.id}
            roles={action.roles}
            showUnauthorized={false}
          >
            <Button
              variant={action.variant || "default"}
              className="h-auto p-4 flex flex-col items-center gap-2 text-center"
              asChild
            >
              <a href={action.href}>
                <Icon className="h-6 w-6" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </a>
            </Button>
          </RoleGuard>
        );
      })}
    </div>
  );
}

function RoleStats({ role }: { role: UserRole }) {
  const { stats, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">
          Cargando estadísticas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
        <p className="text-sm">Error al cargar estadísticas: {error}</p>
      </div>
    );
  }

  if (Object.keys(stats).length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(stats).map(([key, value]: [string, any]) => (
        <Card key={key}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{key}</p>
                <p className="text-2xl font-bold">
                  {typeof value === "object"
                    ? value.total || value.active
                    : value}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {key === "users" && <Users className="h-4 w-4 text-primary" />}
                {key === "meetings" && (
                  <Calendar className="h-4 w-4 text-primary" />
                )}
                {key === "documents" && (
                  <FileText className="h-4 w-4 text-primary" />
                )}
                {key === "plannings" && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
                {key === "system" && (
                  <TrendingUp className="h-4 w-4 text-primary" />
                )}
                {key === "votings" && (
                  <MessageSquare className="h-4 w-4 text-primary" />
                )}
                {key === "communications" && (
                  <Bell className="h-4 w-4 text-primary" />
                )}
                {key === "children" && (
                  <User className="h-4 w-4 text-primary" />
                )}
                {key === "security" && (
                  <Shield className="h-4 w-4 text-primary" />
                )}
                {key === "performance" && (
                  <Activity className="h-4 w-4 text-primary" />
                )}
                {key === "database" && (
                  <Database className="h-4 w-4 text-primary" />
                )}
                {key === "api" && <Globe className="h-4 w-4 text-primary" />}
              </div>
            </div>

            {/* Progress indicators for relevant stats */}
            {typeof value === "object" && value.completed !== undefined && (
              <div className="mt-2">
                <Progress
                  value={(value.completed / value.total) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {value.completed}/{value.total} completado
                </p>
              </div>
            )}

            {/* Health indicator for system */}
            {key === "system" && value.health && (
              <div className="mt-2">
                <Progress value={value.health} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Salud del sistema: {value.health}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RoleAwareDashboard() {
  const { data: session } = useSession();
  const { user } = useNavigation();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Determine the contextual role based on current path for MASTER users
  const getContextualRole = () => {
    if (!user.role) return null;

    // If user is MASTER, determine context based on path
    if (user.role === "MASTER") {
      if (pathname.startsWith("/admin/") || pathname === "/admin") {
        return "ADMIN";
      }
      if (pathname.startsWith("/profesor/") || pathname === "/profesor") {
        return "PROFESOR";
      }
      if (pathname.startsWith("/parent/") || pathname === "/parent") {
        return "PARENT";
      }
    }

    // Default to user's actual role
    return user.role;
  };

  const currentRole = getContextualRole();
  const userActions = currentRole ? quickActions[currentRole] : [];

  if (!currentRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Acceso público</h3>
          <p className="text-muted-foreground">
            Explora el contenido disponible para visitantes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with role indicator */}
      <RoleAwareHeader
        title={`Panel de ${getRoleDisplayName(currentRole)}`}
        subtitle={`Bienvenido${session?.user?.name ? `, ${session.user.name}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <RoleIndicator role={currentRole} />
            <Badge variant="outline">{getRoleDisplayName(currentRole)}</Badge>
          </div>
        }
      />

      {/* Breadcrumbs */}
      <RoleAwareBreadcrumb />

      {/* Quick Actions */}
      <DashboardCard
        title="Acciones Rápidas"
        description="Accede rápidamente a las funciones más utilizadas"
      >
        <QuickActionsGrid actions={userActions} />
      </DashboardCard>

      {/* Role-specific stats */}
      <FeatureToggle feature="advanced-analytics">
        <DashboardCard
          title="Estadísticas"
          description="Resumen de tu actividad y métricas importantes"
        >
          <RoleStats role={currentRole} />
        </DashboardCard>
      </FeatureToggle>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard
          title="Actividad Reciente"
          description="Tus acciones más recientes"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Sesión iniciada</p>
                <p className="text-xs text-muted-foreground">Hace 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Página visitada</p>
                <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Role-specific widgets */}
        <RoleBasedComponent
          master={
            <DashboardCard
              title="🏛️ Estado del Sistema Supremo"
              description="Monitoreo absoluto del sistema"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <span className="text-sm font-medium">Base de datos</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <span className="text-sm font-medium">API Gateway</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-sm font-medium">CDN</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <span className="text-sm font-medium">Cache</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      Online
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Último backup completo</span>
                    <span className="text-xs text-muted-foreground">
                      Hace 2 horas
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">Próximo mantenimiento</span>
                    <span className="text-xs text-muted-foreground">
                      Esta noche 2:00 AM
                    </span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          }
          admin={
            <div className="space-y-6">
              <DashboardCard
                title="Próximas Reuniones"
                description="Reuniones programadas"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Reunión de equipo</p>
                      <p className="text-xs text-muted-foreground">
                        Mañana 10:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Consejo escolar</p>
                      <p className="text-xs text-muted-foreground">
                        Viernes 3:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard
                title="📢 Centro de Notificaciones"
                description="Gestiona notificaciones del sistema"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">
                        Sistema de notificaciones activo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Envía notificaciones en tiempo real
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Gestionar Notificaciones
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            </div>
          }
          profesor={
            <div className="space-y-6">
              {/* Calendar Section */}
              <DashboardCard
                title="📅 Calendario Académico"
                description="Vista completa del calendario escolar"
              >
                <div className="h-96 overflow-hidden rounded-lg border">
                  <UnifiedCalendarView
                    mode="compact"
                    showAdminControls={false}
                    showExport={false}
                    initialCategories={[
                      "ACADEMIC",
                      "HOLIDAY",
                      "SPECIAL",
                      "MEETING",
                      "EXAM",
                    ]}
                    userRole="PROFESOR"
                  />
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href="/profesor/calendario-escolar">
                      Ver Calendario Completo
                    </Link>
                  </Button>
                </div>
              </DashboardCard>

              {/* OA Coverage Widget */}
              <DashboardCard
                title="🎯 Cobertura de OA"
                description="Seguimiento de objetivos de aprendizaje"
              >
                <OACoverageWidget data={null} loading={false} />
              </DashboardCard>
            </div>
          }
          parent={
            <DashboardCard
              title="📢 Comunicados Generales"
              description="Mensajes importantes y anuncios"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reunión de apoderados</p>
                    <p className="text-xs text-muted-foreground">
                      Nuevo mensaje
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Calendario actualizado
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          }
        />

        {/* Parent-specific detailed sections */}
        {currentRole === "PARENT" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* General Communication Section */}
            <DashboardCard
              title="💬 Comunicación General"
              description="Mensajes, notificaciones y contactos"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mensajes Recibidos</p>
                    <p className="text-xs text-muted-foreground">3 sin leer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Notificaciones</p>
                    <p className="text-xs text-muted-foreground">
                      2 nuevas hoy
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href="/parent/comunicacion">Ver Todo</Link>
                  </Button>
                </div>
              </div>
            </DashboardCard>

            {/* Votaciones Section */}
            <DashboardCard
              title="🗳️ Votaciones"
              description="Participa en decisiones escolares"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <Vote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Votación Activa</p>
                    <p className="text-xs text-muted-foreground">
                      Presupuesto escolar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Resultados Disponibles
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uniformes nuevos
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href="/parent/votaciones">Participar</Link>
                  </Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}
      </div>

      {/* Master-specific features */}
      <FeatureToggle feature="role-switching">
        <RoleGuard roles={["MASTER"]}>
          <DashboardCard
            title="Herramientas de Desarrollo"
            description="Funciones disponibles solo para desarrolladores"
          >
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                <Crown className="h-3 w-3 mr-1" />
                Modo Desarrollador
              </Badge>
              <Badge variant="outline">Cambio de Rol Activo</Badge>
              <Badge variant="outline">Auditoría Completa</Badge>
            </div>
          </DashboardCard>
        </RoleGuard>
      </FeatureToggle>
    </div>
  );
}
