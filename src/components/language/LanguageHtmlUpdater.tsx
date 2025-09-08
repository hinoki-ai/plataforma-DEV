'use client';

import { useLanguage } from './LanguageContext';

export function LanguageHtmlUpdater() {
  const { language } = useLanguage();

  // LanguageHtmlUpdater removed - causing hydration issues
  // Language is now handled statically in the layout
  // The language context provides translations without needing DOM manipulation

  return null;
}
