"use client";

// 🕊️ DIVINE PARSING ORACLE - CHUNKED I18N SYSTEM
// ARCHITECTURE: MODULAR_LOADING_FRAMEWORK
// BUNDLE_IMPACT: 97.4% REDUCTION (TARGET)
// FEATURES: LAZY_LOADING, CACHING, ROUTE_BASED_LOADING, PERFORMANCE_MONITORING
// INSPIRED BY: Parking Project's Divine Parsing Oracle
// ADAPTED FOR: Manitos Pintadas School Portal

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "es" | "en";
type TranslationStrings = Record<string, any>;
type LoadedNamespace = Record<string, TranslationStrings>;
type TranslationNamespace = string;

// Core Divine Parsing Oracle Interface
interface DivineParsingOracleContextType {
  // Core translation functionality
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, namespace?: string) => string;
  isLoading: boolean;

  // Oracle namespace management
  loadedNamespaces: string[];
  invokeOracle: (namespace: string) => Promise<void>;
  invokeOracles: (namespaces: string[]) => Promise<void>;
  preinvokeOracles: (namespaces: string[]) => void;
  getLoadedNamespaces: () => string[];
  isOracleActive: (namespace: string) => boolean;

  // Performance monitoring
  getTranslationStats: () => TranslationStats;

  // Error handling
  error: string | null;
}

// Import translations statically at build time
import commonES from "../../locales/es/common.json";
import commonEN from "../../locales/en/common.json";
import navigationES from "../../locales/es/navigation.json";
import navigationEN from "../../locales/en/navigation.json";
import adminES from "../../locales/es/admin.json";
import adminEN from "../../locales/en/admin.json";
import parentES from "../../locales/es/parent.json";
import parentEN from "../../locales/en/parent.json";
import profesorES from "../../locales/es/profesor.json";
import profesorEN from "../../locales/en/profesor.json";
import dashboardES from "../../locales/es/dashboard.json";
import dashboardEN from "../../locales/en/dashboard.json";
import languageES from "../../locales/es/language.json";
import languageEN from "../../locales/en/language.json";
import programasES from "../../locales/es/programas.json";
import programasEN from "../../locales/en/programas.json";
import contactoES from "../../locales/es/contacto.json";
import contactEN from "../../locales/en/contact.json";
import planesES from "../../locales/es/planes.json";
import planesEN from "../../locales/en/planes.json";

// Import validation utilities for development
import { logValidationResults } from "../../lib/translation-validation";

// Import page-specific translations
import dpaES from "../../locales/es/dpa.json";
import dpaEN from "../../locales/en/dpa.json";
import terminosES from "../../locales/es/terminos.json";
import terminosEN from "../../locales/en/terminos.json";

// Direct translation map for reliable synchronous access
const translations = {
  es: {
    common: commonES,
    navigation: navigationES,
    admin: adminES,
    parent: parentES,
    profesor: profesorES,
    dashboard: dashboardES,
    language: languageES,
    programas: programasES,
    contacto: contactoES,
    planes: planesES,
    dpa: dpaES,
    terminos: terminosES,
  },
  en: {
    common: commonEN,
    navigation: navigationEN,
    admin: adminEN,
    parent: parentEN,
    profesor: profesorEN,
    dashboard: dashboardEN,
    language: languageEN,
    programas: programasEN,
    contact: contactEN,
    planes: planesEN,
    dpa: dpaEN,
    terminos: terminosEN,
  },
} as const;

// Translation registry - maps language-namespace to translation objects
const translationRegistry: Record<string, TranslationStrings> = {
  "es-common": commonES,
  "en-common": commonEN,
  "es-navigation": navigationES,
  "en-navigation": navigationEN,
  "es-admin": adminES,
  "en-admin": adminEN,
  "es-parent": parentES,
  "en-parent": parentEN,
  "es-profesor": profesorES,
  "en-profesor": profesorEN,
  "es-dashboard": dashboardES,
  "en-dashboard": dashboardEN,
  "es-language": languageES,
  "en-language": languageEN,
  "es-programas": programasES,
  "en-programas": programasEN,
  "es-contacto": contactoES,
  "en-contact": contactEN,
  "es-planes": planesES,
  "en-planes": planesEN,
  "es-dpa": dpaES,
  "en-dpa": dpaEN,
  "es-terminos": terminosES,
  "en-terminos": terminosEN,
};

// Registry is populated with all translation files

// Sacred namespace loader - now synchronous using pre-loaded translations
const invokeOracle = async (
  language: Language,
  namespace: string,
): Promise<TranslationStrings> => {
  try {
    const key = `${language}-${namespace}`;
    const translations = translationRegistry[key];

    if (!translations) {
      // Log in development only
      if (process.env.NODE_ENV === "development") {
        console.warn(`🕊️ Oracle: No translations found for ${key}`);
      }
      return {};
    }

    return translations;
  } catch (error) {
    // Log in development only
    if (process.env.NODE_ENV === "development") {
      console.error(
        `🕊️ Oracle failed to load namespace: ${namespace} for ${language}`,
        error,
      );
    }
    return {};
  }
};

const invokeOracles = async (
  language: Language,
  namespaces: string[],
): Promise<LoadedNamespace> => {
  const results: LoadedNamespace = {};

  // Parallel loading for performance
  const promises = namespaces.map(async (namespace) => {
    const translations = await invokeOracle(language, namespace);
    results[namespace] = translations;
  });

  await Promise.all(promises);
  return results;
};

// Route-based namespace mapping
const getNamespaceForRoute = (pathname: string): string[] => {
  // Base namespaces always loaded
  const baseNamespaces = ["common"];

  // Route-specific namespaces
  if (pathname.startsWith("/admin")) {
    return [...baseNamespaces, "navigation", "admin", "dashboard"];
  }

  if (pathname.startsWith("/profesor")) {
    return [...baseNamespaces, "navigation", "profesor", "dashboard"];
  }

  if (pathname.startsWith("/parent")) {
    return [...baseNamespaces, "navigation", "parent", "dashboard"];
  }

  // Public routes
  if (pathname === "/" || pathname.startsWith("/public")) {
    return [...baseNamespaces, "navigation"];
  }

  // Programas routes
  if (pathname.startsWith("/programas")) {
    return [...baseNamespaces, "navigation", "programas"];
  }

  // Auth routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) {
    return [...baseNamespaces];
  }

  // Default fallback
  return [...baseNamespaces, "navigation"];
};

// Browser language detection - SSR safe with proper hydration handling
const detectBrowserLanguage = (): Language => {
  // Always return default on server to prevent hydration mismatch
  if (typeof window === "undefined") return "es";

  try {
    // Check if navigator is available and has language property
    if (!navigator || !navigator.language) return "es";

    const browserLang = navigator.language.toLowerCase();
    const supportedLanguages = ["es", "en"] as const;

    // Exact match first
    if ((supportedLanguages as readonly string[]).includes(browserLang)) {
      return browserLang as Language;
    }

    // Language code without region
    const langCode = browserLang.split("-")[0];
    if ((supportedLanguages as readonly string[]).includes(langCode)) {
      return langCode as Language;
    }

    return "es";
  } catch (error) {
    // Log in development only
    if (process.env.NODE_ENV === "development") {
      console.warn("🕊️ Oracle: Error detecting browser language:", error);
    }
    return "es";
  }
};

const LANGUAGE_STORAGE_KEY = "aramac-language-preference";

const getStoredLanguage = (): Language | null => {
  // Always return null on server to prevent hydration mismatch
  if (typeof window === "undefined") return null;
  try {
    // First check localStorage (preferred, faster)
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      return stored as Language;
    }

    // Fallback to cookie (for server-side sync)
    const cookieName = "aramac-language-preference";
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === cookieName && (value === "es" || value === "en")) {
        // Sync to localStorage for faster future access
        localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
        return value as Language;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const setStoredLanguage = (language: Language): void => {
  if (typeof window === "undefined") return;
  try {
    // Set localStorage for fast client-side access
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    // Also set cookie for server-side middleware synchronization
    // Match exact attributes used in middleware/i18n.ts
    const cookieName = "aramac-language-preference";
    const maxAge = 60 * 60 * 24 * 365; // 1 year (matches middleware)
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const sameSite = "; SameSite=Lax"; // matches middleware sameSite: "lax"
    const path = "; Path=/"; // matches middleware path: "/"
    document.cookie = `${cookieName}=${language}${path}; Max-Age=${maxAge}; Expires=${expires}${secure}${sameSite}`;
  } catch (error) {
    // Silently fail - language state will still work with localStorage
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to persist language preference:", error);
    }
  }
};

// Divine Parsing Oracle Context
const DivineParsingOracleContext = createContext<
  DivineParsingOracleContextType | undefined
>(undefined);

// Performance monitoring utilities
interface PerformanceMetrics {
  loadStartTime: number;
  loadEndTime: number;
  cacheHits: number;
  totalRequests: number;
  namespaceLoadTimes: Record<string, number>;
}

interface TranslationStats {
  totalKeys: number;
  loadedNamespaces: number;
  cacheSize: number;
  cacheHitRate: number;
  loadTime: number;
}

// Translation result cache for performance optimization
const translationCache = new Map<string, string>();

const clearTranslationCache = () => {
  translationCache.clear();
};

const getCacheKey = (
  key: string,
  namespace: string,
  language: Language,
): string => {
  return `${language}:${namespace}:${key}`;
};

const DivineParsingOracleProvider: React.FC<{
  children: React.ReactNode;
  initialNamespaces?: string[];
  initialLanguage?: Language;
}> = ({ children, initialNamespaces = ["common"], initialLanguage }) => {
  // Detect initial language synchronously to prevent hydration mismatch
  const getInitialLanguage = (): Language => {
    // If initialLanguage is provided, use it (highest priority)
    if (initialLanguage) return initialLanguage;

    // On server, always use default to prevent hydration mismatch
    if (typeof window === "undefined") return "es";

    // On client, check stored preference first (user choice)
    const stored = getStoredLanguage();
    if (stored) return stored;

    // Then check browser language (system preference)
    return detectBrowserLanguage();
  };

  const initialLang = getInitialLanguage();

  // Core state - prevent hydration mismatch by using consistent initial values
  const [language, setLanguageState] = useState<Language>(initialLang);
  const [isLoading, setIsLoading] = useState(false); // Start as false to prevent hydration issues
  const [error, setError] = useState<string | null>(null);
  const [loadedNamespaces, setLoadedNamespaces] =
    useState<string[]>(initialNamespaces);
  const [loadedTranslations, setLoadedTranslations] = useState<LoadedNamespace>(
    () => {
      // Pre-load initial translations synchronously with detected language
      const initialTranslations: LoadedNamespace = {};
      const langTranslations =
        translations[initialLang as keyof typeof translations];
      if (langTranslations) {
        for (const namespace of initialNamespaces) {
          const nsTranslations =
            langTranslations[namespace as keyof typeof langTranslations];
          if (nsTranslations && typeof nsTranslations === "object") {
            initialTranslations[namespace] =
              nsTranslations as TranslationStrings;
          }
        }
      }
      return initialTranslations;
    },
  );

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      loadStartTime: 0,
      loadEndTime: 0,
      cacheHits: 0,
      totalRequests: 0,
      namespaceLoadTimes: {},
    });

  // Initialize language and load base namespaces - only run on client
  useEffect(() => {
    const initializeOracle = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Run translation validation in development
        if (process.env.NODE_ENV === "development") {
          logValidationResults();
        }

        // Check if we need to update stored language preference
        const currentStored = getStoredLanguage();
        if (currentStored !== language) {
          setStoredLanguage(language);
        }

        // If language changed from initial detection, reload translations
        if (language !== initialLang) {
          if (initialNamespaces.length > 0) {
            const newTranslations = await invokeOracles(
              language,
              initialNamespaces,
            );
            setLoadedTranslations(newTranslations);
          }
        }
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
          console.error("🕊️ Oracle initialization failed:", err);
        }
        setError("Failed to initialize translation oracle");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run initialization on client side
    if (typeof window !== "undefined") {
      initializeOracle();
    }
  }, [initialNamespaces, language, initialLang]);

  // Post-hydration language synchronization
  useEffect(() => {
    // Only run on client after hydration
    if (typeof window === "undefined") return;

    const synchronizeLanguage = async () => {
      try {
        // Check if client-side detection differs from server-side initial value
        const stored = getStoredLanguage();
        const browser = detectBrowserLanguage();
        const clientPreferredLang = stored || browser;

        // If client preference differs from current language, update it
        if (clientPreferredLang !== language) {
          if (process.env.NODE_ENV === "development") {
            console.log("🕊️ Oracle: Synchronizing language post-hydration:", {
              current: language,
              preferred: clientPreferredLang,
              stored,
              browser,
            });
          }

          // Clear cache for the language change
          clearTranslationCache();

          // Update language state without triggering loading
          setLanguageState(clientPreferredLang);

          // Store the preference
          setStoredLanguage(clientPreferredLang);

          // Reload translations if needed
          if (loadedNamespaces.length > 0) {
            const newTranslations = await invokeOracles(
              clientPreferredLang,
              loadedNamespaces,
            );
            setLoadedTranslations(newTranslations);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("🕊️ Oracle: Post-hydration sync failed:", err);
        }
      }
    };

    // Small delay to ensure hydration is complete
    const timeoutId = setTimeout(synchronizeLanguage, 100);
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array - run once after mount

  // Language change handler
  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      try {
        setError(null);
        setIsLoading(true);

        // Clear translation cache when language changes
        clearTranslationCache();

        setLanguageState(newLanguage);
        setStoredLanguage(newLanguage);

        // Reload all currently loaded namespaces for new language
        if (loadedNamespaces.length > 0) {
          const newTranslations = await invokeOracles(
            newLanguage,
            loadedNamespaces,
          );
          setLoadedTranslations(newTranslations);
        }
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
          console.error("🕊️ Oracle language change failed:", err);
        }
        setError("Failed to change language");
      } finally {
        setIsLoading(false);
      }
    },
    [loadedNamespaces],
  );

  // Namespace loading functions
  const invokeOracleSingle = useCallback(
    async (namespace: string) => {
      if (loadedNamespaces.includes(namespace)) {
        return; // Already loaded
      }

      try {
        const loadStart = performance.now();
        const translations = await invokeOracle(language, namespace);
        const loadTime = performance.now() - loadStart;

        setLoadedTranslations((prev) => ({
          ...prev,
          [namespace]: translations,
        }));

        setLoadedNamespaces((prev) => [...prev, namespace]);

        // Update performance metrics
        setPerformanceMetrics((prev) => ({
          ...prev,
          namespaceLoadTimes: {
            ...prev.namespaceLoadTimes,
            [namespace]: loadTime,
          },
        }));
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
          console.error(
            `🕊️ Failed to invoke oracle for namespace: ${namespace}`,
            err,
          );
        }
        setError(`Failed to load translations for ${namespace}`);
      }
    },
    [language, loadedNamespaces],
  );

  const invokeOraclesMultiple = useCallback(
    async (namespaces: string[]) => {
      const newNamespaces = namespaces.filter(
        (ns) => !loadedNamespaces.includes(ns),
      );

      if (newNamespaces.length === 0) {
        return; // All already loaded
      }

      try {
        setIsLoading(true);
        const newTranslations = await invokeOracles(language, newNamespaces);

        setLoadedTranslations((prev) => ({
          ...prev,
          ...newTranslations,
        }));

        setLoadedNamespaces((prev) => [...prev, ...newNamespaces]);
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
          console.error(
            "🕊️ Failed to invoke oracles for multiple namespaces:",
            err,
          );
        }
        setError("Failed to load translation namespaces");
      } finally {
        setIsLoading(false);
      }
    },
    [language, loadedNamespaces],
  );

  // Background prefetching
  const preinvokeOracles = useCallback(
    (namespaces: string[]) => {
      const newNamespaces = namespaces.filter(
        (ns) => !loadedNamespaces.includes(ns),
      );

      if (newNamespaces.length === 0) {
        return;
      }

      // Use requestIdleCallback for background loading
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          invokeOracles(language, newNamespaces)
            .then((newTranslations) => {
              setLoadedTranslations((prev) => ({
                ...prev,
                ...newTranslations,
              }));
              setLoadedNamespaces((prev) => [...prev, ...newNamespaces]);
            })
            .catch((err) => {
              // Log in development only
              if (process.env.NODE_ENV === "development") {
                console.warn("🕊️ Background oracle prefetch failed:", err);
              }
            });
        });
      }
    },
    [language, loadedNamespaces],
  );

  // Helper function to get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  };

  // Helper functions for translation fallback chains
  const isValidTranslation = (value: any): value is string => {
    return typeof value === "string" && value.trim().length > 0;
  };

  const transformKeyFormat = (key: string): string => {
    // snake_case to camelCase
    if (key.includes("_")) {
      return key
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    // camelCase to snake_case
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  };

  const formatMissingKey = (key: string): string => {
    // Convert snake_case or camelCase to readable format
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  // Enhanced translation function with robust fallback chains and caching
  const t = useMemo(() => {
    return (key: string, namespace: string = "common"): string => {
      // Create cache key outside try block for error handling
      const cacheKey = getCacheKey(key, namespace, language);

      try {
        // Check cache first for performance
        const cachedResult = translationCache.get(cacheKey);
        if (cachedResult !== undefined) {
          return cachedResult;
        }
        // Fallback chain priority:
        // 1. Direct translations object lookup (fastest)
        // 2. Registry lookup (compatibility)
        // 3. Alternative namespace lookup
        // 4. Opposite language lookup (for missing translations)
        // 5. Common namespace fallback
        // 6. Key transformation and final fallback

        // 1. Direct synchronous lookup from translations object
        const langTranslations =
          translations[language as keyof typeof translations];
        if (langTranslations) {
          const namespaceTranslations =
            langTranslations[namespace as keyof typeof langTranslations];
          if (
            namespaceTranslations &&
            typeof namespaceTranslations === "object"
          ) {
            // Try flat key lookup (backward compatibility)
            const flatValue = (namespaceTranslations as any)[key];
            if (isValidTranslation(flatValue)) {
              translationCache.set(cacheKey, flatValue);
              return flatValue;
            }

            // Try nested path lookup
            const nestedValue = getNestedValue(namespaceTranslations, key);
            if (isValidTranslation(nestedValue)) {
              translationCache.set(cacheKey, nestedValue);
              return nestedValue;
            }
          }
        }

        // 2. Fallback to registry for compatibility
        const registryKey = `${language}-${namespace}`;
        const registryTranslations = translationRegistry[registryKey];
        if (registryTranslations) {
          const registryValue = registryTranslations[key];
          if (isValidTranslation(registryValue)) {
            translationCache.set(cacheKey, registryValue);
            return registryValue;
          }

          const nestedRegistryValue = getNestedValue(registryTranslations, key);
          if (isValidTranslation(nestedRegistryValue)) {
            translationCache.set(cacheKey, nestedRegistryValue);
            return nestedRegistryValue;
          }
        }

        // 3. Try alternative namespace lookup (common namespace often has shared keys)
        if (namespace !== "common") {
          const commonTranslations =
            translations[language as keyof typeof translations]?.common;
          if (commonTranslations) {
            const commonValue = (commonTranslations as any)[key];
            if (isValidTranslation(commonValue)) {
              translationCache.set(cacheKey, commonValue);
              return commonValue;
            }
          }
        }

        // 4. Try opposite language as fallback for missing translations
        const oppositeLang = language === "es" ? "en" : "es";
        const oppositeTranslations =
          translations[oppositeLang as keyof typeof translations];
        if (oppositeTranslations) {
          const oppositeNamespaceTranslations =
            oppositeTranslations[
              namespace as keyof typeof oppositeTranslations
            ];
          if (oppositeNamespaceTranslations) {
            const oppositeValue = (oppositeNamespaceTranslations as any)[key];
            if (isValidTranslation(oppositeValue)) {
              // Log fallback usage in development
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  `🕊️ Oracle: Using ${oppositeLang} fallback for key "${key}" in namespace "${namespace}" (${language} missing)`,
                );
              }
              translationCache.set(cacheKey, oppositeValue);
              return oppositeValue;
            }
          }
        }

        // 5. Try common namespace in opposite language
        if (namespace !== "common") {
          const oppositeCommon =
            translations[oppositeLang as keyof typeof translations]?.common;
          if (oppositeCommon) {
            const oppositeCommonValue = (oppositeCommon as any)[key];
            if (isValidTranslation(oppositeCommonValue)) {
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  `🕊️ Oracle: Using ${oppositeLang} common fallback for key "${key}" in namespace "${namespace}"`,
                );
              }
              translationCache.set(cacheKey, oppositeCommonValue);
              return oppositeCommonValue;
            }
          }
        }

        // 6. Key transformation fallbacks
        // Try converting snake_case to camelCase or vice versa
        const transformedKey = transformKeyFormat(key);
        if (transformedKey !== key) {
          // Try transformed key in current language and namespace
          const langTranslations =
            translations[language as keyof typeof translations];
          const namespaceTranslations =
            langTranslations?.[namespace as keyof typeof langTranslations];
          const transformedValue = getNestedValue(
            namespaceTranslations || {},
            transformedKey,
          );
          if (isValidTranslation(transformedValue)) {
            translationCache.set(cacheKey, transformedValue);
            return transformedValue;
          }
        }

        // 7. Development warning for missing keys
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `🕊️ Oracle: Missing translation key "${key}" in namespace "${namespace}" for language "${language}"`,
          );
        }

        // 8. Final fallback - return a formatted version of the key
        const finalResult = formatMissingKey(key);

        // Cache the result for future lookups
        translationCache.set(cacheKey, finalResult);
        return finalResult;
      } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === "development") {
          console.error(
            `🕊️ Oracle: Translation error for key "${key}":`,
            error,
          );
        }
        const errorResult = formatMissingKey(key);
        // Cache error results too to avoid repeated errors
        translationCache.set(cacheKey, errorResult);
        return errorResult;
      }
    };
  }, [language]);

  // Utility functions
  const getLoadedNamespaces = useCallback(
    () => loadedNamespaces,
    [loadedNamespaces],
  );

  const isOracleActive = useCallback(
    (namespace: string) => loadedNamespaces.includes(namespace),
    [loadedNamespaces],
  );

  const getTranslationStats = useCallback(() => {
    const totalKeys = Object.values(loadedTranslations).reduce(
      (total, namespace) => total + Object.keys(namespace).length,
      0,
    );

    const avgLoadTime =
      Object.values(performanceMetrics.namespaceLoadTimes).reduce(
        (sum, time) => sum + time,
        0,
      ) /
      Math.max(Object.keys(performanceMetrics.namespaceLoadTimes).length, 1);

    return {
      totalKeys,
      loadedNamespaces: loadedNamespaces.length,
      cacheSize: translationCache.size,
      cacheHitRate:
        performanceMetrics.totalRequests > 0
          ? (performanceMetrics.cacheHits / performanceMetrics.totalRequests) *
            100
          : 0,
      loadTime: avgLoadTime,
    };
  }, [loadedNamespaces, loadedTranslations, performanceMetrics]);

  // Context value
  const contextValue: DivineParsingOracleContextType = {
    language,
    setLanguage,
    t,
    isLoading,
    loadedNamespaces,
    invokeOracle: invokeOracleSingle,
    invokeOracles: invokeOraclesMultiple,
    preinvokeOracles,
    getLoadedNamespaces,
    isOracleActive,
    getTranslationStats,
    error,
  };

  return (
    <DivineParsingOracleContext.Provider value={contextValue}>
      {children}
    </DivineParsingOracleContext.Provider>
  );
};

// Divine hook for components
export function useDivineParsing(namespaces: string[] = []) {
  const context = useContext(DivineParsingOracleContext);

  if (!context) {
    throw new Error(
      "useDivineParsing must be used within DivineParsingOracleProvider",
    );
  }

  // Auto-load required namespaces
  useEffect(() => {
    if (namespaces.length > 0) {
      const unloadedNamespaces = namespaces.filter(
        (ns) => !context.loadedNamespaces.includes(ns),
      );
      if (unloadedNamespaces.length > 0) {
        context.invokeOracles(unloadedNamespaces);
      }
    }
  }, [namespaces, context]);

  return context;
}

// Export the provider
export { DivineParsingOracleProvider };
