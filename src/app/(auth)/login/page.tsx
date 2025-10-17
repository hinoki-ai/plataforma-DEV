"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/registro-padre"
          afterSignInUrl={callbackUrl ?? "/auth-success"}
          afterSignUpUrl={callbackUrl ?? "/auth-success"}
          appearance={{
            variables: {
              colorPrimary: "#f88379",
              colorText: "#f9fafb",
              colorBackground: "rgba(15,23,42,0.9)",
              colorInputBackground: "rgba(15,23,42,0.6)",
            },
            elements: {
              footerActionLink: "text-primary",
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
        <div className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md">
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
