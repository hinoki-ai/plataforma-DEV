"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";
import { MasterMetricsCard } from "./MasterMetricsCard";

export function PerformanceMetricsCard() {
  const metrics = [
    {
      id: "cpu-usage",
      label: "CPU Usage",
      value: "23%",
      progress: 23,
      status: "good" as const,
      unit: "%",
    },
    {
      id: "memory-usage",
      label: "Memory Usage",
      value: "67%",
      progress: 67,
      status: "warning" as const,
      unit: "%",
    },
    {
      id: "network-io",
      label: "Network I/O",
      value: "12 MB/s",
      progress: 45,
      status: "good" as const,
    },
  ];

  const summaryStats = [
    {
      id: "active-connections",
      label: "Conexiones Activas",
      value: "1,247",
      status: "good" as const,
    },
    {
      id: "response-time",
      label: "Tiempo de Respuesta",
      value: "45ms",
      status: "good" as const,
    },
    {
      id: "uptime",
      label: "Disponibilidad",
      value: "99.97%",
      status: "good" as const,
    },
  ];

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Activity className="h-5 w-5" />
          Métricas de Rendimiento en Tiempo Real
        </CardTitle>
        <CardDescription className="text-green-600 dark:text-green-400">
          Monitoreo continuo del sistema - Actualización automática cada 30
          segundos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Performance Metrics */}
          <MasterMetricsCard
            title=""
            description=""
            metrics={metrics}
            className="border-0 bg-transparent shadow-none"
          />

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summaryStats.map((stat) => (
              <div
                key={stat.id}
                className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg"
              >
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
