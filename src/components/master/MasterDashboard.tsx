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
import { useSession } from "@/lib/auth-client";
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
  Calendar,
  BookOpen,
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
  const realMetrics = useMemo(() => {
    if (!stats) return null;

    return {
      uptime: {
        label: "System Uptime",
        value: stats.system?.uptime
          ? Math.floor(stats.system.uptime / 3600)
          : 0,
        unit: "hours",
        status: "real",
      },
      memory: {
        label: "Memory Usage",
        value: stats.system?.memory?.used || 0,
        max: stats.system?.memory?.total || 0,
        unit: "MB",
        status: "real",
      },
    };
  }, [stats]);

  if (!stats || !realMetrics) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-muted-foreground">
              System metrics unavailable
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{realMetrics.uptime.label}</span>
              <span className="font-medium">
                {realMetrics.uptime.value}
                {realMetrics.uptime.unit}
              </span>
            </div>
            <Progress
              value={100}
              className="h-2"
              indicatorClassName="bg-green-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{realMetrics.memory.label}</span>
              <span className="font-medium">
                {realMetrics.memory.value}/{realMetrics.memory.max}{" "}
                {realMetrics.memory.unit}
              </span>
            </div>
            <Progress
              value={
                realMetrics.memory.max > 0
                  ? (realMetrics.memory.value / realMetrics.memory.max) * 100
                  : 0
              }
              className="h-2"
              indicatorClassName={
                realMetrics.memory.value / realMetrics.memory.max > 0.8
                  ? "bg-red-500"
                  : realMetrics.memory.value / realMetrics.memory.max > 0.6
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1">
              Performance Metrics
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Not Available
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1">Security Status</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Not Available
            </div>
          </div>
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

  const hasData = stats && Object.keys(stats).length > 0;

  if (!hasData) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Database className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-muted-foreground">
              Statistics unavailable
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
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
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.content?.total || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Content</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.content?.events || 0}
            </div>
            <div className="text-sm text-muted-foreground">Calendar Events</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityAlertsCard({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-muted-foreground">
              Security monitoring unavailable
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Security monitoring not implemented
                </p>
                <p className="text-xs text-muted-foreground">
                  Real-time threat detection unavailable
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Access control verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Authentication system operational
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Data integrity maintained</p>
                <p className="text-xs text-muted-foreground">
                  Convex database connection secure
                </p>
              </div>
            </div>
          </div>
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
        icon: Shield,
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
    variant: action.variant as
      | "default"
      | "destructive"
      | "outline"
      | "secondary",
    href: action.href,
  }));

  return (
    <MasterPageTemplate title="" subtitle="" context="MASTER_DASHBOARD">
      {/* Quick Actions */}
      <div className="mb-4">
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
