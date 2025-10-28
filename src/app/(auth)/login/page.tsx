"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  return (
    <div className="flex min-h-[100svh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/20 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/15 sm:p-10">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/registro-padre"
          afterSignInUrl={callbackUrl ?? "/auth-success"}
          afterSignUpUrl={callbackUrl ?? "/auth-success"}
          appearance={{
            variables: {
              colorPrimary: "#f88379",
              colorText: "#0f172a",
              colorTextSecondary: "#1f2937",
              colorInputBackground: "rgba(255,255,255,0.75)",
            },
            elements: {
              card: "bg-transparent shadow-none",
              headerTitle: "text-slate-900",
              headerSubtitle: "text-slate-700",
              formFieldLabel: "text-slate-800",
              formFieldInput:
                "bg-white/80 text-slate-900 placeholder:text-slate-500 border border-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30",
              footerActionText: "text-slate-700",
              footerActionLink: "text-primary",
              formButtonPrimary:
                "bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:from-primary-500 hover:to-primary-600",
              socialButtonsBlockButton:
                "bg-white/80 text-slate-900 hover:bg-white shadow-sm",
              identityPreviewText: "text-slate-900",
            },
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/20 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/15 sm:p-10">
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
