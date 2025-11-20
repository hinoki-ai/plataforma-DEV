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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Search,
  Filter,
  Activity,
  User,
  Globe,
  Server,
  Key,
  FileText,
  Zap,
  Target,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface SecurityEvent {
  id: string;
  type: "threat" | "login" | "access" | "system";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  source: string;
  timestamp: string;
  status: "active" | "resolved" | "blocked";
}

interface SecurityMetric {
  label: string;
  value: number;
  change: number;
  status: "good" | "warning" | "critical";
}

const securityEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "threat",
    severity: "high",
    message: "Intento de acceso no autorizado desde IP externa",
    source: "192.168.1.100",
    timestamp: "2024-01-15 14:30:25",
    status: "blocked",
  },
  {
    id: "2",
    type: "login",
    severity: "medium",
    message: "Múltiples intentos de login fallidos",
    source: "user@domain.com",
    timestamp: "2024-01-15 14:25:10",
    status: "resolved",
  },
  {
    id: "3",
    type: "access",
    severity: "low",
    message: "Acceso a recurso restringido autorizado",
    source: "admin@school.com",
    timestamp: "2024-01-15 14:20:45",
    status: "active",
  },
  {
    id: "4",
    type: "system",
    severity: "critical",
    message: "Detección de actividad sospechosa en base de datos",
    source: "system",
    timestamp: "2024-01-15 14:15:30",
    status: "active",
  },
];

const securityMetrics: SecurityMetric[] = [
  { label: "Amenazas Bloqueadas", value: 47, change: -12, status: "good" },
  { label: "Intentos de Login", value: 156, change: 8, status: "warning" },
  { label: "Sesiones Activas", value: 89, change: 5, status: "good" },
  { label: "Alertas Críticas", value: 3, change: -1, status: "good" },
];

function SecurityOverviewCard() {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Resumen de Seguridad
        </CardTitle>
        <CardDescription>
          Estado general del sistema de seguridad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {securityMetrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg"
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
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
              <div
                className={`text-xs ${
                  metric.change > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {metric.change > 0 ? "+" : ""}
                {metric.change} vs ayer
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">
                Sistema Seguro - Todos los protocolos activos
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Última verificación: hace 5 minutos
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityEventsCard() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    return securityEvents.filter((event) => {
      const matchesFilter = filter === "all" || event.severity === filter;
      const matchesSearch =
        event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "destructive",
      resolved: "default",
      blocked: "secondary",
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
          Eventos de Seguridad
        </CardTitle>
        <CardDescription>
          Monitoreo de eventos de seguridad en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="critical">Críticos</SelectItem>
                <SelectItem value="high">Altos</SelectItem>
                <SelectItem value="medium">Medios</SelectItem>
                <SelectItem value="low">Bajos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                {getSeverityIcon(event.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        event.severity === "critical"
                          ? "destructive"
                          : event.severity === "high"
                            ? "default"
                            : event.severity === "medium"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {event.severity.toUpperCase()}
                    </Badge>
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="font-medium text-sm">{event.message}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Fuente: {event.source}</span>
                    <span>{event.timestamp}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ThreatAnalysisCard() {
  const threats = useMemo(
    () => [
      { type: "SQL Injection", count: 12, blocked: 12, trend: "down" },
      { type: "Brute Force", count: 8, blocked: 7, trend: "stable" },
      { type: "XSS Attempts", count: 5, blocked: 5, trend: "down" },
      { type: "Unauthorized Access", count: 15, blocked: 13, trend: "up" },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Análisis de Amenazas
        </CardTitle>
        <CardDescription>
          Análisis detallado de tipos de amenazas detectadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threats.map((threat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{threat.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {threat.blocked}/{threat.count} bloqueados
                  </span>
                  <Badge
                    variant={threat.trend === "up" ? "destructive" : "default"}
                  >
                    {threat.trend === "up"
                      ? "↗️"
                      : threat.trend === "down"
                        ? "↘️"
                        : "→"}
                  </Badge>
                </div>
              </div>
              <Progress
                value={(threat.blocked / threat.count) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityControlsCard() {
  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <Key className="h-5 w-5" />
          Controles de Seguridad
        </CardTitle>
        <CardDescription className="text-yellow-600 dark:text-yellow-400">
          Configuración avanzada de controles de seguridad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Shield className="h-6 w-6" />
            <span>Firewall Avanzado</span>
            <span className="text-xs text-muted-foreground">
              Configurar reglas
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Lock className="h-6 w-6" />
            <span>Encriptación</span>
            <span className="text-xs text-muted-foreground">
              Administrar claves
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <User className="h-6 w-6" />
            <span>Autenticación</span>
            <span className="text-xs text-muted-foreground">
              MFA & Políticas
            </span>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Eye className="h-6 w-6" />
            <span>Monitoreo</span>
            <span className="text-xs text-muted-foreground">
              Logs & Alertas
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function IncidentResponseCard() {
  const incidents = useMemo(
    () => [
      {
        id: "INC-001",
        title: "SQL Injection Attempt",
        status: "resolved",
        priority: "high",
        assigned: "Security Team",
      },
      {
        id: "INC-002",
        title: "Brute Force Attack",
        status: "investigating",
        priority: "medium",
        assigned: "Admin",
      },
      {
        id: "INC-003",
        title: "Unauthorized Data Access",
        status: "contained",
        priority: "critical",
        assigned: "Master",
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Respuesta a Incidentes
        </CardTitle>
        <CardDescription>
          Gestión y respuesta a incidentes de seguridad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-sm">{incident.title}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {incident.id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    incident.priority === "critical"
                      ? "destructive"
                      : incident.priority === "high"
                        ? "default"
                        : "secondary"
                  }
                >
                  {incident.priority}
                </Badge>
                <Badge variant="outline">{incident.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {incident.assigned}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SecurityCenterDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 p-6">
      {/* Security Center Header */}
      <RoleAwareHeader
        title="SECURITY CENTER - SUPREME SECURITY AUTHORITY"
        subtitle={`Centro de seguridad absoluto - Arquitecto ${session?.user?.name || "Master Developer"}`}
      />

      {/* Security Overview */}
      <SecurityOverviewCard />

      {/* Security Tools Sections */}
      <div className="space-y-6">
        <SecurityEventsCard />
        <ThreatAnalysisCard />
        <SecurityControlsCard />
        <IncidentResponseCard />
      </div>
    </div>
  );
}
