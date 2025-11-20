"use client";

import React, { useState } from "react";
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
  Globe,
  Shield,
  Database,
  Mail,
  Bell,
  Palette,
  Languages,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  RoleAwareBreadcrumb,
  RoleAwareHeader,
} from "@/components/layout/RoleAwareNavigation";

interface GlobalSetting {
  id: string;
  label: string;
  description: string;
  type: "text" | "number" | "boolean" | "select" | "textarea";
  value: any;
  options?: string[];
  category: string;
  requiresRestart?: boolean;
}

const globalSettings: GlobalSetting[] = [
  // System Settings
  {
    id: "system_name",
    label: "Nombre del Sistema",
    description: "Nombre público del sistema",
    type: "text",
    value: "Plataforma Astral",
    category: "system",
  },
  {
    id: "system_timezone",
    label: "Zona Horaria",
    description: "Zona horaria principal del sistema",
    type: "select",
    value: "America/Santiago",
    options: ["America/Santiago", "UTC", "America/New_York", "Europe/London"],
    category: "system",
  },
  {
    id: "maintenance_mode",
    label: "Modo Mantenimiento",
    description: "Activar modo mantenimiento del sistema",
    type: "boolean",
    value: false,
    category: "system",
    requiresRestart: true,
  },

  // Security Settings
  {
    id: "session_timeout",
    label: "Timeout de Sesión",
    description:
      "Tiempo máximo de inactividad antes de cerrar sesión (minutos)",
    type: "number",
    value: 30,
    category: "security",
  },
  {
    id: "password_min_length",
    label: "Longitud Mínima de Contraseña",
    description: "Longitud mínima requerida para contraseñas",
    type: "number",
    value: 8,
    category: "security",
  },
  {
    id: "two_factor_required",
    label: "2FA Requerido",
    description: "Requerir autenticación de dos factores",
    type: "boolean",
    value: true,
    category: "security",
  },

  // Database Settings
  {
    id: "db_connection_pool",
    label: "Pool de Conexiones DB",
    description: "Número máximo de conexiones a la base de datos",
    type: "number",
    value: 20,
    category: "database",
    requiresRestart: true,
  },
  {
    id: "db_query_timeout",
    label: "Timeout de Queries",
    description: "Tiempo máximo para ejecutar queries (segundos)",
    type: "number",
    value: 30,
    category: "database",
  },

  // Email Settings
  {
    id: "smtp_host",
    label: "SMTP Host",
    description: "Servidor SMTP para envío de emails",
    type: "text",
    value: "smtp.gmail.com",
    category: "email",
  },
  {
    id: "email_notifications",
    label: "Notificaciones por Email",
    description: "Habilitar envío de notificaciones por email",
    type: "boolean",
    value: true,
    category: "email",
  },

  // UI Settings
  {
    id: "theme_default",
    label: "Tema por Defecto",
    description: "Tema visual por defecto del sistema",
    type: "select",
    value: "system",
    options: ["light", "dark", "system"],
    category: "ui",
  },
  {
    id: "language_default",
    label: "Idioma por Defecto",
    description: "Idioma por defecto del sistema",
    type: "select",
    value: "es",
    options: ["es", "en"],
    category: "ui",
  },
];

function SettingsOverviewCard() {
  const categories = ["system", "security", "database", "email", "ui"];
  const categoryStats = categories.map((cat, index) => ({
    name: cat,
    count: globalSettings.filter((s) => s.category === cat).length,
    modified: (index + 1) % 5, // Mock data - deterministic value based on index
  }));

  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          Resumen de Configuración
        </CardTitle>
        <CardDescription>
          Estado general de la configuración del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryStats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {stat.count}
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {stat.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.modified} modificados
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsFormCard({ settings }: { settings: GlobalSetting[] }) {
  const [modifiedSettings, setModifiedSettings] = useState<Record<string, any>>(
    {},
  );

  const handleSettingChange = (id: string, value: any) => {
    setModifiedSettings((prev) => ({ ...prev, [id]: value }));
  };

  const renderSettingInput = (setting: GlobalSetting) => {
    const currentValue = modifiedSettings[setting.id] ?? setting.value;

    switch (setting.type) {
      case "boolean":
        return (
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) =>
              handleSettingChange(setting.id, checked)
            }
          />
        );
      case "select":
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleSettingChange(setting.id, value)}
          >
            <SelectTrigger>
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
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            placeholder={setting.description}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) =>
              handleSettingChange(setting.id, parseInt(e.target.value))
            }
          />
        );
      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            placeholder={setting.description}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
        <CardDescription>Ajustar parámetros del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {setting.label}
                  {setting.requiresRestart && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Requiere Reinicio
                    </Badge>
                  )}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
              <div className="max-w-md">{renderSettingInput(setting)}</div>
            </div>
          ))}

          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Cambios Críticos
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Algunos cambios requieren reiniciar el sistema para tomar efecto.
              Asegúrate de tener un plan de backup antes de aplicar cambios.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Valores
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemHealthCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Salud del Sistema
        </CardTitle>
        <CardDescription>
          Estado general del sistema después de cambios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                Seguridad OK
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Configuración válida
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Base de Datos OK
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Conexión estable
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Sistema OK
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Todos los servicios activos
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GlobalSettingsDashboard() {
  const settingsByCategory = {
    system: globalSettings.filter((s) => s.category === "system"),
    security: globalSettings.filter((s) => s.category === "security"),
    database: globalSettings.filter((s) => s.category === "database"),
    email: globalSettings.filter((s) => s.category === "email"),
    ui: globalSettings.filter((s) => s.category === "ui"),
  };

  return (
    <div className="space-y-6 p-6">
      {/* Global Settings Header */}

      {/* Settings Sections */}
      <div className="space-y-6">
        <SettingsFormCard settings={settingsByCategory.system} />
        <SettingsFormCard settings={settingsByCategory.security} />
        <SettingsFormCard settings={settingsByCategory.database} />
        <SettingsFormCard settings={settingsByCategory.email} />
        <SettingsFormCard settings={settingsByCategory.ui} />
      </div>

      {/* System Health */}
      <SystemHealthCard />
    </div>
  );
}
