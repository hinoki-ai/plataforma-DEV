"use client";

/**
 * PERFORMANCE ANALYZER DASHBOARD - ENGLISH ONLY
 *
 * CRITICAL RULE: This component MUST remain English-only and hardcoded.
 * No translations, i18n hooks, or internationalization allowed.
 *
 * This is a strict requirement that cannot be broken for:
 * - Master dashboard consistency
 * - Technical admin interface standards
 * - Performance optimization
 * - Avoiding translation overhead for system administrators
 *
 * If you need to add text, hardcode it in English only.
 * DO NOT add useDivineParsing, useLanguage, or any translation hooks.
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Timer,
} from "lucide-react";

interface PerformanceMetrics {
  system: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  database: {
    connections: number;
    queriesPerSecond: number;
    slowQueries: number;
    cacheHitRate: number;
  };
  api: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  realtime: {
    activeConnections: number;
    messageRate: number;
    latency: number;
  };
}

const mockMetrics: PerformanceMetrics = {
  system: {
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 12,
  },
  database: {
    connections: 156,
    queriesPerSecond: 1247,
    slowQueries: 3,
    cacheHitRate: 94.2,
  },
  api: {
    responseTime: 145,
    throughput: 892,
    errorRate: 0.02,
    uptime: 99.98,
  },
  realtime: {
    activeConnections: 234,
    messageRate: 1567,
    latency: 23,
  },
};

export function PerformanceAnalyzerDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(mockMetrics);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to refresh metrics
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real implementation, this would fetch fresh metrics
      setMetrics({
        ...mockMetrics,
        system: {
          ...mockMetrics.system,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
        },
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (
    value: number,
    thresholds: { warning: number; critical: number },
  ) => {
    if (value >= thresholds.critical) return "destructive";
    if (value >= thresholds.warning) return "secondary";
    return "default";
  };

  const getStatusIcon = (
    value: number,
    thresholds: { warning: number; critical: number },
  ) => {
    if (value >= thresholds.critical)
      return <AlertTriangle className="h-4 w-4" />;
    if (value >= thresholds.warning) return <TrendingUp className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time system performance monitoring and analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            onClick={refreshMetrics}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Performance
          </CardTitle>
          <CardDescription>Current system resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU</span>
                {getStatusIcon(metrics.system.cpu, {
                  warning: 70,
                  critical: 90,
                })}
              </div>
              <Progress value={metrics.system.cpu} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {metrics.system.cpu.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory</span>
                {getStatusIcon(metrics.system.memory, {
                  warning: 80,
                  critical: 95,
                })}
              </div>
              <Progress value={metrics.system.memory} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {metrics.system.memory.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk</span>
                {getStatusIcon(metrics.system.disk, {
                  warning: 85,
                  critical: 95,
                })}
              </div>
              <Progress value={metrics.system.disk} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {metrics.system.disk.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                {getStatusIcon(metrics.system.network, {
                  warning: 70,
                  critical: 90,
                })}
              </div>
              <Progress value={metrics.system.network} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {metrics.system.network.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Database Performance
            </CardTitle>
            <CardDescription>
              Database connections and query performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Active Connections
                </div>
                <div className="text-2xl font-bold">
                  {metrics.database.connections}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Queries/sec</div>
                <div className="text-2xl font-bold">
                  {metrics.database.queriesPerSecond}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Slow Queries
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.database.slowQueries}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Cache Hit Rate
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.database.cacheHitRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              API Performance
            </CardTitle>
            <CardDescription>API response times and throughput</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Avg Response Time
                </div>
                <div className="text-2xl font-bold">
                  {metrics.api.responseTime}ms
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Throughput</div>
                <div className="text-2xl font-bold">
                  {metrics.api.throughput}/sec
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Error Rate</div>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.api.errorRate}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Uptime</div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.api.uptime}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Real-time Systems
          </CardTitle>
          <CardDescription>
            WebSocket connections and real-time messaging performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/10">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.realtime.activeConnections}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Connections
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/10">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.realtime.messageRate}
              </div>
              <div className="text-sm text-muted-foreground">Messages/sec</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/10">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.realtime.latency}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Latency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Alerts
          </CardTitle>
          <CardDescription>
            Current system alerts and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.database.slowQueries > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {metrics.database.slowQueries} slow database queries detected.
                  Consider optimizing query performance.
                </AlertDescription>
              </Alert>
            )}

            {metrics.api.responseTime > 200 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  API response time is elevated ({metrics.api.responseTime}ms).
                  Monitor for potential bottlenecks.
                </AlertDescription>
              </Alert>
            )}

            {metrics.system.cpu > 80 && (
              <Alert>
                <Cpu className="h-4 w-4" />
                <AlertDescription>
                  High CPU usage detected ({metrics.system.cpu.toFixed(1)}%).
                  Consider scaling resources.
                </AlertDescription>
              </Alert>
            )}

            {metrics.api.uptime < 99.9 && (
              <Alert>
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  System uptime is below 99.9% ({metrics.api.uptime}%).
                  Investigate recent downtime.
                </AlertDescription>
              </Alert>
            )}

            {metrics.database.slowQueries === 0 &&
              metrics.api.responseTime <= 200 &&
              metrics.system.cpu <= 80 &&
              metrics.api.uptime >= 99.9 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-700">
                    All systems performing optimally. No performance issues
                    detected.
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
