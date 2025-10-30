"use client";

import { DonutBackground } from "@/components/ui/donut-background";
import { useLanguage } from "@/components/language/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <DonutBackground>
      <div
        style={{
          maxWidth: "28rem",
          padding: "2rem",
          textAlign: "center",
          color: "#00ff41",
          background: "rgba(11, 11, 11, 0.85)",
          borderRadius: "1rem",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 40px rgba(0, 255, 65, 0.2)",
          border: "1px solid rgba(0, 255, 65, 0.3)",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 0 20px rgba(0, 255, 65, 0.5)",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            color: "#00ff41",
          }}
        >
          {t("error.404.title", "common")}
        </h2>
        <p style={{ marginBottom: "2rem", opacity: 0.8, color: "#9affa6" }}>
          {t("error.404.description", "common")}
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "#00ff41",
            color: "#0b0b0b",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            boxShadow: "0 0 20px rgba(0, 255, 65, 0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {t("error.404.home", "common")}
        </a>
      </div>
    </DonutBackground>
  );
}
