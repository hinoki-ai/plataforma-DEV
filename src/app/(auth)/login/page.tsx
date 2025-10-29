"use client";

import { useSignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        window.location.href = callbackUrl ?? "/auth-success";
      }
    } catch (err) {
      console.error("Error signing in:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center px-4 sm:px-6">
      <div className="glass-panel mx-auto flex w-full max-w-md flex-col items-center p-6 text-center text-foreground sm:p-10">
        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-left block text-foreground font-medium"
            >
              Correo electrónico
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
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 text-white font-semibold transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 focus:outline-none"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        {/* Parent Registration Button */}
        <div className="w-full border-t border-border pt-6 mt-6">
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              ¿Eres padre o apoderado nuevo?
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link
                href="/registro-padre"
                className="flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Registrarse como Apoderado
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center px-4 sm:px-6">
          <div className="glass-panel mx-auto flex w-full max-w-md items-center justify-center p-6 text-foreground sm:p-10">
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
