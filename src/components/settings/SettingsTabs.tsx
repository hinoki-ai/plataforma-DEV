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
} from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@/lib/auth-client";
import { handlePhoneInputChange, normalizePhoneNumber } from "@/lib/phone-utils";

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
      <TabsList className="grid w-full grid-cols-5">
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

      <TabsContent value="privacy">
        <PrivacyTab />
      </TabsContent>

      {children}
    </Tabs>
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
  });

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
        });
      } else {
        // Fallback to session data
        if (session?.user) {
          setFormData({
            name: session.user.name || "",
            phone: "",
            email: session.user.email || "",
          });
        }
      }
    } catch (error) {
      // Fallback to session data
      if (session?.user) {
        setFormData({
          name: session.user.name || "",
          phone: "",
          email: session.user.email || "",
        });
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
          phone: formData.phone.trim() ? normalizePhoneNumber(formData.phone.trim()) : undefined,
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

        <form onSubmit={handleSave} className="space-y-4">
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
                placeholder={t(
                  "settings.profile.display_name_placeholder",
                  "common",
                )}
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
                    formData.phone
                  );
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="+569 8889 67763"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from settings
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
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

      // Save to localStorage
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
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
          body: JSON.stringify(preferences),
        });
        if (!response.ok) {
        }
      } catch (error) {
        // API call is optional, localStorage is the source of truth for now
      }

      setAlert({
        type: "success",
        message: "Notification preferences saved successfully!",
      });
      // Auto-dismiss success alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to save preferences. Please try again.",
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
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.notifications.title", "common")}</CardTitle>
        <CardDescription>
          {t("settings.notifications.description", "common")}
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

        <div className="space-y-3">
          <div className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-sm">
            <div className="flex-1 pr-4">
              <p className="font-medium text-foreground">
                {t("settings.notifications.event_reminders", "common")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("settings.notifications.event_reminders_desc", "common")}
              </p>
            </div>
            <Switch
              checked={preferences.eventReminders}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, eventReminders: checked })
              }
              aria-label={t(
                "settings.notifications.enable_reminders",
                "common",
              )}
              disabled={isSaving}
              className="shrink-0"
            />
          </div>
          <div className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-sm">
            <div className="flex-1 pr-4">
              <p className="font-medium text-foreground">
                {t("settings.notifications.monthly_newsletter", "common")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("settings.notifications.monthly_newsletter_desc", "common")}
              </p>
            </div>
            <Switch
              checked={preferences.monthlyNewsletter}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, monthlyNewsletter: checked })
              }
              aria-label={t(
                "settings.notifications.subscribe_newsletter",
                "common",
              )}
              disabled={isSaving}
              className="shrink-0"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-border">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
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

  const handleSave = async () => {
    setIsSaving(true);
    setAlert(null);

    try {
      // SSR safety check
      if (typeof window === "undefined") {
        setIsSaving(false);
        return;
      }

      // Save to localStorage
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
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
          body: JSON.stringify(preferences),
        });
        if (!response.ok) {
        }
      } catch (error) {
        // API call is optional, localStorage is the source of truth for now
      }

      setAlert({
        type: "success",
        message: "Privacy settings saved successfully!",
      });
      // Auto-dismiss success alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to save settings. Please try again.",
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
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.privacy.title", "common")}</CardTitle>
        <CardDescription>
          {t("settings.privacy.description", "common")}
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

        <div className="space-y-3">
          <div className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-sm">
            <div className="flex-1 pr-4">
              <p className="font-medium text-foreground">
                {t("settings.privacy.profile_visible", "common")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("settings.privacy.profile_visible_desc", "common")}
              </p>
            </div>
            <Switch
              checked={preferences.profileVisible}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, profileVisible: checked })
              }
              aria-label={t("settings.privacy.profile_visibility", "common")}
              disabled={isSaving}
              className="shrink-0"
            />
          </div>
          <div className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-sm">
            <div className="flex-1 pr-4">
              <p className="font-medium text-foreground">
                {t("settings.privacy.share_activity", "common")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("settings.privacy.share_activity_desc", "common")}
              </p>
            </div>
            <Switch
              checked={preferences.shareActivity}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, shareActivity: checked })
              }
              aria-label={t("settings.privacy.share_activity_aria", "common")}
              disabled={isSaving}
              className="shrink-0"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-border">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
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
