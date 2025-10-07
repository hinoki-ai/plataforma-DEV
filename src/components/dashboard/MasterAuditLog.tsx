"use client";

import React, { useState, useEffect } from "react";
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
  Eye,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Shield,
  User,
  Settings,
  Database,
  Clock,
} from "lucide-react";
import { useRoleAccess } from "@/components/auth/RoleGuard";

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: "low" | "medium" | "high" | "critical";
}

export function MasterAuditLog() {
  const roleAccess = useRoleAccess();
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock audit data for demonstration
  useEffect(() => {
    const mockAuditData: AuditEntry[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: "master-1",
        userEmail: "agustinaramac@gmail.com",
        action: "SYSTEM_GOD_MODE_ACTIVATED",
        resource: "system_control",
        details: { command: "god_mode_status", result: "ACTIVE" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (MASTER Browser)",
        severity: "critical",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userId: "admin-1",
        userEmail: "admin@test.com",
        action: "USER_ROLE_MODIFIED",
        resource: "user_management",
        details: {
          targetUser: "profesor@test.com",
          oldRole: "PROFESOR",
          newRole: "ADMIN",
        },
        ipAddress: "10.0.0.50",
        userAgent: "Chrome/91.0",
        severity: "high",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        userId: "master-1",
        userEmail: "agustinaramac@gmail.com",
        action: "EMERGENCY_LOCKDOWN_INITIATED",
        resource: "security_control",
        details: { lockdownId: "MASTER_LD_123456", affectedSystems: "ALL" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (MASTER Browser)",
        severity: "critical",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        userId: "profesor-1",
        userEmail: "profesor@test.com",
        action: "DOCUMENT_CREATED",
        resource: "planning_documents",
        details: {
          documentId: "doc-123",
          subject: "Mathematics",
          grade: "8° Básico",
        },
        ipAddress: "172.16.0.25",
        userAgent: "Firefox/89.0",
        severity: "low",
      },
    ];

    setAuditLogs(mockAuditData);
    setFilteredLogs(mockAuditData);
    setIsLoading(false);
  }, []);

  // Filter logs based on search term and severity
  useEffect(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedSeverity !== "all") {
      filtered = filtered.filter((log) => log.severity === selectedSeverity);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, selectedSeverity]);

  // Only render for MASTER users
  if (!roleAccess.hasMasterGodMode) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <Shield className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "low":
        return <User className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* MASTER Audit Header */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-yellow-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                🔍 MASTER Almighty Audit Log
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Complete system oversight and activity monitoring
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="ml-auto bg-yellow-100 text-yellow-800"
            >
              Supreme Oversight
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, acción o recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
              aria-label="Filtrar por severidad de auditoría"
            >
              <option value="all">Todas las severidades</option>
              <option value="critical">Críticas</option>
              <option value="high">Altas</option>
              <option value="medium">Medias</option>
              <option value="low">Bajas</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Audit Log Entries */}
          <div className="space-y-3">
            {filteredLogs.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(entry.severity)}
                        <span className="font-semibold text-sm">
                          {entry.action}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getSeverityColor(entry.severity)}`}
                        >
                          {entry.severity.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Usuario:</strong> {entry.userEmail}
                        </div>
                        <div>
                          <strong>Recurso:</strong> {entry.resource}
                        </div>
                        <div>
                          <strong>IP:</strong> {entry.ipAddress}
                        </div>
                        <div>
                          <strong>Hora:</strong>{" "}
                          {formatTimestamp(entry.timestamp)}
                        </div>
                        <div className="md:col-span-2">
                          <strong>Detalles:</strong>
                          <pre className="text-xs mt-1 bg-muted p-2 rounded">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLogs.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron entradas de auditoría</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
