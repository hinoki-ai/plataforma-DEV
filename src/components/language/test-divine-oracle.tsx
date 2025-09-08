'use client';

// 🕊️ DIVINE PARSING ORACLE - Test Component
// PURPOSE: Verify the chunked i18n system is working correctly
// USAGE: Temporary test component for integration verification

import React from 'react';
import { useDivineParsing } from './useDivineLanguage';

export function TestDivineOracle() {
  const divineOracle = useDivineParsing(['common', 'navigation', 'language']);

  const stats = divineOracle.getTranslationStats();

  return (
    <div className="fixed top-4 right-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 text-sm shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-primary mb-2">🕊️ Divine Oracle Test</h3>

      <div className="space-y-1">
        <div>
          Language: <span className="font-mono">{divineOracle.language}</span>
        </div>
        <div>
          Loading:{' '}
          <span className="font-mono">
            {divineOracle.isLoading ? 'true' : 'false'}
          </span>
        </div>
        <div>
          Namespaces:{' '}
          <span className="font-mono">
            {divineOracle.getLoadedNamespaces().join(', ')}
          </span>
        </div>
        <div>
          Total Keys: <span className="font-mono">{stats.totalKeys}</span>
        </div>
        <div>
          Load Time:{' '}
          <span className="font-mono">{stats.loadTime.toFixed(1)}ms</span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div>Navigation Test:</div>
        <div className="text-xs bg-muted p-2 rounded">
          {divineOracle.t('nav.center.council', 'navigation')}
        </div>

        <div>Common Test:</div>
        <div className="text-xs bg-muted p-2 rounded">
          {divineOracle.t('common.save', 'common')}
        </div>

        <div>Language Test:</div>
        <div className="text-xs bg-muted p-2 rounded">
          {divineOracle.t('language.toggle', 'language')}
        </div>
      </div>

      <button
        onClick={() =>
          divineOracle.setLanguage(divineOracle.language === 'es' ? 'en' : 'es')
        }
        className="mt-3 w-full bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
      >
        Switch Language
      </button>

      <button
        onClick={() => divineOracle.invokeOracle('admin')}
        className="mt-2 w-full bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm hover:bg-secondary/90"
      >
        Load Admin Namespace
      </button>
    </div>
  );
}
