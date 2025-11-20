"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Eye,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Settings,
  Database,
  Shield,
  FileText,
  Activity,
  Calendar,
  Users,
} from "lucide-react";
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  status: "success" | "warning" | "error";
  ipAddress: string;
  userAgent: string;
  details: string;
}

const auditEntries: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:30:25",
    user: "admin@school.com",
    role: "ADMIN",
    action: "USER_CREATED",
    resource: "users",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0",
    details: "Created user account for profesor@example.com",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:25:10",
    user: "master@system.com",
    role: "MASTER",
    action: "SYSTEM_CONFIG_UPDATE",
    resource: "system",
    status: "success",
    ipAddress: "10.0.0.1",
    userAgent: "System/1.0",
    details: "Updated database connection pool size to 25",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:20:45",
    user: "profesor@school.com",
    role: "PROFESOR",
    action: "PLANNING_CREATED",
    resource: "plannings",
    status: "success",
    ipAddress: "192.168.1.105",
    userAgent: "Firefox/119.0",
    details: "Created new lesson plan for Mathematics 3A",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:15:30",
    user: "parent@school.com",
    role: "PARENT",
    action: "MEETING_REQUESTED",
    resource: "meetings",
    status: "warning",
    ipAddress: "192.168.1.110",
    userAgent: "Safari/17.0",
    details: "Requested parent-teacher meeting - pending approval",
  },
  {
    id: "5",
    timestamp: "2024-01-15 14:10:15",
    user: "system@internal",
    role: "SYSTEM",
    action: "BACKUP_COMPLETED",
    resource: "system",
    status: "success",
    ipAddress: "127.0.0.1",
    userAgent: "System/1.0",
    details: "Automated daily backup completed successfully",
  },
];

function AuditStatsCard() {
  const stats = useMemo(
    () => ({
      totalEvents: 15420,
      todayEvents: 247,
      criticalEvents: 3,
      failedLogins: 12,
      successfulLogins: 89,
    }),
    [],
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Estadísticas de Auditoría
        </CardTitle>
        <CardDescription>Resumen de actividad del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {(stats.totalEvents / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-muted-foreground">Eventos Totales</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.todayEvents}
            </div>
            <div className="text-sm text-muted-foreground">Hoy</div>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.criticalEvents}
            </div>
            <div className="text-sm text-muted-foreground">Críticos</div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats.failedLogins}
            </div>
            <div className="text-sm text-muted-foreground">Logins Fallidos</div>
          </div>

          <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-teal-600" />
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {stats.successfulLogins}
            </div>
            <div className="text-sm text-muted-foreground">Logins Exitosos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditFiltersCard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Auditoría
        </CardTitle>
        <CardDescription>Filtrar registros de auditoría</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Usuario, acción, recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Acción</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="USER_CREATED">Usuario Creado</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="SYSTEM_CONFIG_UPDATE">
                  Configuración
                </SelectItem>
                <SelectItem value="BACKUP_COMPLETED">Backup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Usuario</label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MASTER">Master</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="PROFESOR">Profesor</SelectItem>
                <SelectItem value="PARENT">Padre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="yesterday">Ayer</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando 5 de 15,420 registros
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">Aplicar Filtros</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditTableCard() {
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      warning: "secondary",
      error: "destructive",
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
          <FileText className="h-5 w-5" />
          Registros de Auditoría
        </CardTitle>
        <CardDescription>
          Historial completo de actividad del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">
                    {entry.timestamp}
                  </TableCell>
                  <TableCell className="font-medium">{entry.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {entry.action}
                    </code>
                  </TableCell>
                  <TableCell>{entry.resource}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      {getStatusBadge(entry.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Entry Details Modal would go here */}
        {selectedEntry && (
          <Alert className="mt-4">
            <Eye className="h-4 w-4" />
            <AlertTitle>Detalles del Evento</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  <strong>ID:</strong> {selectedEntry.id}
                </div>
                <div>
                  <strong>User Agent:</strong> {selectedEntry.userAgent}
                </div>
                <div>
                  <strong>Detalles:</strong> {selectedEntry.details}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function SecurityAlertsCard() {
  const alerts = useMemo(
    () => [
      {
        id: 1,
        type: "critical",
        message: "Intento de acceso no autorizado desde IP externa",
        time: "2 min ago",
        severity: "high",
      },
      {
        id: 2,
        type: "warning",
        message: "Múltiples intentos de login fallidos",
        time: "15 min ago",
        severity: "medium",
      },
      {
        id: 3,
        type: "info",
        message: "Cambio de configuración detectado",
        time: "1 hour ago",
        severity: "low",
      },
    ],
    [],
  );

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-600" />
          Alertas de Seguridad
        </CardTitle>
        <CardDescription>Eventos de seguridad detectados</CardDescription>
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
                  <Badge
                    variant={
                      alert.severity === "high"
                        ? "destructive"
                        : alert.severity === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {alert.severity.toUpperCase()}
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

export function MasterAuditDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 p-6">
      {/* Master Audit Header */}
      <RoleAwareHeader
        title="📋 MASTER AUDIT - SUPREME AUDIT LOGS"
        subtitle={`Auditoría completa del sistema - Arquitecto ${session?.user?.name || "Master Developer"}`}
        actions={
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Eye className="h-3 w-3 mr-1" />
              MASTER AUDIT
            </Badge>
            <RoleIndicator role="MASTER" />
          </div>
        }
      />

      {/* Audit Stats */}
      <AuditStatsCard />

      {/* Security Alerts */}
      <SecurityAlertsCard />

      {/* Audit Filters */}
      <AuditFiltersCard />

      {/* Audit Table */}
      <AuditTableCard />
    </div>
  );
}
