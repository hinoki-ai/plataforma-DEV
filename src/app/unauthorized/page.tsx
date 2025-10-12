"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language/LanguageContext";

export default function UnauthorizedPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only throw error after component has mounted (client-side)
  if (isMounted) {
    const unauthorizedError = new Error(t("unauthorized.message", "common"));
    unauthorizedError.name = "UnauthorizedError";
    throw unauthorizedError;
  }

  // Return loading state during SSR/build time
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t("unauthorized.verifying", "common")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("unauthorized.please_wait", "common")}
        </p>
      </div>
    </div>
  );
}
