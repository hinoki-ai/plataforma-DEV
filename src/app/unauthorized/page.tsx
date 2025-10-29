"use client";

import { useSyncExternalStore } from "react";
import { useLanguage } from "@/components/language/LanguageContext";

export default function UnauthorizedPage() {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    if (typeof queueMicrotask === "function") {
      queueMicrotask(callback);
    } else {
      setTimeout(callback, 0);
    }

    return () => {};
  };

  const getClientSnapshot = () => true;
  const getServerSnapshot = () => false;

  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { t } = useLanguage();

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
