"use client";

/**
 * =======================================================================
 * MASTER DASHBOARD - ENGLISH ONLY - CRITICAL RULE
 * =======================================================================
 *
 * ⚠️  CRITICAL REQUIREMENT: This component MUST remain English-only.
 *    This is a strict rule that CANNOT be broken under any circumstances.
 *
 * REASONS FOR ENGLISH-ONLY POLICY:
 * - Master dashboard is only used by system administrators/developers
 * - i18n adds unnecessary complexity, maintenance overhead, and disk usage
 * - Translation quality for technical admin interfaces is not critical
 * - Avoids wasting developer time on translating technical terminology
 * - Reduces bundle size and improves performance
 *
 * STRICT PROHIBITIONS:
 * ❌ DO NOT add i18n, useDivineParsing, or translation hooks
 * ❌ DO NOT add useLanguage or any translation utilities
 * ❌ DO NOT internationalize any text in this component
 * ✅ All text must remain hardcoded in English
 * ✅ Future developers: Follow this rule without exception
 *
 * If you need to add new text, hardcode it in English only.
 * =======================================================================
 */

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
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNotifications } from "@/hooks/useNotifications";
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
  Wifi,
  WifiOff,
} from "lucide-react";
import { MasterPageTemplate } from "./MasterPageTemplate";
import { MasterActionCard } from "./MasterActionCard";

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
    overall: "Overall Status",
    database: "Database",
    api: "API Performance",
    security: "Security Alerts", // Using title as label for now
    performance: "Performance Metrics",
  };

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
            System Status: {stats?.system?.status || "Unknown"} - Uptime:{" "}
            {stats?.system?.uptime
              ? `${Math.floor(stats.system.uptime / 3600)}h`
              : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function LocalMasterStatsCard({
  stats,
  loading,
}: {
  stats: any;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">
              Loading statistics...
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
              {stats.users?.breakdown?.profesor || 0}
            </div>
            <div className="text-sm text-muted-foreground">Teachers</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.database?.connectionPoolSize || 0}
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

function SecurityAlertsCard({ stats }: { stats: any }) {
  const alerts = useMemo(
    () => [
      {
        id: 1,
        type: "warning",
        message: `Active Threats: ${stats?.security?.activeThreats || 0}`,
        time: "Live",
        severity: (stats?.security?.activeThreats || 0) > 0 ? "high" : "low",
      },
      {
        id: 2,
        type: "info",
        message: `Blocked Attempts: ${stats?.security?.blockedAttempts || 0}`,
        time: "Last 24h",
        severity: "medium",
      },
      {
        id: 3,
        type: "success",
        message: `Security Score: ${stats?.security?.securityScore || "N/A"}`,
        time: "Current",
        severity: "low",
      },
    ],
    [stats],
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

export function MasterDashboard() {
  const { data: session } = useSession();
  const { stats: initialStats, loading: initialLoading } = useDashboardData();
  const { dashboardData, error: sseError } = useNotifications();

  // Use real-time data if available, otherwise fall back to initial data
  const stats = dashboardData || initialStats;
  const loading = initialLoading && !dashboardData;
  const isRealTime = !!dashboardData;

  const masterQuickActions: QuickAction[] = useMemo(
    () => [
      // Core Master Functions
      {
        id: "system-overview",
        title: "System Overview",
        description:
          "Comprehensive system monitoring and performance analytics",
        icon: Activity,
        href: "/master/system-overview",
        category: "Core",
      },
      {
        id: "institution-creation",
        title: "New Institution",
        description: "Create new institution",
        icon: Building2,
        href: "/master/institution-creation",
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

      // Advanced Administration
      {
        id: "advanced-admin",
        title: "Advanced Administration",
        description: "Full system control and monitoring",
        icon: Crown,
        href: "/master/god-mode",
        variant: "secondary",
        category: "Advanced",
      },
    ],
    [],
  );

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
      title="Master Dashboard"
      subtitle={
        <div className="flex items-center gap-2">
          <span>Welcome, {session?.user?.name || "Administrator"}</span>
          <Badge
            variant={isRealTime ? "default" : "secondary"}
            className={`text-xs ${
              isRealTime
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {isRealTime ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Static
              </>
            )}
          </Badge>
          {sseError && (
            <Badge variant="destructive" className="text-xs">
              SSE Error
            </Badge>
          )}
        </div>
      }
      context="MASTER_DASHBOARD"
    >
      {/* Quick Actions */}
      <div className="mb-6">
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
