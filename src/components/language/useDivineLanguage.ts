'use client';

// 🕊️ DIVINE PARSING ORACLE - BACKWARD COMPATIBILITY HOOK
// PURPOSE: Maintain compatibility with existing useLanguage hook
// ARCHITECTURE: Adapter pattern for seamless migration
// USAGE: Drop-in replacement for existing useLanguage calls

import { useDivineParsing } from './ChunkedLanguageProvider';

export function useLanguage() {
  const divineContext = useDivineParsing(['common', 'language']);

  // Adapt Divine Parsing Oracle interface to match existing useLanguage
  return {
    language: divineContext.language,
    setLanguage: divineContext.setLanguage,
    t: divineContext.t,
    isLoading: divineContext.isLoading,
    error: divineContext.error,
  };
}

// Export for convenience
export { useDivineParsing } from './ChunkedLanguageProvider';
