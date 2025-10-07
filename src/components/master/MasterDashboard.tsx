"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LucideIcon } from "lucide-react";

import {
  Crown,
  Shield,
  Database,
  Activity,
  Users,
  Server,
  AlertTriangle,
  CheckCircle,
  Zap,
  Settings,
  Eye,
  Code,
  Terminal,
  Monitor,
  BarChart3,
  Globe,
  Key,
  Lock,
  Cpu,
  HardDrive,
  Wifi,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getRoleDisplayName } from "@/lib/role-utils";
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";
import { MasterPageTemplate } from "./MasterPageTemplate";
import { MasterActionCard } from "./MasterActionCard";

interface SystemMetrics {
  users: { total: number; active: number; newToday: number };
  performance: { responseTime: number; uptime: string; throughput: number };
  security: { threats: number; blocked: number; alerts: number };
  database: { connections: number; queriesPerSec: number; size: string };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  category: string;
}

const masterQuickActions: QuickAction[] = [
  // Core Master Functions
  {
    id: "system-overview",
    title: "System Overview",
    description: "Monitor all system components",
    icon: Activity,
    href: "/master/system-overview",
    category: "Core",
  },
  {
    id: "user-management",
    title: "User Management",
    description: "Manage users and roles",
    icon: Users,
    href: "/master/user-management",
    category: "Core",
  },
  {
    id: "database-tools",
    title: "Database Tools",
    description: "Database operations and maintenance",
    icon: Database,
    href: "/master/database-tools",
    category: "Core",
  },
  {
    id: "security-center",
    title: "Security Center",
    description: "Security monitoring and controls",
    icon: Shield,
    href: "/master/security-center",
    category: "Core",
  },

  // Advanced Tools (God Mode)
  {
    id: "god-mode",
    title: "God Mode Dashboard",
    description: "Supreme system control",
    icon: Crown,
    href: "/master/god-mode",
    variant: "secondary",
    category: "God Mode",
  },
];

function SystemHealthCard() {
  const healthMetrics = useMemo(
    () => ({
      overall: 98.5,
      database: 99.2,
      api: 97.8,
      security: 100,
      performance: 96.3,
    }),
    [],
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          System Health
        </CardTitle>
        <CardDescription>
          Overall status of all system components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(healthMetrics).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{key}</span>
                <span className="font-medium">{value}%</span>
              </div>
              <Progress
                value={value}
                className="h-2"
                indicatorClassName={
                  value >= 98
                    ? "bg-green-500"
                    : value >= 95
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            Todos los sistemas operativos - Última verificación: hace 2 min
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function LocalMasterStatsCard() {
  const { stats, loading } = useDashboardData();

  if (loading) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">
              Cargando estadísticas...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Global Statistics
        </CardTitle>
        <CardDescription>Critical system metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {(stats.users?.total || 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.users?.active || 0}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.database?.connections || 0}
            </div>
            <div className="text-sm text-muted-foreground">DB Connections</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {((stats.performance?.throughput || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-muted-foreground">Requests/hour</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityAlertsCard() {
  const alerts = useMemo(
    () => [
      {
        id: 1,
        type: "warning",
        message: "Unauthorized access attempt detected",
        time: "2 min ago",
        severity: "medium",
      },
      {
        id: 2,
        type: "info",
        message: "Automatic backup completed",
        time: "15 min ago",
        severity: "low",
      },
      {
        id: 3,
        type: "success",
        message: "Security update applied",
        time: "1 hour ago",
        severity: "low",
      },
    ],
    [],
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Security Alerts
        </CardTitle>
        <CardDescription>Recent security events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg"
            >
              <div
                className={`mt-0.5 h-2 w-2 rounded-full ${
                  alert.severity === "high"
                    ? "bg-red-500"
                    : alert.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant || "outline"}
            className="h-auto p-6 flex flex-col items-center gap-3 text-center border-blue-200 hover:border-blue-300 dark:border-blue-800 transition-all duration-200 group"
            asChild
          >
            <a href={action.href} className="w-full">
              <Icon className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
              <div className="space-y-1">
                <div className="font-semibold text-sm leading-tight">
                  {action.title}
                </div>
                <div className="text-xs text-muted-foreground leading-tight max-w-full">
                  {action.description}
                </div>
              </div>
            </a>
          </Button>
        );
      })}
    </div>
  );
}

export function MasterDashboard() {
  const { data: session } = useSession();
  const { stats: dashboardStats, loading: statsLoading } = useDashboardData();

  const quickActions = masterQuickActions.map((action) => ({
    id: action.id,
    title: action.title,
    description: action.description,
    icon: action.icon,
    badge: action.category,
    variant: action.variant as
      | "default"
      | "destructive"
      | "outline"
      | "secondary",
    href: action.href,
  }));

  const stats = [
    {
      icon: BarChart3,
      value: dashboardStats.users?.total || 0,
      label: "Usuarios Totales",
      color: "purple" as const,
    },
    {
      icon: Activity,
      value: dashboardStats.users?.active || 0,
      label: "Usuarios Activos",
      color: "blue" as const,
    },
    {
      icon: Database,
      value: dashboardStats.database?.connections || 0,
      label: "Conexiones DB",
      color: "green" as const,
    },
    {
      icon: Zap,
      value:
        ((dashboardStats.performance?.throughput || 0) / 1000).toFixed(1) + "K",
      label: "Requests/hora",
      color: "orange" as const,
    },
  ];

  return (
    <MasterPageTemplate
      title="🏛️ Master Control Panel"
      subtitle={`Welcome, Master Developer ${session?.user?.name || "Administrator"}`}
      context="MASTER_DASHBOARD"
    >
      {/* Quick Actions */}
      <MasterActionCard
        title="Quick Actions - Master Tools"
        description="Advanced tools available for master administrators"
        actions={quickActions}
        columns={4}
      />

      {/* System Overview */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <SystemHealthCard />
        <LocalMasterStatsCard />
        <SecurityAlertsCard />
      </div>
    </MasterPageTemplate>
  );
}
