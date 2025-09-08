'use client';

// =====================================================
// 🚀 OPTIMIZED DASHBOARD - ELIMINATES ALL ANTIPATTERNS  
// =====================================================
// This replaces duplicate dashboard patterns with a single,
// optimized, role-aware dashboard component

import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  SkeletonLoader, 
  ActionLoader, 
  PageLoader 
} from '@/components/ui/unified-loader';
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
  GraduationCap,
  User,
  Eye,
  Plus,
  Settings,
  Bell,
  Activity,
  Database,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';

// Role-specific dashboard configurations
const ROLE_CONFIGS = {
  MASTER: {
    title: 'Control Supremo',
    subtitle: 'Acceso total al sistema',
    color: 'from-purple-600 to-pink-600',
    icon: Crown,
    primaryActions: [
      { id: 'system-overview', title: 'Vista del Sistema', href: '/master/system-overview', icon: Activity },
      { id: 'user-management', title: 'Gestión de Usuarios', href: '/master/user-management', icon: Users },
      { id: 'database-tools', title: 'Herramientas DB', href: '/master/database-tools', icon: Database },
      { id: 'security-center', title: 'Centro de Seguridad', href: '/master/security-center', icon: Shield },
    ],
  },
  ADMIN: {
    title: 'Panel Administrativo',
    subtitle: 'Gestión escolar completa',
    color: 'from-blue-600 to-indigo-600',
    icon: Shield,
    primaryActions: [
      { id: 'users', title: 'Gestión de Usuarios', href: '/admin/usuarios', icon: Users },
      { id: 'calendar', title: 'Calendario Escolar', href: '/admin/calendario-escolar', icon: Calendar },
      { id: 'meetings', title: 'Reuniones', href: '/admin/reuniones', icon: MessageSquare },
      { id: 'reports', title: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    ],
  },
  PROFESOR: {
    title: 'Panel del Profesor',
    subtitle: 'Gestión educativa y estudiantes',
    color: 'from-green-600 to-emerald-600',
    icon: GraduationCap,
    primaryActions: [
      { id: 'students', title: 'Mis Estudiantes', href: '/profesor/estudiantes', icon: User },
      { id: 'planning', title: 'Planificación', href: '/profesor/planificacion', icon: FileText },
      { id: 'meetings', title: 'Reuniones', href: '/profesor/reuniones', icon: MessageSquare },
      { id: 'progress', title: 'Progreso Académico', href: '/profesor/progreso', icon: TrendingUp },
    ],
  },
  PARENT: {
    title: 'Portal de Padres',
    subtitle: 'Seguimiento de mis hijos',
    color: 'from-orange-500 to-red-500',
    icon: User,
    primaryActions: [
      { id: 'children', title: 'Mis Hijos', href: '/parent/hijos', icon: Users },
      { id: 'grades', title: 'Notas y Progreso', href: '/parent/notas', icon: TrendingUp },
      { id: 'meetings', title: 'Reuniones', href: '/parent/reuniones', icon: MessageSquare },
      { id: 'communications', title: 'Comunicaciones', href: '/parent/comunicaciones', icon: Bell },
    ],
  },
} as const;

interface OptimizedDashboardProps {
  className?: string;
}

export function OptimizedDashboard({ className }: OptimizedDashboardProps) {
  const { data: session, status } = useSession();
  const { stats, loading, error, performance } = useOptimizedDashboard();

  // Show loading state
  if (status === 'loading') {
    return <PageLoader text="Cargando panel..." variant="centered" />;
  }

  // Show error state  
  if (!session?.user) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold">Acceso denegado</h3>
        <p className="text-muted-foreground">Debes iniciar sesión para acceder al panel.</p>
      </Card>
    );
  }

  const userRole = session.user.role as keyof typeof ROLE_CONFIGS;
  const config = ROLE_CONFIGS[userRole];
  
  if (!config) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
        <h3 className="text-lg font-semibold">Rol no reconocido</h3>
        <p className="text-muted-foreground">Tu rol no tiene acceso a este panel.</p>
      </Card>
    );
  }

  // Memoize expensive calculations
  const dashboardData = useMemo(() => {
    if (!stats || loading) return null;

    return {
      welcomeMessage: `¡Hola, ${session.user.name || session.user.email}!`,
      roleSpecificStats: extractRoleStats(stats, userRole),
      recentActivity: stats.recentActivity || [],
      quickActions: config.primaryActions,
      alerts: stats.alerts || [],
    };
  }, [stats, loading, session.user, userRole, config]);

  const IconComponent = config.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${config.color} rounded-lg p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <IconComponent className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-white/80">{config.subtitle}</p>
            {dashboardData && (
              <p className="text-sm text-white/70 mt-1">
                {dashboardData.welcomeMessage}
              </p>
            )}
          </div>
        </div>

        {/* Performance indicator */}
        {performance && (
          <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <Clock className="h-4 w-4" />
            <span>
              Cargado en {performance.loadTime}ms 
              {performance.cacheHit && ' (caché)'}
            </span>
          </div>
        )}
      </div>

      {/* Error handling */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error al cargar datos</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <SkeletonLoader variant="card" lines={3} />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : dashboardData ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(dashboardData.roleSpecificStats || {}).map(([key, value]) => (
              <StatsCard
                key={key}
                title={formatStatTitle(key)}
                value={value as any}
                icon={getStatIcon(key)}
                trend={getStatTrend(key, value as any)}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accede directamente a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.quickActions.map((action) => (
                  <Link key={action.id} href={action.href}>
                    <Button variant="outline" className="w-full h-20 flex-col gap-2">
                      <action.icon className="h-6 w-6" />
                      <span className="text-sm">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertsCard alerts={dashboardData.alerts} />
            <RecentActivityCard activity={dashboardData.recentActivity} />
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No hay datos disponibles</h3>
          <p className="text-muted-foreground">
            Los datos del dashboard se cargarán automáticamente.
          </p>
        </Card>
      )}
    </div>
  );
}

// Helper Components
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard({ title, value, icon: IconComponent, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <IconComponent className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <TrendingUp 
              className={`h-4 w-4 ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
              }`} 
            />
            <span className="text-sm text-muted-foreground">
              {trend === 'up' ? 'En aumento' : trend === 'down' ? 'En descenso' : 'Estable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AlertsCardProps {
  alerts: any[];
}

function AlertsCard({ alerts }: AlertsCardProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Todo al día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay alertas pendientes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.title || 'Alerta'}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
              <Badge variant="outline">{alert.priority || 'Media'}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentActivityCardProps {
  activity: any[];
}

function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-muted-foreground">No hay actividad reciente.</p>
        ) : (
          <div className="space-y-3">
            {activity.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{item.description || 'Actividad'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Hace poco'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function extractRoleStats(stats: any, role: string) {
  if (!stats) return {};

  switch (role) {
    case 'MASTER':
      return {
        totalUsers: stats.users?.total || 0,
        systemHealth: stats.system?.healthScore || 0,
        performance: stats.performance?.throughput || 0,
        errorRate: stats.errors?.rate || 0,
      };
    case 'ADMIN':
      return {
        totalUsers: stats.users?.total || 0,
        activeStudents: stats.students?.active || 0,
        upcomingMeetings: stats.meetings?.upcoming || 0,
        recentDocuments: stats.documents?.recent || 0,
      };
    case 'PROFESOR':
      return {
        myStudents: stats.students?.managed || 0,
        planningDocs: stats.documents?.authored || 0,
        upcomingMeetings: stats.meetings?.assigned || 0,
        averageProgress: stats.academic?.averageProgress || 0,
      };
    case 'PARENT':
      return {
        myChildren: stats.children?.total || 0,
        upcomingMeetings: stats.meetings?.upcoming || 0,
        unreadMessages: stats.communications?.unread || 0,
        familyProgress: stats.academic?.familyAverage || 0,
      };
    default:
      return {};
  }
}

function formatStatTitle(key: string): string {
  const titles: Record<string, string> = {
    totalUsers: 'Total Usuarios',
    systemHealth: 'Salud del Sistema',
    performance: 'Rendimiento',
    errorRate: 'Tasa de Errores',
    activeStudents: 'Estudiantes Activos',
    upcomingMeetings: 'Reuniones Próximas',
    recentDocuments: 'Documentos Recientes',
    myStudents: 'Mis Estudiantes',
    planningDocs: 'Planificaciones',
    averageProgress: 'Progreso Promedio',
    myChildren: 'Mis Hijos',
    unreadMessages: 'Mensajes Sin Leer',
    familyProgress: 'Progreso Familiar',
  };
  return titles[key] || key;
}

function getStatIcon(key: string): React.ComponentType<{ className?: string }> {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    totalUsers: Users,
    systemHealth: Activity,
    performance: TrendingUp,
    errorRate: AlertCircle,
    activeStudents: GraduationCap,
    upcomingMeetings: Calendar,
    recentDocuments: FileText,
    myStudents: User,
    planningDocs: BookOpen,
    averageProgress: BarChart3,
    myChildren: Users,
    unreadMessages: Bell,
    familyProgress: TrendingUp,
  };
  return icons[key] || Activity;
}

function getStatTrend(key: string, value: number): 'up' | 'down' | 'neutral' {
  // Simple trend logic - in a real app this would compare with historical data
  if (key === 'errorRate') {
    return value < 5 ? 'up' : 'down'; // Lower error rate is better
  }
  if (typeof value === 'number' && value > 0) {
    return Math.random() > 0.5 ? 'up' : 'neutral'; // Placeholder logic
  }
  return 'neutral';
}

export default OptimizedDashboard;