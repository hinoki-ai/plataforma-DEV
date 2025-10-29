"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  return (
    <div className="flex w-full justify-center px-4 sm:px-6">
      <div className="glass-panel mx-auto flex w-full max-w-md flex-col items-center gap-6 p-6 text-center text-slate-900 dark:text-slate-100 sm:p-10">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/registro-padre"
          afterSignInUrl={callbackUrl ?? "/auth-success"}
          afterSignUpUrl={callbackUrl ?? "/auth-success"}
          appearance={{
            variables: {
              colorPrimary: "#fa7268",
              colorText: "#0f172a",
              colorTextSecondary: "#334155",
              colorInputBackground: "transparent",
              colorBackground: "transparent",
              borderRadius: "16px",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none flex w-full max-w-sm flex-col items-center gap-6 text-center",
              headerTitle:
                "text-center text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-50",
              headerSubtitle: "text-center text-slate-600 dark:text-slate-200",
              form: "w-full space-y-4 text-left",
              formFieldLabel: "text-slate-700 dark:text-slate-200 font-medium",
              formFieldInput:
                "rounded-xl border border-slate-300/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-900/55 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40",
              formFieldInputShowPasswordButton:
                "text-slate-500 hover:text-primary",
              footerActionText:
                "text-center text-slate-600 dark:text-slate-200",
              footerActionLink:
                "text-primary font-semibold hover:text-primary/80",
              formButtonPrimary:
                "rounded-xl bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 text-white font-semibold transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 focus:outline-none",
              socialButtonsBlockButton:
                "rounded-xl border border-white/50 bg-white/85 text-slate-900 shadow-sm transition hover:border-white/60 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-slate-900/70",
              socialButtonsProviderIcon: "text-slate-600 dark:text-slate-200",
              identityPreviewText: "text-slate-900 dark:text-slate-100",
            },
          }}
        />
        {/* New Parent Registration Button */}
        <div className="w-full border-t border-slate-200/50 pt-6 dark:border-slate-700/50">
          <div className="text-center">
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              ¿Eres padre o apoderado nuevo?
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl border border-white/50 bg-white/85 text-slate-900 shadow-sm transition hover:border-white/60 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-slate-900/70"
            >
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
          <div className="glass-panel mx-auto flex w-full max-w-md items-center justify-center p-6 text-slate-900 dark:text-slate-100 sm:p-10">
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
