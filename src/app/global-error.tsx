"use client";

import { DonutBackground } from "@/components/ui/donut-background";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

// Global error must include html and body tags per Next.js App Router requirements
// This is the only place where html/body tags are allowed outside of layout.tsx
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // For global error, we need to get the language from localStorage since we can't use hooks normally
  const getLanguage = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aramac-language-preference") || "es";
    }
    return "es";
  };

  const language = getLanguage();
  const t = (key: string, namespace?: string) => {
    // Simple translation function for global error
    const translations = {
      es: {
        "error.global_title": "Error Global",
        "error.global_message": "Ha ocurrido un error crítico",
        "error.retry": "Intentar nuevamente",
      },
      en: {
        "error.global_title": "Global Error",
        "error.global_message": "A critical error has occurred",
        "error.retry": "Try Again",
      },
    };

    return (
      translations[language as keyof typeof translations]?.[
        key as keyof typeof translations.es
      ] || key
    );
  };

  return (
    <html lang={`${language}-CL`} suppressHydrationWarning>
      <body className="global-error-body">
        <DonutBackground>
          <div className="global-error-container">
            <h1 className="global-error-title">{t("error.global_title")}</h1>
            <p className="global-error-description">
              {error?.message || t("error.global_message")}
            </p>
            <button onClick={reset} className="global-error-retry-button">
              {t("error.retry")}
            </button>
          </div>
        </DonutBackground>
      </body>
    </html>
  );
}
