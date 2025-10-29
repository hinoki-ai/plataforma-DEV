"use client";

import React from "react";
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
  Crown,
  Shield,
  Settings,
  Users,
  Database,
  Lock,
  Eye,
  Download,
  Upload,
  AlertTriangle,
  Activity,
  Zap,
  Globe,
  Key,
  UserCog,
} from "lucide-react";
import { useRoleAccess } from "@/components/auth/RoleGuard";
import { MasterPermissions } from "@/lib/authorization";

export function MasterGodModeDashboard() {
  const roleAccess = useRoleAccess();

  // Only render for MASTER users
  if (!roleAccess.hasMasterGodMode) {
    return null;
  }

  const godModeFeatures = [
    {
      icon: Crown,
      title: "SYSTEM GOD MODE",
      description: "Ultimate system control and oversight",
      permission: MasterPermissions.SYSTEM_GOD_MODE,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      icon: Globe,
      title: "GLOBAL OVERSIGHT",
      description: "Cross-website administration and monitoring",
      permission: MasterPermissions.GLOBAL_OVERSIGHT,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Settings,
      title: "SYSTEM CONFIGURATION",
      description: "Configure system settings and parameters",
      permission: MasterPermissions.SYSTEM_CONFIGURATION,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: Eye,
      title: "MASTER AUDIT ACCESS",
      description: "Complete audit logs and system monitoring",
      permission: MasterPermissions.AUDIT_MASTER_ACCESS,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: UserCog,
      title: "USER ROLE OVERRIDE",
      description: "Override and modify any user role",
      permission: MasterPermissions.USER_ROLE_OVERRIDE,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      icon: Database,
      title: "DATA MASTER EXPORT",
      description: "Export all system data and records",
      permission: MasterPermissions.DATA_MASTER_EXPORT,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: Shield,
      title: "BACKUP MASTER CONTROL",
      description: "Master control over system backups",
      permission: MasterPermissions.BACKUP_MASTER_CONTROL,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      icon: Lock,
      title: "EMERGENCY LOCKDOWN",
      description: "Emergency system lockdown capabilities",
      permission: MasterPermissions.EMERGENCY_LOCKDOWN,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: Key,
      title: "SECURITY MASTER OVERRIDE",
      description: "Override security measures and controls",
      permission: MasterPermissions.SECURITY_MASTER_OVERRIDE,
      color: "text-gray-500",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
    },
    {
      icon: Activity,
      title: "GLOBAL METRICS VIEW",
      description: "Global system metrics and analytics",
      permission: MasterPermissions.METRICS_GLOBAL_VIEW,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
    },
    {
      icon: Zap,
      title: "CONFIG MASTER RESET",
      description: "Master configuration reset capabilities",
      permission: MasterPermissions.CONFIG_MASTER_RESET,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* MASTER God Mode Header */}
      <Card className="border-yellow-200 bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                🏛️ SUPREMO MASTER GOD MODE
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Ultimate Authority - Complete System Control
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="ml-auto bg-yellow-100 text-yellow-800"
            >
              Almighty Access
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {godModeFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className={`border-2 ${feature.bgColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ENABLED
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            MASTER Almighty Actions
          </CardTitle>
          <CardDescription>
            Supreme authority controls and emergency functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm font-medium">Global Audit</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">User Override</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Database className="h-6 w-6" />
              <span className="text-sm font-medium">Data Export</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm font-medium">Emergency Lock</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Oversight
          </CardTitle>
          <CardDescription>
            Real-time monitoring across all websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">System Status</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ALL SYSTEMS OPERATIONAL
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">47</div>
                <div className="text-sm text-muted-foreground">
                  Active Websites
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">12,847</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
