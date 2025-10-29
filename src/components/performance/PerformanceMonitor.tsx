"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Zap,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
}

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export function PerformanceMonitor({
  className,
  showDetails = false,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    errorRate: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Track initial load time
    if (typeof window !== "undefined" && window.performance) {
      const navigation = window.performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMetrics((prev) => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
        }));
      }
    }

    // Track memory usage if available
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory;
      setMetrics((prev) => ({
        ...prev,
        memoryUsage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      }));
    }

    setRenderCount((prev) => prev + 1);
  });

  const startMonitoring = () => {
    setIsMonitoring(true);
    startTimeRef.current = Date.now();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    const endTime = Date.now();
    setMetrics((prev) => ({
      ...prev,
      renderTime: endTime - startTimeRef.current,
    }));
  };

  const getPerformanceGrade = (
    metric: number,
    thresholds: { good: number; warning: number },
  ) => {
    if (metric <= thresholds.good)
      return {
        grade: "good",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (metric <= thresholds.warning)
      return {
        grade: "warning",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return { grade: "poor", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const loadTimeGrade = getPerformanceGrade(metrics.loadTime, {
    good: 2000,
    warning: 5000,
  });
  const apiTimeGrade = getPerformanceGrade(metrics.apiResponseTime, {
    good: 500,
    warning: 2000,
  });
  const memoryGrade = getPerformanceGrade(metrics.memoryUsage, {
    good: 70,
    warning: 85,
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Monitor de Rendimiento
          {isMonitoring && (
            <Badge variant="secondary" className="ml-auto">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Monitoreando
              </div>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg border">
            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold">
              {(metrics.loadTime / 1000).toFixed(2)}s
            </div>
            <div className="text-xs text-muted-foreground">Tiempo de carga</div>
            <Badge
              variant="secondary"
              className={`mt-1 text-xs ${loadTimeGrade.bgColor} ${loadTimeGrade.color}`}
            >
              {loadTimeGrade.grade === "good"
                ? "Excelente"
                : loadTimeGrade.grade === "warning"
                  ? "Bueno"
                  : "Lento"}
            </Badge>
          </div>

          <div className="text-center p-3 rounded-lg border">
            <Zap className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold">{metrics.apiResponseTime}ms</div>
            <div className="text-xs text-muted-foreground">Respuesta API</div>
            <Badge
              variant="secondary"
              className={`mt-1 text-xs ${apiTimeGrade.bgColor} ${apiTimeGrade.color}`}
            >
              {apiTimeGrade.grade === "good"
                ? "Rápido"
                : apiTimeGrade.grade === "warning"
                  ? "Normal"
                  : "Lento"}
            </Badge>
          </div>

          <div className="text-center p-3 rounded-lg border">
            <Database className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold">
              {metrics.memoryUsage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Uso de memoria</div>
            <Badge
              variant="secondary"
              className={`mt-1 text-xs ${memoryGrade.bgColor} ${memoryGrade.color}`}
            >
              {memoryGrade.grade === "good"
                ? "Óptimo"
                : memoryGrade.grade === "warning"
                  ? "Alto"
                  : "Crítico"}
            </Badge>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasa de aciertos de caché</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.cacheHitRate} className="w-20 h-2" />
                <span className="text-sm font-medium">
                  {metrics.cacheHitRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Tasa de errores</span>
              <div className="flex items-center gap-2">
                <Progress
                  value={Math.min(metrics.errorRate, 100)}
                  className="w-20 h-2"
                />
                <span className="text-sm font-medium">
                  {metrics.errorRate.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Renders del componente</span>
              <span className="text-sm font-medium">{renderCount}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className="flex-1"
          >
            {isMonitoring ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Detener
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Iniciar Monitoreo
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Recargar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
