"use client";

import { useSignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";
import { isClerkAPIResponseError } from "@clerk/shared/error";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, Variants } from "motion/react";
import { ClientOnly } from "@/components/ui/client-only";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}

function LoginFormInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle SSR by only accessing window on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we're in development mode (localhost)
  const isDev =
    isClient &&
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Hardcoded translations for login page to avoid SSR issues
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "auth.portal_title": "Portal de Acceso",
      "auth.email.label": "Correo electrónico",
      "auth.password.label": "Contraseña",
      "auth.signing_in_button": "Iniciando sesión...",
      "auth.sign_in_button": "Iniciar sesión",
      "auth.new_parent_question": "¿Eres padre/madre o apoderado?",
      "auth.register_as_parent": "Registrar como padre/madre",
      "auth.login_error": "Error al iniciar sesión",
      "auth.invalid_credentials": "Credenciales inválidas",
    };
    return translations[key] || key;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("HANDLE EMAIL SIGNIN CALLED");

    // Reset loading state at the start
    setIsLoading(true);
    setError(null);

    try {
      // DEV MODE: Check for development authentication bypass (always enabled on localhost)
      const isDev =
        isClient &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      console.log("LOGIN ATTEMPT:", {
        email,
        hostname: isClient ? window.location.hostname : "SSR",
        isDev,
      });
      if (isDev) {
        console.log("DEV MODE ENABLED");
        // Development mode authentication - bypass Clerk for testing
        const devCredentials = {
          "agustinarancibia@live.cl": {
            password: "59163476a",
            role: "MASTER",
            name: "Agustin Master Arancibia",
          },
          "admin@astral.cl": {
            password: "adminastral123.",
            role: "ADMIN",
            name: "Admin User",
          },
          "profesor@astral.cl": {
            password: "profesorastral123.",
            role: "PROFESOR",
            name: "Profesor User",
          },
          "apoderado@astral.cl": {
            password: "apoderadoastral123.",
            role: "PARENT",
            name: "Parent User",
          },
        };

        const userCred = devCredentials[email as keyof typeof devCredentials];
        console.log("USER CRED CHECK:", {
          userCred: !!userCred,
          passwordMatch: userCred?.password === password,
        });
        if (userCred && userCred.password === password) {
          // Simulate successful login by redirecting to success page with role info
          const target = `${callbackUrl ?? "/autenticacion-exitosa"}?dev_role=${userCred.role}&dev_name=${encodeURIComponent(userCred.name)}&dev_email=${encodeURIComponent(email)}`;
          console.log("DEV AUTH SUCCESS: Redirecting to:", target);
          window.location.href = target; // Use window.location for immediate redirect
          return;
        } else {
          console.log("DEV AUTH FAILED: Invalid credentials");
          setError(t("auth.invalid_credentials"));
          setIsLoading(false);
          return;
        }
      }

      // PRODUCTION MODE: Check if Clerk is loaded before proceeding
      if (!isLoaded) {
        // Wait a bit and try again, or show an error
        setTimeout(() => {
          if (!isLoaded) {
            setError(
              "Authentication service is loading. Please wait and try again.",
            );
            setIsLoading(false);
          }
        }, 2000);
        return;
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const target = callbackUrl ?? "/autenticacion-exitosa";

        router.replace(target);
        return;
      }

      setError(t("auth.login_error"));
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const firstError = err.errors?.[0];
        if (
          firstError?.code === "form_password_incorrect" ||
          firstError?.code === "form_identifier_not_found" ||
          firstError?.code === "form_identifier_invalid"
        ) {
          setError(t("auth.invalid_credentials"));
        } else {
          setError(firstError?.longMessage ?? t("auth.login_error"));
        }
      } else {
        setError(t("auth.login_error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 sm:px-6">
      {/* Title Panel with Glass Blur */}
      <div className="mb-6 w-full max-w-md">
        <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl px-6 pt-2 pb-2 mx-auto text-center -mt-20">
          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-2xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out sm:text-3xl md:text-4xl"
          >
            {t("auth.portal_title")}
          </motion.h1>
        </div>
      </div>

      <div className="glass-panel mx-auto flex w-full max-w-md flex-col items-center p-6 text-center text-foreground sm:p-10">
        {/* Email/Password Form */}

        <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-left block text-foreground font-medium"
            >
              {t("auth.email.label")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-left block text-foreground font-medium"
            >
              {t("auth.password.label")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p
              className="text-left text-sm font-medium text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || (!isLoaded && !isDev)}
            className="w-full rounded-xl bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 text-white font-semibold transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 focus:outline-none disabled:opacity-50"
          >
            {isLoading
              ? t("auth.signing_in_button")
              : !isLoaded && !isDev
                ? "Cargando..."
                : t("auth.sign_in_button")}
          </Button>
        </form>

        {/* Parent Registration Button */}
        <div className="w-full border-t border-border pt-6 mt-6">
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              {t("auth.new_parent_question")}
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link
                href="/registro-centro"
                className="flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {t("auth.register_as_parent")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFormWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return <LoginFormWithSuspense />;
}
