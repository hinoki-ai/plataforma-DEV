"use client";

import { useEffect, useState } from "react";

export function ProductionDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});

  useEffect(() => {
    const checkEnvironment = () => {
      const env = {
        // Clerk
        clerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        clerkSecret: !!process.env.CLERK_SECRET_KEY,

        // Convex
        convexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
        convexDeployment: !!process.env.CONVEX_DEPLOYMENT,

        // Node
        nodeEnv: process.env.NODE_ENV,

        // Window
        isClient: typeof window !== "undefined",
        hostname:
          typeof window !== "undefined" ? window.location.hostname : "SSR",

        // Time
        timestamp: new Date().toISOString(),
      };

      setDiagnostics(env);
    };

    checkEnvironment();
  }, []);

  // Only show in development or if there are missing env vars
  const hasMissingEnvVars =
    !diagnostics.clerkPublishable ||
    !diagnostics.clerkSecret ||
    !diagnostics.convexUrl ||
    !diagnostics.convexDeployment;

  if (diagnostics.nodeEnv === "production" && !hasMissingEnvVars) {
    return null; // Don't show in production if everything is fine
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <div className="font-bold mb-2">🔍 Production Diagnostic</div>
      <div className="space-y-1">
        <div>Node Env: {diagnostics.nodeEnv}</div>
        <div>Client: {diagnostics.isClient ? "✅" : "❌"}</div>
        <div>Hostname: {diagnostics.hostname}</div>
        <div>Clerk Pub: {diagnostics.clerkPublishable ? "✅" : "❌"}</div>
        <div>Clerk Secret: {diagnostics.clerkSecret ? "✅" : "❌"}</div>
        <div>Convex URL: {diagnostics.convexUrl ? "✅" : "❌"}</div>
        <div>Convex Deploy: {diagnostics.convexDeployment ? "✅" : "❌"}</div>
        <div>Time: {diagnostics.timestamp}</div>
      </div>
      {hasMissingEnvVars && (
        <div className="mt-2 text-yellow-300">
          ⚠️ Missing environment variables may cause issues
        </div>
      )}
    </div>
  );
}

