"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  return (
    <div className="public-page-shell bg-responsive-desktop bg-home-page">
      <div className="public-page-content public-page-content--narrow space-y-6">
        <div className="mx-auto w-fit rounded-full border border-white/50 bg-white/60 px-4 py-1 text-sm font-medium text-slate-700 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/45 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100">
          Plataforma Astral · Apoderados
        </div>

        <div className="glass-panel w-full max-w-md mx-auto p-6 sm:p-10 text-slate-900 dark:text-slate-100">
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
                card: "bg-transparent shadow-none",
                headerTitle:
                  "text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-50",
                headerSubtitle: "text-slate-600 dark:text-slate-200",
                form: "space-y-4",
                formFieldLabel:
                  "text-slate-700 dark:text-slate-200 font-medium",
                formFieldInput:
                  "rounded-xl border border-slate-300/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-900/55 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-sm transition focus:border-primary/70 focus:ring-2 focus:ring-primary/40",
                formFieldInputShowPasswordButton:
                  "text-slate-500 hover:text-primary",
                footerActionText: "text-slate-600 dark:text-slate-200",
                footerActionLink:
                  "text-primary font-semibold hover:text-primary/80",
                formButtonPrimary:
                  "rounded-xl bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary/25 transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 focus:outline-none",
                socialButtonsBlockButton:
                  "rounded-xl border border-white/50 bg-white/85 text-slate-900 shadow-sm transition hover:border-white/60 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-slate-900/70",
                socialButtonsProviderIcon: "text-slate-600 dark:text-slate-200",
                identityPreviewText: "text-slate-900 dark:text-slate-100",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="public-page-shell bg-responsive-desktop bg-home-page">
          <div className="public-page-content public-page-content--narrow">
            <div className="glass-panel w-full max-w-md mx-auto p-6 sm:p-10 text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
