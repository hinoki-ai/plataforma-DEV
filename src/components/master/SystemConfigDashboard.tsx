"use client";

import React, { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Database,
  Shield,
  Server,
  Cpu,
  HardDrive,
  Network,
  Mail,
  Bell,
  Lock,
  Key,
  Globe,
  Zap,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  id: string;
  label: string;
  description: string;
  type: "text" | "number" | "boolean" | "select" | "textarea";
  value: any;
  options?: string[];
  sensitive?: boolean;
}

const configSections: ConfigSection[] = [
  {
    id: "database",
    title: "Base de Datos",
    description: "Configuración de conexiones y rendimiento",
    icon: Database,
    settings: [
      {
        id: "db_host",
        label: "Host",
        description: "Dirección del servidor de base de datos",
        type: "text",
        value: "localhost",
      },
      {
        id: "db_port",
        label: "Puerto",
        description: "Puerto de conexión",
        type: "number",
        value: 5432,
      },
      {
        id: "db_pool_size",
        label: "Tamaño del Pool",
        description: "Número máximo de conexiones",
        type: "number",
        value: 20,
      },
      {
        id: "db_ssl",
        label: "SSL",
        description: "Habilitar conexiones SSL",
        type: "boolean",
        value: true,
      },
      {
        id: "db_timeout",
        label: "Timeout",
        description: "Timeout de conexión en segundos",
        type: "number",
        value: 30,
      },
    ],
  },
  {
    id: "security",
    title: "Seguridad",
    description: "Configuraciones de seguridad y autenticación",
    icon: Shield,
    settings: [
      {
        id: "jwt_secret",
        label: "JWT Secret",
        description: "Clave secreta para tokens JWT",
        type: "text",
        value: "••••••••••••••••",
        sensitive: true,
      },
      {
        id: "session_timeout",
        label: "Timeout de Sesión",
        description: "Tiempo de expiración de sesión en minutos",
        type: "number",
        value: 480,
      },
      {
        id: "password_min_length",
        label: "Longitud Mínima de Contraseña",
        description: "Caracteres mínimos para contraseñas",
        type: "number",
        value: 8,
      },
      {
        id: "two_factor_required",
        label: "2FA Requerido",
        description: "Exigir autenticación de dos factores",
        type: "boolean",
        value: true,
      },
      {
        id: "rate_limiting",
        label: "Rate Limiting",
        description: "Habilitar limitación de peticiones",
        type: "boolean",
        value: true,
      },
    ],
  },
  {
    id: "server",
    title: "Servidor",
    description: "Configuración del servidor y rendimiento",
    icon: Server,
    settings: [
      {
        id: "server_port",
        label: "Puerto del Servidor",
        description: "Puerto en el que corre la aplicación",
        type: "number",
        value: 3000,
      },
      {
        id: "max_file_size",
        label: "Tamaño Máximo de Archivo",
        description: "Tamaño máximo para uploads en MB",
        type: "number",
        value: 10,
      },
      {
        id: "compression",
        label: "Compresión",
        description: "Habilitar compresión de respuestas",
        type: "boolean",
        value: true,
      },
      {
        id: "cors_origins",
        label: "Orígenes CORS",
        description: "Orígenes permitidos para CORS",
        type: "textarea",
        value: "http://localhost:3000\nhttps://plataforma.aramac.dev",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notificaciones",
    description: "Configuración de emails y alertas",
    icon: Bell,
    settings: [
      {
        id: "smtp_host",
        label: "SMTP Host",
        description: "Servidor SMTP para emails",
        type: "text",
        value: "smtp.gmail.com",
      },
      {
        id: "smtp_port",
        label: "SMTP Port",
        description: "Puerto SMTP",
        type: "number",
        value: 587,
      },
      {
        id: "email_notifications",
        label: "Notificaciones por Email",
        description: "Enviar notificaciones por email",
        type: "boolean",
        value: true,
      },
      {
        id: "admin_alerts",
        label: "Alertas de Administrador",
        description: "Notificar al administrador de eventos críticos",
        type: "boolean",
        value: true,
      },
    ],
  },
];

function ConfigSectionCard({ section }: { section: ConfigSection }) {
  const [settings, setSettings] = useState<Record<string, any>>(
    Object.fromEntries(section.settings.map((s) => [s.id, s.value])),
  );

  const Icon = section.icon;

  const updateSetting = (id: string, value: any) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const renderSettingInput = (setting: ConfigSetting) => {
    const value = settings[setting.id];

    switch (setting.type) {
      case "boolean":
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              updateSetting(setting.id, parseInt(e.target.value))
            }
            className="w-32"
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => updateSetting(setting.id, val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            rows={3}
          />
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              type={setting.sensitive ? "password" : "text"}
              value={value}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              className="flex-1"
            />
            {setting.sensitive && (
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {section.title}
        </CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {section.settings.map((setting) => (
          <div key={setting.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor={setting.id} className="text-sm font-medium">
                  {setting.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {setting.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {renderSettingInput(setting)}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetear
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemStatusCard() {
  const [systemStatus] = useState({
    configValid: true,
    lastBackup: "2 horas atrás",
    pendingUpdates: 3,
    securityScore: 95,
  });

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>
          Validación de configuración y estado general
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              Válida
            </div>
            <div className="text-sm text-muted-foreground">Configuración</div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {systemStatus.lastBackup}
            </div>
            <div className="text-sm text-muted-foreground">Último Backup</div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {systemStatus.pendingUpdates}
            </div>
            <div className="text-sm text-muted-foreground">Actualizaciones</div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {systemStatus.securityScore}%
            </div>
            <div className="text-sm text-muted-foreground">Puntuación SSL</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemConfigDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* System Config Header */}

      {/* Configuration Sections */}
      <div className="space-y-6">
        {configSections.map((section) => (
          <ConfigSectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
