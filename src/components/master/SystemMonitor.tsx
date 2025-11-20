"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  activeUsers: number;
  requestsPerSecond: number;
  errorRate: number;
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 12,
    uptime: "99.99%",
    activeUsers: 1247,
    requestsPerSecond: 89,
    errorRate: 0.01,
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(
          20,
          Math.min(90, prev.memory + (Math.random() - 0.5) * 5),
        ),
        network: Math.max(
          5,
          Math.min(50, prev.network + (Math.random() - 0.5) * 8),
        ),
        requestsPerSecond: Math.max(
          50,
          Math.min(150, prev.requestsPerSecond + (Math.random() - 0.5) * 20),
        ),
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (
    value: number,
    thresholds: { warning: number; critical: number },
  ) => {
    if (value >= thresholds.critical) return "text-red-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-red-500";
    if (value >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Last Update */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</div>
            <Progress value={metrics.cpu} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">4 cores active</p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memory.toFixed(1)}%
            </div>
            <Progress value={metrics.memory} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              8GB / 12GB used
            </p>
          </CardContent>
        </Card>

        {/* Disk Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.disk.toFixed(1)}%</div>
            <Progress value={metrics.disk} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              225GB / 500GB used
            </p>
          </CardContent>
        </Card>

        {/* Network I/O */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.network.toFixed(1)} MB/s
            </div>
            <Progress value={(metrics.network / 50) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Bandwidth utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Request Performance
            </CardTitle>
            <CardDescription>
              Real-time request handling metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requests/sec</span>
              <span className="text-2xl font-bold">
                {metrics.requestsPerSecond}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <span
                className={`text-sm font-medium ${getStatusColor(metrics.errorRate * 100, { warning: 1, critical: 5 })}`}
              >
                {metrics.errorRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Users</span>
              <span className="text-2xl font-bold">
                {metrics.activeUsers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Overall system status and uptime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-muted-foreground">
                  Online - 99.9% uptime
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">API Gateway</div>
                <div className="text-sm text-muted-foreground">
                  45ms response time
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium">Cache Layer</div>
                <div className="text-sm text-muted-foreground">
                  Next purge: 2h
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">CDN Global</div>
                <div className="text-sm text-muted-foreground">
                  12 nodes active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common system monitoring actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Metrics
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Check System Logs
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Security Scan
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              User Activity Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
