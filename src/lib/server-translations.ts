// 🕊️ DIVINE PARSING ORACLE - SERVER-SIDE TRANSLATION UTILITY
// For server components that need translations but can't use hooks

import type { Language } from "@/components/language/ChunkedLanguageProvider";

// Import translation files synchronously
import commonES from "@/locales/es/common.json";
import commonEN from "@/locales/en/common.json";
import profesorES from "@/locales/es/profesor.json";
import profesorEN from "@/locales/en/profesor.json";
import adminES from "@/locales/es/admin.json";
import adminEN from "@/locales/en/admin.json";
import parentES from "@/locales/es/parent.json";
import parentEN from "@/locales/en/parent.json";
import dashboardES from "@/locales/es/dashboard.json";
import dashboardEN from "@/locales/en/dashboard.json";
import navigationES from "@/locales/es/navigation.json";
import navigationEN from "@/locales/en/navigation.json";
import languageES from "@/locales/es/language.json";
import languageEN from "@/locales/en/language.json";
import contactoES from "@/locales/es/contacto.json";
import contactoEN from "@/locales/en/contact.json";
import masterES from "@/locales/es/master.json";
import masterEN from "@/locales/en/master.json";

type TranslationNamespace =
  | "common"
  | "profesor"
  | "admin"
  | "parent"
  | "dashboard"
  | "navigation"
  | "language"
  | "contacto"
  | "master";

const translations = {
  es: {
    common: commonES,
    profesor: profesorES,
    admin: adminES,
    parent: parentES,
    dashboard: dashboardES,
    navigation: navigationES,
    language: languageES,
    contacto: contactoES,
    master: masterES,
  },
  en: {
    common: commonEN,
    profesor: profesorEN,
    admin: adminEN,
    parent: parentEN,
    dashboard: dashboardEN,
    navigation: navigationEN,
    language: languageEN,
    contacto: contactoEN,
    master: masterEN,
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
