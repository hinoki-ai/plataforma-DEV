"use client";

import { useEffect } from "react";
import { useLanguage } from "./LanguageContext";

export function LanguageHtmlUpdater() {
  const { language } = useLanguage();

  useEffect(() => {
    // Only update on client side to avoid hydration mismatches
    if (typeof window === "undefined") return;

    // Map language codes to proper locale strings for better SEO and accessibility
    const languageToLocale = {
      es: "es-CL", // Spanish (Chile)
      en: "en-US", // English (US)
    };

    const locale =
      languageToLocale[language as keyof typeof languageToLocale] || "es-CL";

    // Update the HTML lang attribute for better SEO and screen reader support
    document.documentElement.lang = locale;

    // Update the dir attribute for RTL languages (prepared for future expansions)
    document.documentElement.dir = "ltr"; // Currently only LTR languages are supported

    // Announce language change to screen readers
    const announcement = document.getElementById("language-announcement");
    if (announcement) {
      announcement.textContent = `Idioma cambiado a ${language === "es" ? "español" : "inglés"}`;
    }
  }, [language]);

  // This component doesn't render anything visible
  return null;
}
