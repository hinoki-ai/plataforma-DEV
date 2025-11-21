"use client";

/**
 * GLOBAL SETTINGS DASHBOARD - ENGLISH ONLY
 *
 * CRITICAL RULE: This component MUST remain English-only and hardcoded.
 * No translations, i18n hooks, or internationalization allowed.
 *
 * This is a strict requirement that cannot be broken for:
 * - Master dashboard consistency
 * - Technical admin interface standards
 * - Performance optimization
 * - Avoiding translation overhead for system administrators
 *
 * If you need to add text, hardcode it in English only.
 * DO NOT add useDivineParsing, useLanguage, or any translation hooks.
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Globe,
  Shield,
  Database,
  Mail,
  Bell,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface GlobalSettings {
  system: {
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: string;
    twoFactorRequired: boolean;
  };
  database: {
    backupFrequency: string;
    retentionDays: number;
    autoCleanup: boolean;
  };
}

const defaultSettings: GlobalSettings = {
  system: {
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
    debugMode: false,
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    smsEnabled: false,
  },
  security: {
    sessionTimeout: 3600,
    passwordPolicy: "strong",
    twoFactorRequired: false,
  },
  database: {
    backupFrequency: "daily",
    retentionDays: 30,
    autoCleanup: true,
  },
};

export function GlobalSettingsDashboard() {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof GlobalSettings>(
    section: K,
    key: keyof GlobalSettings[K],
    value: GlobalSettings[K][keyof GlobalSettings[K]],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Global settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Global System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings that affect all institutions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply them.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Basic system settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.system.timezone}
                  onValueChange={(value) =>
                    updateSetting("system", "timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select
                  value={settings.system.language}
                  onValueChange={(value) =>
                    updateSetting("system", "language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put system in maintenance mode
                  </p>
                </div>
                <Switch
                  checked={settings.system.maintenanceMode}
                  onCheckedChange={(checked) =>
                    updateSetting("system", "maintenanceMode", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed logging
                  </p>
                </div>
                <Switch
                  checked={settings.system.debugMode}
                  onCheckedChange={(checked) =>
                    updateSetting("system", "debugMode", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  updateSetting(
                    "security",
                    "sessionTimeout",
                    parseInt(e.target.value),
                  )
                }
                min="300"
                max="86400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-policy">Password Policy</Label>
              <Select
                value={settings.security.passwordPolicy}
                onValueChange={(value) =>
                  updateSetting("security", "passwordPolicy", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (8+ chars)</SelectItem>
                  <SelectItem value="strong">
                    Strong (12+ chars, mixed)
                  </SelectItem>
                  <SelectItem value="complex">
                    Complex (16+ chars, special)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require 2FA</Label>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication required
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactorRequired}
                onCheckedChange={(checked) =>
                  updateSetting("security", "twoFactorRequired", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system notification channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via email
                </p>
              </div>
              <Switch
                checked={settings.notifications.emailEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("notifications", "emailEnabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send push notifications
                </p>
              </div>
              <Switch
                checked={settings.notifications.pushEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("notifications", "pushEnabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via SMS
                </p>
              </div>
              <Switch
                checked={settings.notifications.smsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("notifications", "smsEnabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Settings
            </CardTitle>
            <CardDescription>
              Configure database backup and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select
                value={settings.database.backupFrequency}
                onValueChange={(value) =>
                  updateSetting("database", "backupFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-days">Retention Period (days)</Label>
              <Input
                id="retention-days"
                type="number"
                value={settings.database.retentionDays}
                onChange={(e) =>
                  updateSetting(
                    "database",
                    "retentionDays",
                    parseInt(e.target.value),
                  )
                }
                min="1"
                max="365"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Cleanup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically clean old data
                </p>
              </div>
              <Switch
                checked={settings.database.autoCleanup}
                onCheckedChange={(checked) =>
                  updateSetting("database", "autoCleanup", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
