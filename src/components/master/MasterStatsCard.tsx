"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  BarChart3,
  Users,
  Database,
  Server,
  TrendingUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    uptime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    storageUsed: number;
    storageTotal: number;
  };
  server: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

export function MasterStatsCard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "24h",
  );

  // Mock system metrics data
  useEffect(() => {
    const mockMetrics: SystemMetrics = {
      users: {
        total: 1247,
        active: 892,
        newToday: 23,
        growth: 12.5,
      },
      performance: {
        responseTime: 145,
        throughput: 15420,
        uptime: 99.97,
        errorRate: 0.02,
      },
      database: {
        connections: 45,
        queryTime: 23,
        storageUsed: 2.4,
        storageTotal: 10,
      },
      server: {
        cpu: 34,
        memory: 67,
        disk: 45,
        network: 23,
      },
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  const storagePercentage = useMemo(() => {
    if (!metrics) return 0;
    return Math.round(
      (metrics.database.storageUsed / metrics.database.storageTotal) * 100,
    );
  }, [metrics]);

  const getMetricColor = (
    value: number,
    thresholds: { good: number; warning: number },
  ) => {
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded mb-2" />
            <div className="h-4 w-80 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <BarChart3 className="h-6 w-6" />
            System Statistics Dashboard
          </CardTitle>
          <CardDescription>
            Real-time system performance metrics and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {(["1h", "24h", "7d", "30d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatNumber(metrics.users.total)}
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(metrics.users.active)}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                +{metrics.users.newToday}
              </div>
              <div className="text-sm text-muted-foreground">New Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{metrics.users.growth}%
              </div>
              <div className="text-sm text-muted-foreground">Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className={cn(
                  "text-2xl font-bold",
                  getMetricColor(metrics.performance.responseTime, {
                    good: 100,
                    warning: 200,
                  }),
                )}
              >
                {metrics.performance.responseTime}ms
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(metrics.performance.throughput)}
              </div>
              <div className="text-sm text-muted-foreground">Requests/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.performance.uptime}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.performance.errorRate}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database & Server Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Connections</span>
              <span className="font-semibold">
                {metrics.database.connections}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg Query Time</span>
              <span className="font-semibold">
                {metrics.database.queryTime}ms
              </span>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Storage</span>
                <span className="text-sm">
                  {metrics.database.storageUsed}GB /{" "}
                  {metrics.database.storageTotal}GB
                </span>
              </div>
              <Progress value={storagePercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {storagePercentage}% used
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm">{metrics.server.cpu}%</span>
              </div>
              <Progress value={metrics.server.cpu} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm">{metrics.server.memory}%</span>
              </div>
              <Progress value={metrics.server.memory} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Disk Usage</span>
                <span className="text-sm">{metrics.server.disk}%</span>
              </div>
              <Progress value={metrics.server.disk} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Network I/O</span>
                <span className="text-sm">{metrics.server.network}%</span>
              </div>
              <Progress value={metrics.server.network} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">1,247</div>
              <div className="text-xs text-muted-foreground">
                Active Sessions
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-green-600">15,420</div>
              <div className="text-xs text-muted-foreground">API Calls</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-purple-600">23</div>
              <div className="text-xs text-muted-foreground">
                Background Jobs
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-orange-600">0</div>
              <div className="text-xs text-muted-foreground">Failed Jobs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
