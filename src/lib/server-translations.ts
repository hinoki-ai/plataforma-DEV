// 🕊️ DIVINE PARSING ORACLE - SERVER-SIDE TRANSLATION UTILITY
// For server components that need translations but can't use hooks

import type { Language } from "@/components/language/ChunkedLanguageProvider";

// Import translation files synchronously
import commonES from "@/locales/es/common.json";
import commonEN from "@/locales/en/common.json";
import profesorES from "@/locales/es/profesor.json";
import profesorEN from "@/locales/en/profesor.json";

type TranslationNamespace = "common" | "profesor";

const translations = {
  es: {
    common: commonES,
    profesor: profesorES,
  },
  en: {
    common: commonEN,
    profesor: profesorEN,
  },
} as const;

export function getServerTranslation(
  key: string,
  namespace: TranslationNamespace = "common",
  language: Language = "es",
): string {
  try {
    const namespaceTranslations = translations[language][namespace];
    if (namespaceTranslations && (namespaceTranslations as any)[key]) {
      return (namespaceTranslations as any)[key];
    }

    // Fallback to common namespace
    if (namespace !== "common") {
      const commonTranslations = translations[language].common;
      if (commonTranslations && (commonTranslations as any)[key]) {
        return (commonTranslations as any)[key];
      }
    }

    // Return key if translation not found
    return key;
  } catch {
    return key;
  }
}

// Helper function for server components
export function t(
  key: string,
  namespace: TranslationNamespace = "common",
  language: Language = "es",
): string {
  return getServerTranslation(key, namespace, language);
}
