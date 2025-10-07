"use client";

import React, { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Database,
  Table2,
  Search,
  Play,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  BarChart3,
  Zap,
  Shield,
  HardDrive,
  Activity,
} from "lucide-react";
import {
  RoleIndicator,
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastModified: string;
  status: "active" | "inactive" | "maintenance";
}

interface QueryResult {
  id: string;
  query: string;
  executionTime: number;
  rowsAffected: number;
  status: "success" | "error" | "running";
  timestamp: string;
}

const sampleTables: DatabaseTable[] = [
  {
    name: "users",
    rows: 1247,
    size: "2.3 MB",
    lastModified: "2024-01-15 14:30:25",
    status: "active",
  },
  {
    name: "meetings",
    rows: 892,
    size: "1.8 MB",
    lastModified: "2024-01-15 14:25:10",
    status: "active",
  },
  {
    name: "planning_documents",
    rows: 456,
    size: "5.2 MB",
    lastModified: "2024-01-15 14:20:45",
    status: "active",
  },
  {
    name: "audit_logs",
    rows: 15420,
    size: "12.7 MB",
    lastModified: "2024-01-15 14:15:30",
    status: "active",
  },
  {
    name: "notifications",
    rows: 2341,
    size: "890 KB",
    lastModified: "2024-01-15 14:10:15",
    status: "active",
  },
];

const sampleQueries: QueryResult[] = [
  {
    id: "1",
    query: "SELECT COUNT(*) FROM users WHERE role = 'PROFESOR'",
    executionTime: 45,
    rowsAffected: 1,
    status: "success",
    timestamp: "2024-01-15 14:30:25",
  },
  {
    id: "2",
    query: "UPDATE meetings SET status = 'completed' WHERE date < NOW()",
    executionTime: 123,
    rowsAffected: 23,
    status: "success",
    timestamp: "2024-01-15 14:25:10",
  },
  {
    id: "3",
    query: "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100",
    executionTime: 89,
    rowsAffected: 100,
    status: "success",
    timestamp: "2024-01-15 14:20:45",
  },
];

function DatabaseOverviewCard() {
  const stats = useMemo(
    () => ({
      totalTables: 15,
      totalSize: "45.2 MB",
      activeConnections: 12,
      queriesPerSecond: 89,
      cacheHitRate: "94.5%",
      backupStatus: "Last backup: 2 hours ago",
    }),
    [],
  );

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Vista General de Base de Datos
        </CardTitle>
        <CardDescription>
          Estado y métricas del sistema de base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Table2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totalTables}
            </div>
            <div className="text-sm text-muted-foreground">Tablas Totales</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.totalSize}
            </div>
            <div className="text-sm text-muted-foreground">Tamaño Total</div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.activeConnections}
            </div>
            <div className="text-sm text-muted-foreground">
              Conexiones Activas
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats.queriesPerSecond}
            </div>
            <div className="text-sm text-muted-foreground">Queries/seg</div>
          </div>

          <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-teal-600" />
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {stats.cacheHitRate}
            </div>
            <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
              {stats.backupStatus}
            </div>
            <div className="text-sm text-muted-foreground">Estado Backup</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TablesManagementCard() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTables = useMemo(() => {
    return sampleTables.filter((table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table2 className="h-5 w-5" />
          Gestión de Tablas
        </CardTitle>
        <CardDescription>
          Administrar tablas de la base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tabla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Filas</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Última Modificación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.rows.toLocaleString()}</TableCell>
                    <TableCell>{table.size}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {table.lastModified}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          table.status === "active"
                            ? "default"
                            : table.status === "inactive"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {table.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueryExecutorCard() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteQuery = () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    // Simulate query execution
    setTimeout(() => {
      setIsExecuting(false);
      console.log("Query executed:", query);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Ejecutor de Queries
        </CardTitle>
        <CardDescription>
          Ejecutar queries SQL directamente en la base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Zona de Alto Riesgo
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Las queries ejecutadas aquí pueden modificar datos
              permanentemente. Asegúrate de tener backups antes de proceder.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Query SQL</label>
            <Textarea
              placeholder="SELECT * FROM users LIMIT 10;"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono text-sm min-h-32"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExecuteQuery}
              disabled={!query.trim() || isExecuting}
              className="flex-1"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ejecutar Query
                </>
              )}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultados
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueryHistoryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historial de Queries
        </CardTitle>
        <CardDescription>
          Historial de queries ejecutadas recientemente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleQueries.map((queryResult) => (
            <div key={queryResult.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {queryResult.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {queryResult.status === "error" && (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  {queryResult.status === "running" && (
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  )}
                  <Badge
                    variant={
                      queryResult.status === "success"
                        ? "default"
                        : queryResult.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {queryResult.status}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {queryResult.timestamp}
                </span>
              </div>

              <div className="font-mono text-sm bg-muted p-2 rounded mb-2">
                {queryResult.query}
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Tiempo: {queryResult.executionTime}ms</span>
                <span>Filas afectadas: {queryResult.rowsAffected}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DatabaseToolsDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 p-6">
      {/* Database Tools Header */}
      <RoleAwareHeader
        title="🗄️ DATABASE TOOLS - SUPREME DATABASE MANAGEMENT"
        subtitle={`Herramientas avanzadas de base de datos - Arquitecto ${session?.user?.name || "Master Developer"}`}
        actions={
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Database className="h-3 w-3 mr-1" />
              DATABASE TOOLS
            </Badge>
            <RoleIndicator role="MASTER" />
          </div>
        }
      />

      {/* Database Overview */}
      <DatabaseOverviewCard />

      {/* Database Tools Sections */}
      <div className="space-y-6">
        <TablesManagementCard />
        <QueryExecutorCard />
        <QueryHistoryCard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Operaciones de Mantenimiento
            </CardTitle>
            <CardDescription>
              Herramientas avanzadas de mantenimiento de base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">
                      Operaciones Avanzadas
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Herramientas de mantenimiento
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">
                      Verificar Integridad
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Comprobar estado de tablas
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <Download className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">Backup Manual</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Crear copia de seguridad
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <a href="/master/advanced-operations">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-medium text-sm">Optimizar Tablas</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Mejorar rendimiento
                    </div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
