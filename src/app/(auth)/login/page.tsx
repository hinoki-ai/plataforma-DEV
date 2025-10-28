"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  return (
    <div className="public-page-shell bg-responsive-desktop">
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
                colorPrimary: "oklch(0.5016 0.1887 27.4816)",
                colorText: "oklch(0.2393 0 0)",
                colorTextSecondary: "oklch(0.4091 0 0)",
                colorInputBackground: "rgba(255, 255, 255, 0.85)",
                colorBackground: "transparent",
                colorInputText: "oklch(0.2393 0 0)",
                colorBorder: "rgba(15, 23, 42, 0.12)",
                borderRadius: "12px",
                colorTextOnPrimaryBackground: "oklch(1 0 0)",
                colorInputTextDisabled: "oklch(0.4091 0 0)",
                colorInputPlaceholder: "oklch(0.4091 0 0)",
                colorDanger: "oklch(0.577 0.245 27.325)",
                colorSuccess: "oklch(0.577 0.245 27.325)",
                colorWarning: "oklch(0.7076 0.1975 46.4558)",
                colorNeutral: "oklch(0.4091 0 0)",
              },
              elements: {
                card: "bg-transparent shadow-none p-0",
                headerTitle:
                  "text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-50 mb-2",
                headerSubtitle:
                  "text-slate-600 dark:text-slate-200 text-sm leading-relaxed",
                form: "space-y-5",
                formField: "space-y-2",
                formFieldLabel:
                  "text-slate-700 dark:text-slate-200 font-medium text-sm",
                formFieldInput:
                  "rounded-xl border border-slate-300/70 dark:border-slate-700/60 bg-white/85 dark:bg-slate-900/55 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900/70 h-11 px-4 focus:outline-none",
                formFieldInputShowPasswordButton:
                  "text-slate-500 hover:text-primary transition-colors",
                footerActionText: "text-slate-600 dark:text-slate-200 text-sm",
                footerActionLink:
                  "text-primary font-semibold hover:text-primary/80 transition-colors",
                formButtonPrimary:
                  "rounded-xl bg-gradient-to-r from-[oklch(0.5016_0.1887_27.4816)] via-[oklch(0.5016_0.1887_27.4816)] to-[oklch(0.5016_0.1887_27.4816)] text-white font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:from-[oklch(0.6083_0.209_27.0276)] hover:via-[oklch(0.6083_0.209_27.0276)] hover:to-[oklch(0.6083_0.209_27.0276)] hover:shadow-xl hover:shadow-primary/30 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 focus:outline-none h-11 w-full dark:from-[oklch(0.6083_0.209_27.0276)] dark:via-[oklch(0.6083_0.209_27.0276)] dark:to-[oklch(0.6083_0.209_27.0276)] dark:hover:from-[oklch(0.7083_0.209_27.0276)] dark:hover:via-[oklch(0.7083_0.209_27.0276)] dark:hover:to-[oklch(0.7083_0.209_27.0276)]",
                socialButtonsBlockButton:
                  "rounded-xl border border-white/50 bg-white/85 text-slate-900 shadow-sm transition-all duration-200 hover:border-white/60 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-slate-900/70 h-11 w-full",
                socialButtonsProviderIcon: "text-slate-600 dark:text-slate-200",
                identityPreviewText:
                  "text-slate-900 dark:text-slate-100 text-sm",
                dividerLine: "bg-slate-300 dark:bg-slate-700",
                dividerText:
                  "text-slate-600 dark:text-slate-200 text-xs font-medium",
                alert:
                  "rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 p-3",
                alertText: "text-sm",
                formFieldHint:
                  "text-slate-500 dark:text-slate-400 text-xs mt-1",
                formFieldError: "text-red-600 dark:text-red-400 text-sm mt-1",
                backLink:
                  "text-primary hover:text-primary/80 transition-colors text-sm font-medium",
                otpCodeFieldInput:
                  "rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 text-center text-lg font-mono",
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
        <div className="public-page-shell bg-responsive-desktop">
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
