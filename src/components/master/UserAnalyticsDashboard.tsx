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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  User,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Download,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userRetention: number;
  averageSessionTime: string;
  topRole: string;
}

interface UserActivity {
  user: string;
  role: string;
  lastActivity: string;
  sessionTime: string;
  actions: number;
  status: "online" | "offline" | "away";
}

const userStats: UserStats = {
  totalUsers: 1247,
  activeUsers: 89,
  newUsersToday: 12,
  userRetention: 87.5,
  averageSessionTime: "24m 32s",
  topRole: "PROFESOR",
};

const userActivities: UserActivity[] = [
  {
    user: "admin@school.com",
    role: "ADMIN",
    lastActivity: "2 min ago",
    sessionTime: "1h 23m",
    actions: 45,
    status: "online",
  },
  {
    user: "profesor@school.com",
    role: "PROFESOR",
    lastActivity: "5 min ago",
    sessionTime: "45m 12s",
    actions: 23,
    status: "online",
  },
  {
    user: "parent@school.com",
    role: "PARENT",
    lastActivity: "1 hour ago",
    sessionTime: "12m 34s",
    actions: 8,
    status: "away",
  },
  {
    user: "student@school.com",
    role: "STUDENT",
    lastActivity: "2 hours ago",
    sessionTime: "8m 45s",
    actions: 5,
    status: "offline",
  },
];

function UserOverviewCard() {
  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Resumen de Usuarios
        </CardTitle>
        <CardDescription>
          Métricas generales de usuarios del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {userStats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Usuarios Totales
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {userStats.activeUsers}
            </div>
            <div className="text-sm text-muted-foreground">
              Usuarios Activos
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              +{userStats.newUsersToday}
            </div>
            <div className="text-sm text-muted-foreground">Nuevos Hoy</div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {userStats.averageSessionTime}
            </div>
            <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          </div>

          <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-teal-600" />
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {userStats.userRetention}%
            </div>
            <div className="text-sm text-muted-foreground">Retención</div>
          </div>

          <div className="text-center p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
            <User className="h-8 w-8 mx-auto mb-2 text-pink-600" />
            <div className="text-xl font-bold text-pink-700 dark:text-pink-300">
              {userStats.topRole}
            </div>
            <div className="text-sm text-muted-foreground">Rol Más Activo</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserActivityTable() {
  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      away: "secondary",
      offline: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad de Usuarios
        </CardTitle>
        <CardDescription>
          Usuarios activos y su actividad reciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Tiempo de Sesión</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{activity.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.role}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(activity.status)}</TableCell>
                  <TableCell className="text-sm">
                    {activity.lastActivity}
                  </TableCell>
                  <TableCell className="text-sm">
                    {activity.sessionTime}
                  </TableCell>
                  <TableCell className="text-sm">{activity.actions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function UserDemographicsCard() {
  const demographics = useMemo(
    () => [
      { role: "PROFESOR", count: 45, percentage: 42 },
      { role: "PARENT", count: 38, percentage: 35 },
      { role: "ADMIN", count: 12, percentage: 11 },
      { role: "STUDENT", count: 11, percentage: 10 },
      { role: "MASTER", count: 2, percentage: 2 },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Demografía de Usuarios
        </CardTitle>
        <CardDescription>Distribución de usuarios por roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {demographics.map((demo, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{demo.role}</span>
                <span className="text-sm text-muted-foreground">
                  {demo.count} ({demo.percentage}%)
                </span>
              </div>
              <Progress value={demo.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DeviceAnalyticsCard() {
  const devices = useMemo(
    () => [
      { type: "Desktop", icon: Monitor, count: 567, percentage: 65 },
      { type: "Mobile", icon: Smartphone, count: 234, percentage: 27 },
      { type: "Tablet", icon: Globe, count: 78, percentage: 8 },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Análisis de Dispositivos
        </CardTitle>
        <CardDescription>
          Uso del sistema por tipo de dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {devices.map((device, index) => {
            const Icon = device.icon;
            return (
              <div
                key={index}
                className="text-center p-4 bg-muted/50 rounded-lg"
              >
                <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{device.count}</div>
                <div className="text-sm text-muted-foreground">
                  {device.type}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {device.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function UserEngagementCard() {
  const engagement = useMemo(
    () => [
      {
        metric: "Páginas por Sesión",
        value: "8.4",
        trend: "up",
        change: "+12%",
      },
      {
        metric: "Tiempo en Plataforma",
        value: "24m 32s",
        trend: "up",
        change: "+8%",
      },
      {
        metric: "Frecuencia de Uso",
        value: "5.2/día",
        trend: "stable",
        change: "+2%",
      },
      {
        metric: "Tasa de Conversión",
        value: "78%",
        trend: "up",
        change: "+15%",
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Métricas de Engagement
        </CardTitle>
        <CardDescription>
          Comportamiento y engagement de usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {engagement.map((metric, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{metric.metric}</span>
                <Badge
                  variant={metric.trend === "up" ? "default" : "secondary"}
                >
                  {metric.trend === "up" ? "↗️" : "→"} {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function UserAnalyticsDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* User Overview */}
      <UserOverviewCard />

      {/* Analytics Sections */}
      <div className="space-y-6">
        <UserActivityTable />
        <UserDemographicsCard />
        <DeviceAnalyticsCard />
        <UserEngagementCard />
      </div>
    </div>
  );
}
