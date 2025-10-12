"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Crown, Sparkles } from "lucide-react";
import { MasterStatsCard } from "./MasterStatsCard";

interface AdminControlMetrics {
  system: {
    status: "ACTIVE" | "MAINTENANCE" | "CRITICAL";
    uptime: string;
    lastBackup: string;
    nextMaintenance: string;
  };
  authority: {
    adminActive: boolean;
    systemOverride: boolean;
    globalControl: boolean;
  };
  threats: {
    active: number;
    blocked: number;
    neutralized: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    efficiency: number;
  };
}

export function GodModeStatusCard() {
  const [adminActive, setAdminActive] = useState(true);
  const [systemOverride, setSystemOverride] = useState(false);

  const metrics: AdminControlMetrics = useMemo(
    () => ({
      system: {
        status: adminActive ? "ACTIVE" : "MAINTENANCE",
        uptime: "99.99%",
        lastBackup: "2 minutos atrás",
        nextMaintenance: "Esta noche 2:00 AM",
      },
      authority: {
        adminActive,
        systemOverride,
        globalControl: true,
      },
      threats: {
        active: 0,
        blocked: 47,
        neutralized: 12,
      },
      performance: {
        responseTime: 12,
        throughput: 99999,
        efficiency: 100,
      },
    }),
    [adminActive, systemOverride],
  );

  const systemStats = [
    {
      icon: Crown,
      value: metrics.threats.active,
      label: "Amenazas Activas",
      color: "red" as const,
    },
    {
      icon: Sparkles,
      value: metrics.threats.blocked,
      label: "Bloqueadas",
      color: "green" as const,
    },
    {
      icon: Crown,
      value: `${metrics.performance.responseTime}ms`,
      label: "Tiempo de Respuesta",
      color: "blue" as const,
    },
    {
      icon: Sparkles,
      value: `${metrics.performance.efficiency}%`,
      label: "Eficiencia",
      color: "purple" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Crown className="h-6 w-6" />
            Administration Control Status
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Full system control - Maximum authority level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${adminActive ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
              />
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  {adminActive ? "ADMIN ACTIVE" : "MAINTENANCE MODE"}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Uptime: {metrics.system.uptime}
                </p>
              </div>
            </div>
            <Badge variant={adminActive ? "default" : "secondary"}>
              {adminActive ? "ACTIVE" : "MAINTENANCE"}
            </Badge>
          </div>

          {/* Authority Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg">
              <span className="text-sm font-medium">Admin Mode</span>
              <Switch
                checked={adminActive}
                onCheckedChange={setAdminActive}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg">
              <span className="text-sm font-medium">System Override</span>
              <Switch
                checked={systemOverride}
                onCheckedChange={setSystemOverride}
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg">
              <span className="text-sm font-medium">Global Control</span>
              <Switch
                checked={true}
                disabled
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <MasterStatsCard />
    </div>
  );
}
