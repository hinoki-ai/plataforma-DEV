"use client";

import { DonutBackground } from "@/components/ui/donut-background";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);

  // Only use translation after mounting to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { t } = useDivineParsing(["common"]);

  // Fallback text for SSR
  const title = isMounted
    ? t("error.404.title", "common")
    : "Página no encontrada";
  const description = isMounted
    ? t("error.404.description", "common")
    : "La página que buscas no existe.";
  const homeText = isMounted
    ? t("error.404.home", "common")
    : "Volver al inicio";

  return (
    <DonutBackground>
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">{title}</h2>
        <p className="not-found-description">{description}</p>
        <a href="/" className="not-found-home-link">
          {homeText}
        </a>
      </div>
    </DonutBackground>
  );
}
