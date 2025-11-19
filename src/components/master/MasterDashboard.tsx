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
import { Progress } from "@/components/ui/progress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LucideIcon } from "lucide-react";
import {
  Crown,
  Shield,
  Database,
  Activity,
  Users,
  BarChart3,
  Zap,
  CheckCircle,
  Building2,
} from "lucide-react";
import { MasterPageTemplate } from "./MasterPageTemplate";
import { MasterActionCard } from "./MasterActionCard";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

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

function SystemHealthCard({ stats }: { stats: any }) {
  const { t } = useDivineParsing(["master"]);
  const healthMetrics = useMemo(
    () => ({
      overall: stats?.performance?.healthScore || 98.5,
      database: stats?.database?.status === "connected" ? 100 : 0,
      api: stats?.performance?.healthScore || 97.8,
      security: stats?.security?.securityScore === "A+" ? 100 : 90,
      performance: stats?.performance?.healthScore || 96.3,
    }),
    [stats],
  );

  const metricLabels: Record<string, string> = {
    overall: t("master.system_overview.health.overall"),
    database: t("master.system_overview.health.database"),
    api: t("master.system_overview.health.api"),
    security: t("master.security_alerts.title"), // Using title as label for now
    performance: t("master.system_overview.performance.title"),
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t("master.system_overview.health.title")}
        </CardTitle>
        <CardDescription>
          {t("master.system_overview.health.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(healthMetrics).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{metricLabels[key] || key}</span>
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
            {t("master.system_status")}: {stats?.system?.status || t("master.unknown")} - {t("master.uptime")}:{" "}
            {stats?.system?.uptime
              ? `${Math.floor(stats.system.uptime / 3600)}h`
              : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function LocalMasterStatsCard({ stats, loading }: { stats: any; loading: boolean }) {
  const { t } = useDivineParsing(["master"]);
  
  if (loading) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">
              {t("master.loading_stats")}
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
          {t("master.global_stats.title")}
        </CardTitle>
        <CardDescription>{t("master.global_stats.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {(stats.users?.total || 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{t("master.system_overview.stats.total_users")}</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.users?.breakdown?.profesor || 0}
            </div>
            <div className="text-sm text-muted-foreground">{t("master.global_stats.teachers")}</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.database?.connectionPoolSize || 0}
            </div>
            <div className="text-sm text-muted-foreground">{t("master.global_stats.db_connections")}</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {((stats.performance?.throughput || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-muted-foreground">{t("master.global_stats.requests_hour")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityAlertsCard({ stats }: { stats: any }) {
  const { t } = useDivineParsing(["master"]);
  
  const alerts = useMemo(
    () => [
      {
        id: 1,
        type: "warning",
        message: `${t("master.security_alerts.active_threats")}: ${stats?.security?.activeThreats || 0}`,
        time: t("master.time.live"),
        severity: (stats?.security?.activeThreats || 0) > 0 ? "high" : "low",
      },
      {
        id: 2,
        type: "info",
        message: `${t("master.security_alerts.blocked_attempts")}: ${stats?.security?.blockedAttempts || 0}`,
        time: t("master.time.last_24h"),
        severity: "medium",
      },
      {
        id: 3,
        type: "success",
        message: `${t("master.security_alerts.security_score")}: ${stats?.security?.securityScore || "N/A"}`,
        time: t("master.time.current"),
        severity: "low",
      },
    ],
    [stats, t],
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t("master.security_alerts.title")}
        </CardTitle>
        <CardDescription>{t("master.security_alerts.subtitle")}</CardDescription>
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

export function MasterDashboard() {
  const { data: session } = useSession();
  const { stats, loading } = useDashboardData();
  const { t } = useDivineParsing(["master"]);

  const masterQuickActions: QuickAction[] = useMemo(() => [
    // Core Master Functions
    {
      id: "system-overview",
      title: t("master.system_overview.title"),
      description: t("master.system_overview.subtitle"),
      icon: Activity,
      href: "/master/system-overview",
      category: "Core",
    },
    {
      id: "institution-creation",
      title: t("master.actions.institution_provisioning.title"),
      description: t("master.actions.institution_provisioning.description"),
      icon: Building2,
      href: "/master/institution-creation",
      category: "Core",
    },
    {
      id: "user-management",
      title: t("master.user_management.title"),
      description: t("master.actions.user_management.description"),
      icon: Users,
      href: "/master/user-management",
      category: "Core",
    },
    {
      id: "database-tools",
      title: t("master.actions.database_tools.title"),
      description: t("master.actions.database_tools.description"),
      icon: Database,
      href: "/master/database-tools",
      category: "Core",
    },
    {
      id: "security-center",
      title: t("master.actions.security_center.title"),
      description: t("master.actions.security_center.description"),
      icon: Shield,
      href: "/master/security-center",
      category: "Core",
    },

    // Advanced Administration
    {
      id: "advanced-admin",
      title: t("master.actions.advanced_admin.title"),
      description: t("master.actions.advanced_admin.description"),
      icon: Crown,
      href: "/master/god-mode",
      variant: "secondary",
      category: "Advanced",
    },
  ], [t]);

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

  return (
    <MasterPageTemplate
      title={t("master.dashboard.title")}
      subtitle={t("master.dashboard.welcome").replace("{name}", session?.user?.name || "Administrator")}
      context="MASTER_DASHBOARD"
    >
      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {t("master.quick_actions.title")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("master.quick_actions.subtitle")}
        </p>
        <MasterActionCard
          title=""
          description=""
          actions={quickActions}
          columns={4}
        />
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SystemHealthCard stats={stats} />
        <LocalMasterStatsCard stats={stats} loading={loading} />
        <SecurityAlertsCard stats={stats} />
      </div>
    </MasterPageTemplate>
  );
}
