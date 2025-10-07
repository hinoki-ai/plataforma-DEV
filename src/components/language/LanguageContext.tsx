"use client";

// 🕊️ DIVINE PARSING ORACLE - LEGACY COMPATIBILITY LAYER
// ARCHITECTURE: Adapter for existing components
// MIGRATION: Seamless transition to chunked i18n system
// COMPATIBILITY: Maintains exact same interface as before

import React, { useContext, createContext } from "react";
import {
  DivineParsingOracleProvider,
  useDivineParsing,
} from "./ChunkedLanguageProvider";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, namespace?: string) => string;
  isLoading: boolean;
  error: string | null;
  loadedNamespaces: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Legacy translations for immediate fallback
const translations = {
  es: {
    "language.spanish": "Español",
    "language.english": "English",
    "language.toggle": "Cambiar idioma",
    "language.current": "Idioma actual",
    "nav.center.council": "Centro y Consejo",
    "nav.educational.project": "Proyecto Educativo",
    "nav.photos.videos": "Fotos y Videos",
    "nav.multidisciplinary.team": "Equipo Multidisciplinario",
    "nav.school.portal": "Portal Escolar",
    "nav.logout": "Cerrar Sesión",
    "nav.toggle.menu": "Alternar menú",
  },
  en: {
    "language.spanish": "Spanish",
    "language.english": "English",
    "language.toggle": "Switch language",
    "language.current": "Current language",
    "nav.center.council": "Center and Council",
    "nav.educational.project": "Educational Project",
    "nav.photos.videos": "Photos & Videos",
    "nav.multidisciplinary.team": "Multidisciplinary Team",
    "nav.school.portal": "School Portal",
    "nav.logout": "Log out",
    "nav.toggle.menu": "Toggle menu",
  },
} as const;

type TranslationKey = keyof typeof translations.es;

// Legacy compatibility provider - now uses Divine Parsing Oracle internally
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <DivineParsingOracleProvider
      initialNamespaces={["common", "navigation", "language"]}
      initialLanguage="es"
    >
      <LegacyLanguageAdapter>{children}</LegacyLanguageAdapter>
    </DivineParsingOracleProvider>
  );
}

// Adapter component to maintain exact same interface
function LegacyLanguageAdapter({ children }: { children: React.ReactNode }) {
  const divineContext = useDivineParsing(["common", "navigation", "language"]);

  // Create legacy-compatible interface
  const legacyValue: LanguageContextType = {
    language: divineContext.language,
    setLanguage: divineContext.setLanguage,
    t: (key: string, namespace?: string) => {
      // Use specified namespace or default to 'common'
      const targetNamespace = namespace || "common";

      // Try divine oracle with the correct namespace
      const divineTranslation = divineContext.t(key, targetNamespace);

      if (divineTranslation !== key) {
        return divineTranslation;
      }

      // Fallback to legacy translations for immediate compatibility
      return translations[divineContext.language][key as TranslationKey] || key;
    },
    isLoading: divineContext.isLoading,
    error: divineContext.error,
    loadedNamespaces: divineContext.loadedNamespaces,
  };

  return (
    <LanguageContext.Provider value={legacyValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Legacy hook - maintains exact same interface
export function useLanguage() {
  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return languageContext;
}
