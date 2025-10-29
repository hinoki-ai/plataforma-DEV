import commonES from '../locales/es/common.json';
import commonEN from '../locales/en/common.json';
import navigationES from '../locales/es/navigation.json';
import navigationEN from '../locales/en/navigation.json';
import adminES from '../locales/es/admin.json';
import adminEN from '../locales/en/admin.json';
import parentES from '../locales/es/parent.json';
import parentEN from '../locales/en/parent.json';
import profesorES from '../locales/es/profesor.json';
import profesorEN from '../locales/en/profesor.json';
import dashboardES from '../locales/es/dashboard.json';
import dashboardEN from '../locales/en/dashboard.json';
import languageES from '../locales/es/language.json';
import languageEN from '../locales/en/language.json';

export type Language = 'es' | 'en';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingKeys: Record<string, string[]>;
  extraKeys: Record<string, string[]>;
}

interface TranslationStats {
  totalKeys: number;
  missingTranslations: number;
  extraTranslations: number;
  consistencyScore: number;
}

// All translation namespaces
const translations = {
  es: {
    common: commonES,
    navigation: navigationES,
    admin: adminES,
    parent: parentES,
    profesor: profesorES,
    dashboard: dashboardES,
    language: languageES,
  },
  en: {
    common: commonEN,
    navigation: navigationEN,
    admin: adminEN,
    parent: parentEN,
    profesor: profesorEN,
    dashboard: dashboardEN,
    language: languageEN,
  },
} as const;

const namespaces = Object.keys(translations.es) as (keyof typeof translations.es)[];

/**
 * Deep flatten an object with dot notation keys
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
}

/**
 * Validate translation consistency between languages
 */
export function validateTranslations(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingKeys: Record<string, string[]> = {};
  const extraKeys: Record<string, string[]> = {};

  // Check each namespace
  for (const namespace of namespaces) {
    const esTranslations = translations.es[namespace];
    const enTranslations = translations.en[namespace];

    const esKeys = new Set(Object.keys(flattenObject(esTranslations)));
    const enKeys = new Set(Object.keys(flattenObject(enTranslations)));

    // Find missing keys in English
    const missingInEN = Array.from(esKeys).filter(key => !enKeys.has(key));
    if (missingInEN.length > 0) {
      missingKeys[`${namespace}:en`] = missingInEN;
      errors.push(`Missing ${missingInEN.length} keys in ${namespace} (English): ${missingInEN.slice(0, 5).join(', ')}${missingInEN.length > 5 ? '...' : ''}`);
    }

    // Find extra keys in English
    const extraInEN = Array.from(enKeys).filter(key => !esKeys.has(key));
    if (extraInEN.length > 0) {
      extraKeys[`${namespace}:en`] = extraInEN;
      warnings.push(`Extra ${extraInEN.length} keys in ${namespace} (English): ${extraInEN.slice(0, 3).join(', ')}${extraInEN.length > 3 ? '...' : ''}`);
    }

    // Find missing keys in Spanish
    const missingInES = Array.from(enKeys).filter(key => !esKeys.has(key));
    if (missingInES.length > 0) {
      missingKeys[`${namespace}:es`] = missingInES;
      errors.push(`Missing ${missingInES.length} keys in ${namespace} (Spanish): ${missingInES.slice(0, 5).join(', ')}${missingInES.length > 5 ? '...' : ''}`);
    }

    // Find extra keys in Spanish
    const extraInES = Array.from(esKeys).filter(key => !enKeys.has(key));
    if (extraInES.length > 0) {
      extraKeys[`${namespace}:es`] = extraInES;
      warnings.push(`Extra ${extraInES.length} keys in ${namespace} (Spanish): ${extraInES.slice(0, 3).join(', ')}${extraInES.length > 3 ? '...' : ''}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingKeys,
    extraKeys,
  };
}

/**
 * Get translation statistics
 */
export function getTranslationStats(): TranslationStats {
  let totalKeys = 0;
  let missingTranslations = 0;

  for (const namespace of namespaces) {
    const esTranslations = translations.es[namespace];
    const enTranslations = translations.en[namespace];

    const esKeys = Object.keys(flattenObject(esTranslations));
    const enKeys = Object.keys(flattenObject(enTranslations));

    totalKeys += esKeys.length;
    missingTranslations += Math.abs(esKeys.length - enKeys.length);
  }

  const consistencyScore = Math.max(0, Math.min(100, ((totalKeys - missingTranslations) / totalKeys) * 100));

  return {
    totalKeys,
    missingTranslations,
    extraTranslations: 0, // Could be calculated separately if needed
    consistencyScore,
  };
}

/**
 * Find all translation keys that contain a specific substring
 */
export function searchTranslationKeys(searchTerm: string, language: Language = 'es'): string[] {
  const results: string[] = [];

  for (const namespace of namespaces) {
    const namespaceTranslations = translations[language][namespace];
    const flattened = flattenObject(namespaceTranslations);

    for (const key of Object.keys(flattened)) {
      if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(`${namespace}:${key}`);
      }
    }
  }

  return results;
}

/**
 * Get all translation keys for a namespace
 */
export function getNamespaceKeys(namespace: keyof typeof translations.es, language: Language = 'es'): string[] {
  const namespaceTranslations = translations[language][namespace];
  return Object.keys(flattenObject(namespaceTranslations));
}

/**
 * Check if a translation key exists
 */
export function keyExists(key: string, namespace: keyof typeof translations.es = 'common', language?: Language): boolean {
  if (language) {
    const namespaceTranslations = translations[language][namespace];
    const flattened = flattenObject(namespaceTranslations);
    return key in flattened;
  }

  // Check both languages
  return ['es', 'en'].every(lang => {
    const namespaceTranslations = translations[lang as Language][namespace];
    const flattened = flattenObject(namespaceTranslations);
    return key in flattened;
  });
}

/**
 * Development helper to log validation results
 */
export function logValidationResults(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  const result = validateTranslations();
  const stats = getTranslationStats();

  console.group('🕊️ Divine Parsing Oracle - Translation Validation');

  console.log(`Total Keys: ${stats.totalKeys}`);
  console.log(`Consistency Score: ${stats.consistencyScore.toFixed(1)}%`);

  if (result.errors.length > 0) {
    console.error('❌ Errors:', result.errors);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Warnings:', result.warnings);
  }

  if (result.isValid) {
    console.log('✅ All translations are consistent!');
  } else {
    console.error('❌ Translation inconsistencies found!');
  }

  console.groupEnd();
}

// Auto-run validation in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run validation after a short delay to ensure console is ready
  setTimeout(logValidationResults, 1000);
}
