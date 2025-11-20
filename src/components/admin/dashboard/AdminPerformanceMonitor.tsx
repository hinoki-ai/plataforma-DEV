"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface PerformanceMetrics {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  network: {
    requests: number;
    latency: number;
    errors: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  timestamp: Date;
  resolved?: boolean;
}

export function AdminPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mock performance data (in production, this would come from your monitoring service)
  const generateMockMetrics = (): PerformanceMetrics => ({
    timestamp: Date.now(),
    memory: {
      used: Math.floor(Math.random() * 1024) + 512, // 512-1536MB
      total: 2048,
      percentage: Math.floor(Math.random() * 30) + 40, // 40-70%
    },
    cpu: {
      usage: Math.floor(Math.random() * 40) + 20, // 20-60%
      cores: 4,
    },
    network: {
      requests: Math.floor(Math.random() * 1000) + 500, // 500-1500 req/min
      latency: Math.floor(Math.random() * 100) + 20, // 20-120ms
      errors: Math.floor(Math.random() * 10), // 0-10 errors
    },
    cache: {
      hits: Math.floor(Math.random() * 1000) + 800, // 800-1800 hits
      misses: Math.floor(Math.random() * 200) + 50, // 50-250 misses
      hitRate: Math.floor(Math.random() * 20) + 75, // 75-95%
    },
    database: {
      connections: Math.floor(Math.random() * 20) + 5, // 5-25 connections
      queryTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
      slowQueries: Math.floor(Math.random() * 5), // 0-5 slow queries
    },
  });

  // Generate mock alerts based on metrics
  const generateAlerts = (metrics: PerformanceMetrics): PerformanceAlert[] => {
    const alerts: PerformanceAlert[] = [];

    if (metrics.memory.percentage > 80) {
      alerts.push({
        id: "memory-high",
        type: "warning",
        title: "High Memory Usage",
        description: `Memory usage is at ${metrics.memory.percentage}%. Consider optimizing memory usage.`,
        timestamp: new Date(),
      });
    }

    if (metrics.cpu.usage > 70) {
      alerts.push({
        id: "cpu-high",
        type: "warning",
        title: "High CPU Usage",
        description: `CPU usage is at ${metrics.cpu.usage}%. System may be under heavy load.`,
        timestamp: new Date(),
      });
    }

    if (metrics.network.latency > 100) {
      alerts.push({
        id: "latency-high",
        type: "error",
        title: "High Network Latency",
        description: `Network latency is ${metrics.network.latency}ms. Check network connectivity.`,
        timestamp: new Date(),
      });
    }

    if (metrics.database.slowQueries > 3) {
      alerts.push({
        id: "slow-queries",
        type: "warning",
        title: "Slow Database Queries",
        description: `${metrics.database.slowQueries} slow queries detected. Consider query optimization.`,
        timestamp: new Date(),
      });
    }

    if (metrics.cache.hitRate < 70) {
      alerts.push({
        id: "cache-efficiency",
        type: "info",
        title: "Low Cache Hit Rate",
        description: `Cache hit rate is ${metrics.cache.hitRate}%. Consider cache optimization.`,
        timestamp: new Date(),
      });
    }

    return alerts;
  };

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);

      // In production, this would fetch from your monitoring API
      // const response = await fetch('/api/admin/performance');
      // const data = await response.json();

      // For now, use mock data
      const mockMetrics = generateMockMetrics();
      const mockAlerts = generateAlerts(mockMetrics);

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      setAlerts([
        {
          id: "fetch-error",
          type: "error",
          title: "Monitoring Error",
          description:
            "Failed to fetch performance data. Please check monitoring service.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();

    // Update every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate performance scores
  const performanceScore = useMemo(() => {
    if (!metrics) return { score: 0, grade: "N/A", status: "unknown" };

    const weights = {
      memory: 0.2,
      cpu: 0.25,
      network: 0.2,
      cache: 0.15,
      database: 0.2,
    };

    const memoryScore = Math.max(0, 100 - metrics.memory.percentage);
    const cpuScore = Math.max(0, 100 - metrics.cpu.usage);
    const networkScore = Math.max(0, 100 - metrics.network.latency / 2);
    const cacheScore = metrics.cache.hitRate;
    const databaseScore = Math.max(0, 100 - metrics.database.queryTime / 2);

    const totalScore =
      memoryScore * weights.memory +
      cpuScore * weights.cpu +
      networkScore * weights.network +
      cacheScore * weights.cache +
      databaseScore * weights.database;

    let grade: string;
    let status: "excellent" | "good" | "warning" | "critical";

    if (totalScore >= 90) {
      grade = "A";
      status = "excellent";
    } else if (totalScore >= 80) {
      grade = "B";
      status = "good";
    } else if (totalScore >= 70) {
      grade = "C";
      status = "warning";
    } else {
      grade = "F";
      status = "critical";
    }

    return { score: Math.round(totalScore), grade, status };
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading && !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Monitoreo de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monitoreo de Rendimiento
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(performanceScore.status)}>
                Calificación: {performanceScore.grade} ({performanceScore.score}
                %)
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPerformanceData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Memory Usage */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <HardDrive className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Memoria</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metrics.memory.used}MB
              </div>
              <Progress
                value={metrics.memory.percentage}
                className="h-2 mb-1"
              />
              <div className="text-xs text-muted-foreground">
                {metrics.memory.percentage}% de {metrics.memory.total}MB
              </div>
            </div>

            {/* CPU Usage */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Cpu className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metrics.cpu.usage}%
              </div>
              <Progress value={metrics.cpu.usage} className="h-2 mb-1" />
              <div className="text-xs text-muted-foreground">
                {metrics.cpu.cores} núcleos
              </div>
            </div>

            {/* Network */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Wifi className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium">Red</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metrics.network.requests}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {metrics.network.latency}ms latencia
              </div>
              <div className="text-xs text-red-500">
                {metrics.network.errors} errores
              </div>
            </div>

            {/* Cache */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-sm font-medium">Cache</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metrics.cache.hitRate}%
              </div>
              <div className="text-xs text-muted-foreground">
                {metrics.cache.hits} hits / {metrics.cache.misses} misses
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Rendimiento de Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.database.connections}
              </div>
              <div className="text-sm text-muted-foreground">
                Conexiones Activas
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics.database.queryTime}ms
              </div>
              <div className="text-sm text-muted-foreground">
                Tiempo Promedio
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {metrics.database.slowQueries}
              </div>
              <div className="text-sm text-muted-foreground">
                Consultas Lentas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alert.type === "error"
                      ? "bg-red-50 border-red-200"
                      : alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                  }`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {alert.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendencias de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Métricas Principales</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Disponibilidad del Sistema</span>
                  <Badge variant="secondary">99.9%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo de Respuesta</span>
                  <Badge variant="secondary">{metrics.network.latency}ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Eficiencia de Cache</span>
                  <Badge variant="secondary">{metrics.cache.hitRate}%</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recomendaciones</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {metrics.memory.percentage > 70 && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500 mt-0.5" />
                    <span>Considere optimizar el uso de memoria</span>
                  </div>
                )}
                {metrics.cache.hitRate < 80 && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>Mejore la estrategia de cache</span>
                  </div>
                )}
                {metrics.cpu.usage > 60 && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span>Monitoree el uso de CPU</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
