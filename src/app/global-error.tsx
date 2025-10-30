"use client";

import { DonutBackground } from "@/components/ui/donut-background";
import { useLanguage } from "@/components/language/LanguageContext";

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
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <DonutBackground>
          <div
            style={{
              maxWidth: "28rem",
              padding: "2rem",
              textAlign: "center",
              color: "#ff8800",
              background: "rgba(11, 11, 11, 0.85)",
              borderRadius: "1rem",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 40px rgba(255, 136, 0, 0.2)",
              border: "1px solid rgba(255, 136, 0, 0.3)",
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                textShadow: "0 0 20px rgba(255, 136, 0, 0.5)",
              }}
            >
              {t("error.global_title")}
            </h1>
            <p
              style={{
                marginBottom: "2rem",
                opacity: 0.8,
                color: "#ffbb66",
                wordBreak: "break-word",
              }}
            >
              {error?.message || t("error.global_message")}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#ff8800",
                color: "#0b0b0b",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 0 20px rgba(255, 136, 0, 0.3)",
                transition: "all 0.3s ease",
              }}
            >
              {t("error.retry")}
            </button>
          </div>
        </DonutBackground>
      </body>
    </html>
  );
}
