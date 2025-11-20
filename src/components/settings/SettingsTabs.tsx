import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppearanceSettings } from "./AppearanceSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  Bot,
  Settings,
  MessageSquare,
  Activity,
  Heart,
  Camera,
  Globe,
  MapPin,
  User,
  Shield,
  Bell,
  Palette,
  Trash2,
  Download,
  Key,
  Smartphone,
  Clock,
  Languages,
  Link as LinkIcon,
} from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@/lib/auth-client";
import { COGNITO_CONFIG } from "@/lib/cognito-constants";
import {
  handlePhoneInputChange,
  normalizePhoneNumber,
} from "@/lib/phone-utils";

interface SettingsTabsProps {
  children?: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const PREFERENCES_KEY = "plataforma_user_preferences";

interface UserPreferences {
  eventReminders: boolean;
  monthlyNewsletter: boolean;
  profileVisible: boolean;
  shareActivity: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  eventReminders: true,
  monthlyNewsletter: false,
  profileVisible: true,
  shareActivity: false,
};

export function SettingsTabs({
  children,
  activeTab: controlledActiveTab,
  onTabChange,
}: SettingsTabsProps) {
  const { t } = useDivineParsing(["common"]);
  const [internalActiveTab, setInternalActiveTab] = useState("profile");

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (value: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(value);
    }
    onTabChange?.(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="profile">
          {t("settings.tabs.profile", "common")}
        </TabsTrigger>
        <TabsTrigger value="security">
          {t("settings.tabs.security", "common")}
        </TabsTrigger>
        <TabsTrigger value="notifications">
          {t("settings.tabs.notifications", "common")}
        </TabsTrigger>
        <TabsTrigger value="appearance">
          {t("settings.tabs.appearance", "common")}
        </TabsTrigger>
        <TabsTrigger value="assistant">
          <Bot className="w-4 h-4 mr-2" />
          {t("settings.tabs.assistant", "Assistant")}
        </TabsTrigger>
        <TabsTrigger value="privacy">
          {t("settings.tabs.privacy", "common")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="security">
        <PasswordChangeForm />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>

      <TabsContent value="assistant">
        <AssistantTab />
      </TabsContent>

      <TabsContent value="privacy">
        <PrivacyTab />
      </TabsContent>

      {children}
    </Tabs>
  );
}

// Assistant Tab Component
function AssistantTab() {
  const { t } = useDivineParsing(["common"]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Cognito
          </CardTitle>
          <CardDescription>
            {t(
              "settings.assistant.description",
              "Compañero Organizado Guía Nuestra Inteligencia Tiempo Optimizado",
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferencias del asistente</CardTitle>
          <CardDescription>
            Personaliza cómo Cognito interactúa contigo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sound Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Notificaciones sonoras</div>
              <div className="text-xs text-muted-foreground">
                Reproducir sonidos cuando llegan respuestas
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Auto-show Tips */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Consejos automáticos</div>
              <div className="text-xs text-muted-foreground">
                Mostrar sugerencias útiles automáticamente
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Tour Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">
                Recordatorios de tutoriales
              </div>
              <div className="text-xs text-muted-foreground">
                Recordar tutoriales disponibles en nuevas secciones
              </div>
            </div>
            <Switch />
          </div>

          {/* Chat History */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">
                Guardar historial de chat
              </div>
              <div className="text-xs text-muted-foreground">
                Mantener conversaciones entre sesiones
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Nuevo chat
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Reiniciar tutoriales
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Limpiar historial
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Enviar feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Conversaciones esta semana
            </span>
            <span className="font-medium">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Preguntas respondidas</span>
            <span className="font-medium">87</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Tutoriales completados
            </span>
            <span className="font-medium">3/5</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground italic">
          {COGNITO_CONFIG.definition}
        </p>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab() {
  const { t } = useDivineParsing(["common"]);
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    title: "",
    timezone: "America/Santiago",
    language: "es",
    website: "",
    linkedin: "",
    twitter: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          bio: data.bio || "",
          title: data.title || "",
          timezone: data.timezone || "America/Santiago",
          language: data.language || "es",
          website: data.website || "",
          linkedin: data.linkedin || "",
          twitter: data.twitter || "",
        });
        setAvatarUrl(data.avatarUrl || null);
      } else {
        // Fallback to session data
        if (session?.user) {
          setFormData({
            name: session.user.name || "",
            phone: "",
            email: session.user.email || "",
            bio: "",
            title: "",
            timezone: "America/Santiago",
            language: "es",
            website: "",
            linkedin: "",
            twitter: "",
          });
          setAvatarUrl(session.user.image || null);
        }
      }
    } catch (error) {
      // Fallback to session data
      if (session?.user) {
        setFormData({
          name: session.user.name || "",
          phone: "",
          email: session.user.email || "",
          bio: "",
          title: "",
          timezone: "America/Santiago",
          language: "es",
          website: "",
          linkedin: "",
          twitter: "",
        });
        setAvatarUrl(session.user.image || null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadProfile();
    }
  }, [session, loadProfile]);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("avatar", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.url);
        setAlert({
          type: "success",
          message: "Avatar updated successfully!",
        });
      } else {
        setAlert({
          type: "error",
          message: "Failed to upload avatar",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Upload error. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAlert(null);

    // Validate form
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setAlert({
        type: "error",
        message: "Name is required",
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: formData.phone.trim()
            ? normalizePhoneNumber(formData.phone.trim())
            : undefined,
          bio: formData.bio.trim(),
          title: formData.title.trim(),
          timezone: formData.timezone,
          language: formData.language,
          website: formData.website.trim(),
          linkedin: formData.linkedin.trim(),
          twitter: formData.twitter.trim(),
          avatarUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          type: "success",
          message: "Profile updated successfully!",
        });
        await update(); // Refresh session
        // Auto-dismiss success alert after 3 seconds
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to update profile",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile.title", "common")}</CardTitle>
          <CardDescription>
            {t("settings.profile.description", "common")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.profile.title", "common")}</CardTitle>
        <CardDescription>
          {t("settings.profile.description", "common")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alert && (
          <Alert
            variant={alert.type === "success" ? "success" : "destructive"}
            className="mb-4"
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 p-4 border rounded-lg">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Camera className="w-4 h-4 text-primary-foreground" />
              </label>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Foto de perfil</h4>
              <p className="text-sm text-muted-foreground">
                Sube una imagen cuadrada de al menos 200x200px
              </p>
              {isUploading && (
                <p className="text-xs text-muted-foreground mt-1">
                  Subiendo...
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">
                {t("settings.profile.display_name", "common")}
              </Label>
              <Input
                id="displayName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Tu nombre completo"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título profesional</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Profesor, Director, etc."
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("settings.profile.phone", "common")}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = handlePhoneInputChange(
                    e.target.value,
                    formData.phone,
                  );
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="+569 1234 5678"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">
                <MapPin className="w-4 h-4 inline mr-1" />
                Zona horaria
              </Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                disabled={isSaving}
              >
                <option value="America/Santiago">Chile (Santiago)</option>
                <option value="America/Buenos_Aires">
                  Argentina (Buenos Aires)
                </option>
                <option value="America/Lima">Perú (Lima)</option>
                <option value="America/Bogota">Colombia (Bogotá)</option>
                <option value="America/Mexico_City">México (CDMX)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Biografía</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Cuéntanos sobre ti..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[80px]"
                disabled={isSaving}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Enlaces y redes sociales
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Sitio web
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://tu-sitio.com"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  placeholder="linkedin.com/in/tu-perfil"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter: e.target.value })
                  }
                  placeholder="@tu-usuario"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar desde aquí
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Notifications Tab Component
function NotificationsTab() {
  const { t } = useDivineParsing(["common"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Enhanced notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
    priorityOnly: false,
    meetingReminders: true,
    systemUpdates: true,
    marketingEmails: false,
    sessionTimeout: {
      enabled: true,
      duration: 30, // minutes
      warnBefore: 5, // minutes before timeout
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      // SSR safety check
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate structure
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          ("eventReminders" in parsed || "monthlyNewsletter" in parsed)
        ) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      }
    } catch (error) {
      // Reset to defaults on error
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setAlert(null);

    try {
      // SSR safety check
      if (typeof window === "undefined") {
        setIsSaving(false);
        return;
      }

      // Combine all preferences
      const allPreferences = {
        ...preferences,
        ...notificationSettings,
      };

      // Save to localStorage
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPreferences));
      } catch (error) {
        // Handle quota exceeded or other localStorage errors
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          setAlert({
            type: "error",
            message: "Storage quota exceeded. Please clear some browser data.",
          });
          setIsSaving(false);
          return;
        }
        throw error;
      }

      // Also save to API if available
      try {
        const response = await fetch("/api/profile/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(allPreferences),
        });
        if (!response.ok) {
        }
      } catch (error) {
        // API call is optional, localStorage is the source of truth for now
      }

      setAlert({
        type: "success",
        message: "Preferencias de notificaciones guardadas exitosamente!",
      });
      // Auto-dismiss success alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          "Error al guardar las preferencias. Por favor intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications.title", "common")}</CardTitle>
          <CardDescription>
            {t("settings.notifications.description", "common")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channels Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Canales de notificación
          </CardTitle>
          <CardDescription>
            Elige cómo quieres recibir las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Notificaciones push</div>
                  <div className="text-xs text-muted-foreground">
                    En el navegador y app móvil
                  </div>
                </div>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: checked,
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    Notificaciones por email
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Resúmenes y actualizaciones importantes
                  </div>
                </div>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: checked,
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">SMS (próximamente)</div>
                  <div className="text-xs text-muted-foreground">
                    Solo para notificaciones críticas
                  </div>
                </div>
              </div>
              <Switch
                checked={notificationSettings.smsNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: checked,
                  })
                }
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horas de silencio
          </CardTitle>
          <CardDescription>
            Pausa las notificaciones durante ciertas horas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Activar horas de silencio
              </div>
              <div className="text-xs text-muted-foreground">
                No recibir notificaciones durante el horario configurado
              </div>
            </div>
            <Switch
              checked={notificationSettings.quietHours.enabled}
              onCheckedChange={(enabled) =>
                setNotificationSettings({
                  ...notificationSettings,
                  quietHours: { ...notificationSettings.quietHours, enabled },
                })
              }
              disabled={isSaving}
            />
          </div>

          {notificationSettings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="quietStart">Hora de inicio</Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={notificationSettings.quietHours.start}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      quietHours: {
                        ...notificationSettings.quietHours,
                        start: e.target.value,
                      },
                    })
                  }
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietEnd">Hora de fin</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={notificationSettings.quietHours.end}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      quietHours: {
                        ...notificationSettings.quietHours,
                        end: e.target.value,
                      },
                    })
                  }
                  disabled={isSaving}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de notificación</CardTitle>
          <CardDescription>
            Elige qué tipos de notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Recordatorios de reuniones
              </div>
              <div className="text-xs text-muted-foreground">
                Notificaciones sobre citas y reuniones programadas
              </div>
            </div>
            <Switch
              checked={notificationSettings.meetingReminders}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  meetingReminders: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Actualizaciones del sistema
              </div>
              <div className="text-xs text-muted-foreground">
                Nuevas funcionalidades y mantenimiento
              </div>
            </div>
            <Switch
              checked={notificationSettings.systemUpdates}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  systemUpdates: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Solo notificaciones prioritarias
              </div>
              <div className="text-xs text-muted-foreground">
                Filtrar solo notificaciones importantes
              </div>
            </div>
            <Switch
              checked={notificationSettings.priorityOnly}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  priorityOnly: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Emails de marketing</div>
              <div className="text-xs text-muted-foreground">
                Novedades, consejos y ofertas especiales
              </div>
            </div>
            <Switch
              checked={notificationSettings.marketingEmails}
              onCheckedChange={(checked) =>
                setNotificationSettings({
                  ...notificationSettings,
                  marketingEmails: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Timeout Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Controles de sesión
          </CardTitle>
          <CardDescription>
            Gestiona la duración y seguridad de tus sesiones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Cierre automático de sesión
              </div>
              <div className="text-xs text-muted-foreground">
                Cerrar sesión automáticamente después de inactividad
              </div>
            </div>
            <Switch
              checked={notificationSettings.sessionTimeout.enabled}
              onCheckedChange={(enabled) =>
                setNotificationSettings({
                  ...notificationSettings,
                  sessionTimeout: {
                    ...notificationSettings.sessionTimeout,
                    enabled,
                  },
                })
              }
              disabled={isSaving}
            />
          </div>

          {notificationSettings.sessionTimeout.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionDuration">
                    Duración de sesión (minutos)
                  </Label>
                  <select
                    id="sessionDuration"
                    value={notificationSettings.sessionTimeout.duration}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        sessionTimeout: {
                          ...notificationSettings.sessionTimeout,
                          duration: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    disabled={isSaving}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                    <option value="240">4 horas</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warnBefore">Advertir antes (minutos)</Label>
                  <select
                    id="warnBefore"
                    value={notificationSettings.sessionTimeout.warnBefore}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        sessionTimeout: {
                          ...notificationSettings.sessionTimeout,
                          warnBefore: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    disabled={isSaving}
                  >
                    <option value="1">1 minuto</option>
                    <option value="5">5 minutos</option>
                    <option value="10">10 minutos</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Información de seguridad
                    </div>
                    <div className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                      Recibirás una notificación{" "}
                      {notificationSettings.sessionTimeout.warnBefore} minutos
                      antes del cierre automático. Esto ayuda a proteger tu
                      cuenta cuando te alejas del dispositivo.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert and Save */}
      {alert && (
        <Alert
          variant={alert.type === "success" ? "success" : "destructive"}
          className="mb-4"
        >
          {alert.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Privacy Tab Component
function PrivacyTab() {
  const { t } = useDivineParsing(["common"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Enhanced privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    activitySharing: false,
    dataAnalytics: true,
    personalizedAds: false,
    thirdPartySharing: false,
    dataRetention: "1year", // 1year, 2years, forever
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      // SSR safety check
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate structure
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          ("profileVisible" in parsed || "shareActivity" in parsed)
        ) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      }
    } catch (error) {
      // Reset to defaults on error
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setExportLoading(true);
    try {
      const response = await fetch("/api/privacy/export-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `datos-personales-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setAlert({
          type: "success",
          message:
            "Datos exportados exitosamente. Revisa tu carpeta de descargas.",
        });
      } else {
        setAlert({
          type: "error",
          message: "Error al exportar los datos. Por favor intenta nuevamente.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          "Error de conexión. Por favor verifica tu conexión a internet.",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/privacy/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        setAlert({
          type: "success",
          message: "Cuenta eliminada exitosamente. Serás redirigido en breve.",
        });
        // Redirect after a delay
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        setAlert({
          type: "error",
          message:
            "Error al eliminar la cuenta. Por favor contacta al soporte.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error de conexión. Por favor intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setAlert(null);

    try {
      // SSR safety check
      if (typeof window === "undefined") {
        setIsSaving(false);
        return;
      }

      // Combine all preferences
      const allPreferences = {
        ...preferences,
        ...privacySettings,
      };

      // Save to localStorage
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPreferences));
      } catch (error) {
        // Handle quota exceeded or other localStorage errors
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          setAlert({
            type: "error",
            message: "Storage quota exceeded. Please clear some browser data.",
          });
          setIsSaving(false);
          return;
        }
        throw error;
      }

      // Also save to API if available
      try {
        const response = await fetch("/api/profile/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(allPreferences),
        });
        if (!response.ok) {
        }
      } catch (error) {
        // API call is optional, localStorage is the source of truth for now
      }

      setAlert({
        type: "success",
        message: "Configuración de privacidad guardada exitosamente!",
      });
      // Auto-dismiss success alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          "Error al guardar la configuración. Por favor intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.privacy.title", "common")}</CardTitle>
          <CardDescription>
            {t("settings.privacy.description", "common")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Controles de privacidad
          </CardTitle>
          <CardDescription>
            Gestiona quién puede ver tu información y actividad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-sm">Perfil público</div>
              <div className="text-xs text-muted-foreground">
                Permitir que otros usuarios vean tu perfil
              </div>
            </div>
            <Switch
              checked={privacySettings.profileVisibility}
              onCheckedChange={(checked) =>
                setPrivacySettings({
                  ...privacySettings,
                  profileVisibility: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-sm">Compartir actividad</div>
              <div className="text-xs text-muted-foreground">
                Mostrar tu actividad en el feed público
              </div>
            </div>
            <Switch
              checked={privacySettings.activitySharing}
              onCheckedChange={(checked) =>
                setPrivacySettings({
                  ...privacySettings,
                  activitySharing: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-sm">Analytics y mejora</div>
              <div className="text-xs text-muted-foreground">
                Ayudar a mejorar la plataforma con datos de uso
              </div>
            </div>
            <Switch
              checked={privacySettings.dataAnalytics}
              onCheckedChange={(checked) =>
                setPrivacySettings({
                  ...privacySettings,
                  dataAnalytics: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-sm">Anuncios personalizados</div>
              <div className="text-xs text-muted-foreground">
                Mostrar contenido relevante basado en tu actividad
              </div>
            </div>
            <Switch
              checked={privacySettings.personalizedAds}
              onCheckedChange={(checked) =>
                setPrivacySettings({
                  ...privacySettings,
                  personalizedAds: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-sm">Compartir con terceros</div>
              <div className="text-xs text-muted-foreground">
                Permitir compartir datos con partners de confianza
              </div>
            </div>
            <Switch
              checked={privacySettings.thirdPartySharing}
              onCheckedChange={(checked) =>
                setPrivacySettings({
                  ...privacySettings,
                  thirdPartySharing: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Gestión de datos
          </CardTitle>
          <CardDescription>
            Controla tus datos personales y su almacenamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Retención de datos</Label>
            <select
              value={privacySettings.dataRetention}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  dataRetention: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              disabled={isSaving}
            >
              <option value="1year">1 año</option>
              <option value="2years">2 años</option>
              <option value="forever">Indefinidamente</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Cuánto tiempo mantener tus datos después de inactividad
            </p>
          </div>

          <div className="pt-4 border-t space-y-3">
            <Button
              variant="outline"
              onClick={handleDataExport}
              disabled={exportLoading}
              className="w-full"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar mis datos
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Descarga una copia de todos tus datos personales en formato JSON
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles que afectan tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h4 className="font-medium text-sm mb-2">Eliminar cuenta</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Una vez eliminada tu cuenta, no hay vuelta atrás. Por favor,
                asegúrate de haber exportado tus datos primero.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSaving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert and Save */}
      {alert && (
        <Alert
          variant={alert.type === "success" ? "success" : "destructive"}
          className="mb-4"
        >
          {alert.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">
                ¿Eliminar cuenta?
              </CardTitle>
              <CardDescription>
                Esta acción no se puede deshacer. Perderás acceso a todos tus
                datos y configuraciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleAccountDeletion}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Password Change Form Component
function PasswordChangeForm() {
  const { t } = useDivineParsing(["common"]);
  const { data: session, update } = useSession();

  // Check if user is OAuth-only (can't change password)
  const isOAuthUser =
    session?.user?.isOAuthUser || session?.user?.provider !== "clerk";
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const strengthBarRef = useRef<HTMLDivElement>(null);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (field === "newPassword") {
        setPasswordStrength(calculatePasswordStrength(value));
      }

      // Clear any previous alerts when user starts typing
      if (alert) setAlert(null);
    };

  // Update password strength bar width dynamically
  useEffect(() => {
    if (strengthBarRef.current) {
      strengthBarRef.current.style.width = `${passwordStrength}%`;
    }
  }, [passwordStrength]);

  const togglePasswordVisibility =
    (field: keyof typeof showPasswords) => () => {
      setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return "Current password is required";
    }
    if (!formData.newPassword) {
      return "New password is required";
    }
    if (formData.newPassword.length < 8) {
      return "New password must be at least 8 characters long";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (formData.currentPassword === formData.newPassword) {
      return "New password must be different from current password";
    }
    if (passwordStrength < 60) {
      return "Password is too weak. Please choose a stronger password";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setAlert({ type: "error", message: validationError });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          type: "success",
          message:
            "Password changed successfully! You may need to log in again on other devices.",
        });

        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength(0);

        // Update session to reflect changes
        await update();

        // Auto-dismiss success alert after 5 seconds
        setTimeout(() => setAlert(null), 5000);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to change password",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  // Show message for OAuth users
  if (isOAuthUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t("settings.account.title", "Change Password")}
          </CardTitle>
          <CardDescription>
            {t(
              "settings.account.description",
              "Update your account password to keep your account secure",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Password changes are not available for accounts signed in with
              social providers. Please use your authentication provider to
              manage your password.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          {t("settings.account.title", "Change Password")}
        </CardTitle>
        <CardDescription>
          {t(
            "settings.account.description",
            "Update your account password to keep your account secure",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alert && (
          <Alert
            variant={alert.type === "success" ? "success" : "destructive"}
            className="mb-4"
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handlePasswordChange("currentPassword")}
                placeholder="Enter your current password"
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility("current")}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={handlePasswordChange("newPassword")}
                placeholder="Enter your new password"
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility("new")}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Password Strength</span>
                  <span
                    className={`font-medium ${
                      passwordStrength < 40
                        ? "text-red-600"
                        : passwordStrength < 70
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    ref={strengthBarRef}
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                  />
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    At least 8 characters
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    Lowercase letter
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    Uppercase letter
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${/\d/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    Number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handlePasswordChange("confirmPassword")}
                placeholder="Confirm your new password"
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility("confirm")}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>

        {/* Password Requirements - Simplified */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Your password must be at least 8 characters with uppercase,
            lowercase, and a number
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SettingsTabs;
