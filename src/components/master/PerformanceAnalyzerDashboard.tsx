"use client";

import React, { useMemo } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TrendingUp,
  Cpu,
  HardDrive,
  Zap,
  Database,
  Globe,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  change: string;
}

interface Bottleneck {
  component: string;
  issue: string;
  impact: "low" | "medium" | "high";
  recommendation: string;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    label: "Response Time",
    value: 245,
    unit: "ms",
    status: "good",
    trend: "down",
    change: "-12%",
  },
  {
    label: "CPU Usage",
    value: 23,
    unit: "%",
    status: "good",
    trend: "stable",
    change: "+2%",
  },
  {
    label: "Memory Usage",
    value: 67,
    unit: "%",
    status: "warning",
    trend: "up",
    change: "+8%",
  },
  {
    label: "Network I/O",
    value: 12,
    unit: "MB/s",
    status: "good",
    trend: "stable",
    change: "-3%",
  },
  {
    label: "Database Queries/sec",
    value: 89,
    unit: "qps",
    status: "good",
    trend: "up",
    change: "+15%",
  },
  {
    label: "Error Rate",
    value: 0.01,
    unit: "%",
    status: "good",
    trend: "down",
    change: "-50%",
  },
];

const bottlenecks: Bottleneck[] = [
  {
    component: "Database",
    issue: "Slow query on user analytics table",
    impact: "medium",
    recommendation: "Add composite index on (user_id, timestamp)",
  },
  {
    component: "Memory",
    issue: "High memory usage in cache layer",
    impact: "low",
    recommendation: "Implement LRU cache eviction policy",
  },
  {
    component: "Network",
    issue: "Latency spikes during peak hours",
    impact: "high",
    recommendation: "Implement CDN edge caching",
  },
];

function PerformanceOverviewCard() {
  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Resumen de Rendimiento
        </CardTitle>
        <CardDescription>
          Métricas críticas de rendimiento del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {performanceMetrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg"
            >
              <div
                className={`text-2xl font-bold ${
                  metric.status === "good"
                    ? "text-green-600"
                    : metric.status === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {metric.value}
                {metric.unit}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
              <div
                className={`text-xs flex items-center justify-center gap-1 ${
                  metric.trend === "up"
                    ? "text-green-600"
                    : metric.trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${
                    metric.trend === "down" ? "rotate-180" : ""
                  }`}
                />
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemResourcesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Recursos del Sistema
        </CardTitle>
        <CardDescription>
          Monitoreo de recursos del sistema en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">CPU Usage</span>
              <span className="text-sm">23%</span>
            </div>
            <Progress value={23} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm">67%</span>
            </div>
            <Progress value={67} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Disk Usage</span>
              <span className="text-sm">45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Network I/O</span>
              <span className="text-sm">12 MB/s</span>
            </div>
            <Progress value={30} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BottlenecksAnalysisCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Análisis de Cuellos de Botella
        </CardTitle>
        <CardDescription>
          Identificación y recomendaciones para optimización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bottlenecks.map((bottleneck, index) => (
            <Alert
              key={index}
              className={`${
                bottleneck.impact === "high"
                  ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                  : bottleneck.impact === "medium"
                    ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                    : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  bottleneck.impact === "high"
                    ? "text-red-600"
                    : bottleneck.impact === "medium"
                      ? "text-yellow-600"
                      : "text-blue-600"
                }`}
              />
              <AlertTitle
                className={`${
                  bottleneck.impact === "high"
                    ? "text-red-800 dark:text-red-200"
                    : bottleneck.impact === "medium"
                      ? "text-yellow-800 dark:text-yellow-200"
                      : "text-blue-800 dark:text-blue-200"
                }`}
              >
                {bottleneck.component} -{" "}
                {bottleneck.impact.charAt(0).toUpperCase() +
                  bottleneck.impact.slice(1)}{" "}
                Impact
              </AlertTitle>
              <AlertDescription
                className={`${
                  bottleneck.impact === "high"
                    ? "text-red-700 dark:text-red-300"
                    : bottleneck.impact === "medium"
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-blue-700 dark:text-blue-300"
                }`}
              >
                <div className="space-y-2">
                  <p>
                    <strong>Issue:</strong> {bottleneck.issue}
                  </p>
                  <p>
                    <strong>Recommendation:</strong> {bottleneck.recommendation}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OptimizationToolsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Herramientas de Optimización
        </CardTitle>
        <CardDescription>
          Utilidades para mejorar el rendimiento del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Database className="h-6 w-6" />
            <span>Database Optimization</span>
            <span className="text-xs text-muted-foreground">
              Optimizar queries e índices
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <HardDrive className="h-6 w-6" />
            <span>Cache Optimization</span>
            <span className="text-xs text-muted-foreground">
              Mejorar estrategia de cache
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Globe className="h-6 w-6" />
            <span>CDN Configuration</span>
            <span className="text-xs text-muted-foreground">
              Configurar distribución global
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Activity className="h-6 w-6" />
            <span>Load Balancing</span>
            <span className="text-xs text-muted-foreground">
              Balanceo de carga avanzado
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceReportsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Reportes de Rendimiento
        </CardTitle>
        <CardDescription>
          Reportes históricos y tendencias de rendimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-muted-foreground">
                Uptime (30 días)
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">245ms</div>
              <div className="text-sm text-muted-foreground">
                Avg Response Time
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Tendencias
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceAnalyzerDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Performance Analyzer Header */}

      {/* Performance Analysis Sections */}
      <div className="space-y-6">
        <SystemResourcesCard />
        <BottlenecksAnalysisCard />
        <OptimizationToolsCard />
        <PerformanceReportsCard />
      </div>
    </div>
  );
}
