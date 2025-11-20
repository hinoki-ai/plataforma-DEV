"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
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
  Globe,
  MapPin,
  Users,
  Activity,
  Server,
  Database,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Zap,
  Monitor,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react";
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface GlobalNode {
  id: string;
  region: string;
  country: string;
  status: "online" | "degraded" | "offline";
  users: number;
  load: number;
  latency: number;
  lastUpdate: string;
}

interface GlobalMetrics {
  totalNodes: number;
  activeNodes: number;
  totalUsers: number;
  globalLatency: number;
  dataTransferred: string;
  uptime: string;
}

const globalNodes: GlobalNode[] = [
  {
    id: "us-east-1",
    region: "US East",
    country: "USA",
    status: "online",
    users: 1250,
    load: 45,
    latency: 12,
    lastUpdate: "2 min ago",
  },
  {
    id: "eu-west-1",
    region: "EU West",
    country: "Germany",
    status: "online",
    users: 890,
    load: 32,
    latency: 25,
    lastUpdate: "1 min ago",
  },
  {
    id: "ap-southeast-1",
    region: "AP Southeast",
    country: "Singapore",
    status: "online",
    users: 654,
    load: 28,
    latency: 45,
    lastUpdate: "3 min ago",
  },
  {
    id: "sa-east-1",
    region: "SA East",
    country: "Brazil",
    status: "degraded",
    users: 432,
    load: 67,
    latency: 89,
    lastUpdate: "5 min ago",
  },
  {
    id: "af-south-1",
    region: "AF South",
    country: "South Africa",
    status: "online",
    users: 298,
    load: 23,
    latency: 67,
    lastUpdate: "4 min ago",
  },
  {
    id: "me-central-1",
    region: "ME Central",
    country: "UAE",
    status: "online",
    users: 187,
    load: 19,
    latency: 54,
    lastUpdate: "2 min ago",
  },
];

function GlobalMapCard() {
  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Global Node Map
        </CardTitle>
        <CardDescription>
          Worldwide server and data center distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalNodes.map((node) => (
            <div
              key={node.id}
              className={`p-4 rounded-lg border-2 ${
                node.status === "online"
                  ? "border-green-200 dark:border-green-800"
                  : node.status === "degraded"
                    ? "border-yellow-200 dark:border-yellow-800"
                    : "border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-sm">{node.region}</span>
                </div>
                <div
                  className={`h-2 w-2 rounded-full ${
                    node.status === "online"
                      ? "bg-green-500"
                      : node.status === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Country:</span>
                  <span>{node.country}</span>
                </div>
                <div className="flex justify-between">
                  <span>Users:</span>
                  <span>{node.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span>{node.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>{node.load}%</span>
                </div>
              </div>

              <Progress value={node.load} className="h-1 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Last update: {node.lastUpdate}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GlobalMetricsCard() {
  const metrics: GlobalMetrics = useMemo(
    () => ({
      totalNodes: 12,
      activeNodes: 11,
      totalUsers: 12456,
      globalLatency: 34,
      dataTransferred: "2.4 TB",
      uptime: "99.97%",
    }),
    [],
  );

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Global Metrics
        </CardTitle>
        <CardDescription>
          General status of distributed system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg">
            <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {metrics.activeNodes}/{metrics.totalNodes}
            </div>
            <div className="text-sm text-muted-foreground">Active Nodes</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Global Users
            </div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {metrics.globalLatency}ms
            </div>
            <div className="text-sm text-muted-foreground">Global Latency</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {metrics.dataTransferred}
            </div>
            <div className="text-sm text-muted-foreground">
              Data Transferred
            </div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-teal-600" />
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {metrics.uptime}
            </div>
            <div className="text-sm text-muted-foreground">Global Uptime</div>
          </div>

          <div className="text-center p-4 rounded-lg">
            <Network className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              100%
            </div>
            <div className="text-sm text-muted-foreground">Connectivity</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GlobalAlertsCard() {
  const alerts = useMemo(
    () => [
      {
        id: 1,
        type: "warning",
        region: "SA East",
        message: "High latency detected",
        severity: "medium",
        time: "5 min ago",
      },
      {
        id: 2,
        type: "info",
        region: "Global",
        message: "Security update applied on all nodes",
        severity: "low",
        time: "15 min ago",
      },
      {
        id: 3,
        type: "success",
        region: "EU West",
        message: "Performance optimization completed",
        severity: "low",
        time: "1 hour ago",
      },
    ],
    [],
  );

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-orange-600" />
          Global Alerts
        </CardTitle>
        <CardDescription>
          Important distributed network events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div
                className={`mt-0.5 h-2 w-2 rounded-full ${
                  alert.severity === "high"
                    ? "bg-red-500"
                    : alert.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {alert.region}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NetworkTopologyCard() {
  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-indigo-600" />
          Network Topology
        </CardTitle>
        <CardDescription>
          Global distributed network architecture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Overview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Overview</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Active Regions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>North America:</span>
                    <span className="font-medium">3 nodes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Europe:</span>
                    <span className="font-medium">3 nodes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Asia-Pacific:</span>
                    <span className="font-medium">4 nodes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>South America:</span>
                    <span className="font-medium">1 node</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Africa:</span>
                    <span className="font-medium">1 node</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Global Connectivity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Main network:</span>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Backups:</span>
                    <Badge variant="secondary">2 active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>CDN:</span>
                    <Badge variant="secondary">12 edge locations</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average latency:</span>
                    <span className="font-medium">34ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latency Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Latency by Region</h3>
            <div className="space-y-4">
              {globalNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{node.region}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{node.latency}ms</span>
                    <Progress
                      value={Math.max(0, 100 - node.latency)}
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Network Traffic</h3>
            <div className="text-center p-8">
              <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Traffic visualization in development
              </p>
            </div>
          </div>

          {/* Health Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Health Tools</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>Health Check</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Monitor className="h-6 w-6" />
                <span>Network Diagnostic</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Performance Analysis</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span>Incident Reports</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GlobalOversightDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 p-6">
      {/* Global Oversight Header */}
      <RoleAwareHeader
        title="🌍 GLOBAL OVERSIGHT - SUPREME MONITORING"
        subtitle={`Absolute global supervision - Architect ${session?.user?.name || "Master Developer"}`}
        actions={
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Globe className="h-3 w-3 mr-1" />
              GLOBAL OVERSIGHT
            </Badge>
            <RoleIndicator role="MASTER" />
          </div>
        }
      />

      {/* Global Metrics */}
      <GlobalMetricsCard />

      {/* Global Map */}
      <GlobalMapCard />

      {/* Global Alerts */}
      <GlobalAlertsCard />

      {/* Network Topology */}
      <NetworkTopologyCard />
    </div>
  );
}
