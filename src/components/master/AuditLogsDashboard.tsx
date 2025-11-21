"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  Database,
  Shield,
  Settings,
  Lock,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface AuditLogEntry {
  _id: string;
  _creationTime: number;
  timestamp: number;
  userId?: string;
  userEmail: string;
  userRole: "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "STUDENT" | "SYSTEM";
  action: string;
  resource: string;
  status: "success" | "warning" | "error";
  ipAddress: string;
  userAgent?: string;
  details: string;
  metadata?: any;
  category:
    | "authentication"
    | "authorization"
    | "data_access"
    | "system_config"
    | "user_management"
    | "system_operation"
    | "security_event";
  institutionId?: string;
  sessionId?: string;
}

function AuditLogsOverviewCard() {
  const auditStats = useQuery(api.audit.getAuditStats);
  const populateSampleLogs = useMutation(api.audit.populateSampleAuditLogs);
  const [isPopulating, setIsPopulating] = useState(false);

  const stats = useMemo(() => {
    if (!auditStats) {
      return {
        totalLogs: 0,
        todayLogs: 0,
        errorLogs: 0,
        successLogs: 0,
        uniqueUsers: 0,
      };
    }

    return {
      totalLogs: auditStats.totalLogs,
      todayLogs: auditStats.todayLogs,
      errorLogs: auditStats.errorLogs,
      successLogs: auditStats.successLogs,
      uniqueUsers: auditStats.uniqueUsers,
    };
  }, [auditStats]);

  const handlePopulateSampleData = async () => {
    setIsPopulating(true);
    try {
      await populateSampleLogs({});
      // Refresh the stats
      window.location.reload();
    } catch (error) {
      console.error("Failed to populate sample data:", error);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Resumen de Logs de Auditoría
        </CardTitle>
        <CardDescription>
          Estadísticas generales de actividad auditada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <Button
            onClick={handlePopulateSampleData}
            disabled={isPopulating}
            variant="outline"
            size="sm"
          >
            {isPopulating ? "Cargando..." : "Cargar Datos de Prueba"}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {stats.totalLogs}
            </div>
            <div className="text-sm text-muted-foreground">Logs Totales</div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.todayLogs}
            </div>
            <div className="text-sm text-muted-foreground">Hoy</div>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.errorLogs}
            </div>
            <div className="text-sm text-muted-foreground">Errores</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.successLogs}
            </div>
            <div className="text-sm text-muted-foreground">Exitosos</div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.uniqueUsers}
            </div>
            <div className="text-sm text-muted-foreground">Usuarios Únicos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditLogsTableCard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Fetch audit logs from Convex
  const auditLogsData = useQuery(api.audit.getAuditLogs, {
    limit: 100,
    searchTerm: searchTerm || undefined,
    category: categoryFilter !== "all" ? categoryFilter as any : undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
  });

  const auditLogs = auditLogsData?.logs || [];

  // Convert timestamp to readable format
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <Shield className="h-4 w-4" />;
      case "authorization":
        return <Lock className="h-4 w-4" />;
      case "data_access":
        return <Database className="h-4 w-4" />;
      case "system_config":
        return <Settings className="h-4 w-4" />;
      case "user_management":
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Logs de Auditoría Detallados
        </CardTitle>
        <CardDescription>
          Historial completo de actividad auditada del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="authentication">Autenticación</SelectItem>
                <SelectItem value="authorization">Autorización</SelectItem>
                <SelectItem value="data_access">Acceso a Datos</SelectItem>
                <SelectItem value="system_config">Configuración</SelectItem>
                <SelectItem value="user_management">
                  Gestión Usuarios
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Exitosos</SelectItem>
                <SelectItem value="warning">Advertencias</SelectItem>
                <SelectItem value="error">Errores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{log.userEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(log.category)}
                        <span className="capitalize text-sm">
                          {log.category.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {log.action}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge
                          variant={
                            log.status === "success"
                              ? "default"
                              : log.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {auditLogs.length} de {auditLogsData?.totalCount || 0} logs
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          </div>

          {selectedLog && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertTitle>Detalles del Log: {selectedLog.action}</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <strong>ID:</strong> {selectedLog._id}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedLog.userEmail}
                  </div>
                  <div>
                    <strong>Rol:</strong> {selectedLog.userRole}
                  </div>
                  <div>
                    <strong>Recurso:</strong> {selectedLog.resource}
                  </div>
                  <div>
                    <strong>Categoría:</strong> {selectedLog.category.replace("_", " ")}
                  </div>
                  <div>
                    <strong>Estado:</strong> {selectedLog.status}
                  </div>
                  <div>
                    <strong>IP:</strong> {selectedLog.ipAddress}
                  </div>
                  {selectedLog.userAgent && (
                    <div>
                      <strong>User Agent:</strong> {selectedLog.userAgent}
                    </div>
                  )}
                  <div>
                    <strong>Detalles:</strong> {selectedLog.details}
                  </div>
                  {selectedLog.metadata && (
                    <div>
                      <strong>Metadata:</strong>{" "}
                      <pre className="text-xs bg-muted p-2 rounded mt-1">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AuditReportsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Reportes de Auditoría
        </CardTitle>
        <CardDescription>
          Reportes automáticos y análisis de tendencias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" className="h-24 flex-col gap-2">
            <FileText className="h-6 w-6" />
            <span>Reporte Diario</span>
            <span className="text-xs text-muted-foreground">
              Actividad de las últimas 24h
            </span>
          </Button>

          <Button variant="outline" className="h-24 flex-col gap-2">
            <Shield className="h-6 w-6" />
            <span>Reporte de Seguridad</span>
            <span className="text-xs text-muted-foreground">
              Eventos de seguridad
            </span>
          </Button>

          <Button variant="outline" className="h-24 flex-col gap-2">
            <User className="h-6 w-6" />
            <span>Reporte de Usuarios</span>
            <span className="text-xs text-muted-foreground">
              Actividad por usuario
            </span>
          </Button>

          <Button variant="outline" className="h-24 flex-col gap-2">
            <Database className="h-6 w-6" />
            <span>Reporte de Datos</span>
            <span className="text-xs text-muted-foreground">
              Accesos a datos sensibles
            </span>
          </Button>

          <Button variant="outline" className="h-24 flex-col gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>Reporte de Anomalías</span>
            <span className="text-xs text-muted-foreground">
              Patrones inusuales
            </span>
          </Button>

          <Button variant="outline" className="h-24 flex-col gap-2">
            <Settings className="h-6 w-6" />
            <span>Reporte de Configuración</span>
            <span className="text-xs text-muted-foreground">
              Cambios en configuración
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AuditLogsDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Audit Logs Header */}

      {/* Audit Logs Table */}
      <AuditLogsTableCard />

      {/* Audit Reports */}
      <AuditReportsCard />
    </div>
  );
}
