"use client";

import { DonutBackground } from "@/components/ui/donut-background";
import { useLanguage } from "@/components/language/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <DonutBackground>
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">
          {t("error.404.title", "common")}
        </h2>
        <p className="not-found-description">
          {t("error.404.description", "common")}
        </p>
        <a href="/" className="not-found-home-link">
          {t("error.404.home", "common")}
        </a>
      </div>
    </DonutBackground>
  );
}
