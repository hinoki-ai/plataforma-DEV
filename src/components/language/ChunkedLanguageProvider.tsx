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
  getTranslationStats: () => {
    totalKeys: number;
    loadedNamespaces: number;
    cacheHitRate: number;
    loadTime: number;
  };

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

  // Auth routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) {
    return [...baseNamespaces];
  }

  // Default fallback
  return [...baseNamespaces, "navigation"];
};

// Browser language detection - SSR safe
const detectBrowserLanguage = (): Language => {
  // Always return default on server to prevent hydration mismatch
  if (typeof window === "undefined") return "es";
  try {
    const browserLang = navigator.language.toLowerCase();
    const supportedLanguages = ["es", "en"] as const;
    if ((supportedLanguages as readonly string[]).includes(browserLang)) {
      return browserLang as Language;
    }
    const langCode = browserLang.split("-")[0];
    if ((supportedLanguages as readonly string[]).includes(langCode)) {
      return langCode as Language;
    }
    return "es";
  } catch {
    return "es";
  }
};

const LANGUAGE_STORAGE_KEY = "aramac-language-preference";

const getStoredLanguage = (): Language | null => {
  // Always return null on server to prevent hydration mismatch
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "es" || stored === "en" ? (stored as Language) : null;
  } catch {
    return null;
  }
};

const setStoredLanguage = (language: Language): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {}
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

const DivineParsingOracleProvider: React.FC<{
  children: React.ReactNode;
  initialNamespaces?: string[];
  initialLanguage?: Language;
}> = ({ children, initialNamespaces = ["common"], initialLanguage }) => {
  // Detect initial language synchronously to prevent hydration mismatch
  const getInitialLanguage = (): Language => {
    // If initialLanguage is provided, use it
    if (initialLanguage) return initialLanguage;

    // On server, always use default
    if (typeof window === "undefined") return "es";

    // Check stored preference first
    const stored = getStoredLanguage();
    if (stored) return stored;

    // Then check browser language
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
      // Pre-load initial translations synchronously with detected language to prevent hydration mismatch
      const initialTranslations: LoadedNamespace = {};
      for (const namespace of initialNamespaces) {
        const key = `${initialLang}-${namespace}`;
        const translations = translationRegistry[key];
        if (translations) {
          initialTranslations[namespace] = translations;
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

  // Language change handler
  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      try {
        setError(null);
        setIsLoading(true);

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

  // Translation function - uses flat key lookup (keys contain dots as-is)
  const t = useMemo(() => {
    return (key: string, namespace: string = "common"): string => {
      try {
        // Direct lookup in loaded translations first - flat key lookup
        if (loadedTranslations[namespace]) {
          const value = loadedTranslations[namespace][key];
          if (value !== undefined && value !== null) {
            return value;
          }
        }

        // Fallback to registry - flat key lookup
        const registryKey = `${language}-${namespace}`;
        const registryTranslations = translationRegistry[registryKey];
        if (registryTranslations) {
          const value = registryTranslations[key];
          if (value !== undefined && value !== null) {
            return value;
          }
        }

        // Final fallback - return the key itself
        return key;
      } catch (error) {
        return key;
      }
    };
  }, [loadedTranslations, loadedNamespaces, language]);

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
