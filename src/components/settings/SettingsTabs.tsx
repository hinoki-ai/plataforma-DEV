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
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageContext";
import { useSession } from "next-auth/react";

interface SettingsTabsProps {
  children?: React.ReactNode;
}

export function SettingsTabs({ children }: SettingsTabsProps) {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">
          {t("settings.tabs.profile", "common")}
        </TabsTrigger>
        <TabsTrigger value="account">
          {t("settings.tabs.account", "common")}
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
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.profile.title", "common")}</CardTitle>
            <CardDescription>
              {t("settings.profile.description", "common")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  {t("settings.profile.display_name", "common")}
                </Label>
                <Input
                  id="displayName"
                  placeholder={t(
                    "settings.profile.display_name_placeholder",
                    "common",
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("settings.profile.phone", "common")}
                </Label>
                <Input
                  id="phone"
                  placeholder={t(
                    "settings.profile.phone_placeholder",
                    "common",
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account">
        <PasswordChangeForm />
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.notifications.title", "common")}</CardTitle>
            <CardDescription>
              {t("settings.notifications.description", "common")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium">
                    {t("settings.notifications.event_reminders", "common")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.event_reminders_desc", "common")}
                  </p>
                </div>
                <Switch
                  defaultChecked
                  aria-label={t(
                    "settings.notifications.enable_reminders",
                    "common",
                  )}
                />
              </div>
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium">
                    {t("settings.notifications.monthly_newsletter", "common")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "settings.notifications.monthly_newsletter_desc",
                      "common",
                    )}
                  </p>
                </div>
                <Switch
                  aria-label={t(
                    "settings.notifications.subscribe_newsletter",
                    "common",
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>

      <TabsContent value="privacy">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.privacy.title", "common")}</CardTitle>
            <CardDescription>
              {t("settings.privacy.description", "common")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium">
                    {t("settings.privacy.profile_visible", "common")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.privacy.profile_visible_desc", "common")}
                  </p>
                </div>
                <Switch
                  defaultChecked
                  aria-label={t(
                    "settings.privacy.profile_visibility",
                    "common",
                  )}
                />
              </div>
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium">
                    {t("settings.privacy.share_activity", "common")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.privacy.share_activity_desc", "common")}
                  </p>
                </div>
                <Switch
                  aria-label={t(
                    "settings.privacy.share_activity_aria",
                    "common",
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {children}
    </Tabs>
  );
}

// Password Change Form Component
function PasswordChangeForm() {
  const { t } = useLanguage();
  const { data: session, update } = useSession();
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
            className={`mb-4 ${alert.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                alert.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {alert.message}
            </AlertDescription>
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

        {/* Password Policy Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Password Requirements
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Minimum 8 characters</li>
            <li>• At least one uppercase letter</li>
            <li>• At least one lowercase letter</li>
            <li>• At least one number</li>
            <li>• Must be different from current password</li>
            <li>• Avoid common passwords</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SettingsTabs;
