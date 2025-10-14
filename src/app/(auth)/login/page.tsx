"use client";

import { authenticate } from "@/services/actions/auth";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language/LanguageContext";

// ⚡ Performance: Pre-compile regex outside component
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function SubmitButton({ isLoading: parentLoading }: { isLoading: boolean }) {
  const { pending } = useFormStatus();
  const [optimisticState, setOptimisticState] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const { t } = useLanguage();

  useEffect(() => {
    if (pending) {
      setOptimisticState("submitting");
    } else {
      setOptimisticState("idle");
    }
  }, [pending]);

  const isLoading =
    pending || optimisticState === "submitting" || parentLoading;

  return (
    <Button
      type="submit"
      disabled={isLoading}
      className={cn(
        "w-[90%] transition-all duration-200 bg-[#f88379] hover:bg-[#f88379]/90 text-black",
        isLoading && "opacity-90 scale-[0.98]",
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {t("auth.signing_in")}
        </div>
      ) : (
        t("common.login")
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [authState, dispatch] = useActionState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const { status, data: session, update } = useSession();

  // Handle successful authentication - redirect immediately
  useEffect(() => {
    if (authState?.success && !isLoading) {
      console.log("✅ Login successful, redirecting to auth-success");
      setIsLoading(true);

      // Simple approach: update session and redirect
      // auth-success page will handle validation and retries
      const redirect = async () => {
        try {
          await update();
          // Small delay to ensure cookie is written
          setTimeout(() => {
            window.location.href = "/auth-success";
          }, 100);
        } catch (error) {
          console.error("Session update failed:", error);
          // Redirect anyway, auth-success will handle it
          window.location.href = "/auth-success";
        }
      };

      redirect();
    }
  }, [authState, isLoading, update]);

  // Handle loading state from session
  // REMOVED: Auto-redirect for authenticated users - this was causing redirect loops
  // Users should explicitly submit the login form or will be redirected by middleware
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else {
      // Reset loading state when session is loaded
      if (!authState?.success) {
        setIsLoading(false);
      }
    }
  }, [status, authState]);

  const emailError = useMemo(
    () =>
      emailTouched && !EMAIL_REGEX.test(email)
        ? t("auth.validation.email")
        : "",
    [emailTouched, email, t],
  );

  const passwordError = useMemo(
    () =>
      passwordTouched && password.length < 6
        ? t("auth.validation.password")
        : "",
    [passwordTouched, password, t],
  );

  return (
    <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-center text-foreground mb-6">
        {t("auth.access.title")}
      </h2>
      <form
        action={dispatch}
        className="w-full"
        autoComplete="off"
        aria-label="Formulario de inicio de sesión"
      >
        <div className="space-y-2 mb-4">
          <Label htmlFor="email" className="text-foreground">
            {t("auth.email.label")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t("auth.email.placeholder")}
            autoComplete="off"
            aria-required="true"
            aria-invalid={!!emailError}
            aria-describedby="email-error"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {emailError && (
            <div
              id="email-error"
              className="text-destructive text-xs mt-1"
              role="alert"
            >
              {emailError}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-2">
          <Label htmlFor="password" className="text-foreground">
            {t("auth.password.label")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={t("auth.password.placeholder")}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!passwordError}
              aria-describedby="password-error"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              className="focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={
                showPassword ? t("auth.password.hide") : t("auth.password.show")
              }
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.21-2.21A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3.27 3.27l17.46 17.46"
                  />
                </svg>
              )}
            </button>
          </div>
          {passwordError && (
            <div
              id="password-error"
              className="text-destructive text-xs mt-1"
              role="alert"
            >
              {passwordError}
            </div>
          )}
        </div>

        {authState?.error && (
          <div
            className="text-destructive text-sm text-center mb-6"
            role="alert"
          >
            {authState.error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-2">
          <SubmitButton isLoading={isLoading} />

          <Button
            type="button"
            className="w-3/4"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/centro-consejo";
              }
            }}
          >
            {t("auth.register")}
          </Button>

          <Button
            type="button"
            className="w-[60%]"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
          >
            {t("auth.back")}
          </Button>
        </div>
      </form>
    </div>
  );
}
