# Internationalization (i18n) System

## Overview

This project uses a custom-built internationalization system called "Divine Parsing Oracle" that provides efficient, chunked loading of translation namespaces. The system supports English (en) and Spanish (es) languages.

## Architecture

### Core Components

1. **ChunkedLanguageProvider** (`src/components/language/ChunkedLanguageProvider.tsx`)
   - Main i18n provider that manages translation loading
   - Implements chunked loading for better performance
   - Supports on-demand namespace loading

2. **LanguageContext** (`src/components/language/LanguageContext.tsx`)
   - Legacy compatibility layer for existing components
   - Provides `useLanguage` hook for components

3. **LanguageToggle** (`src/components/language/LanguageToggle.tsx`)
   - Accessible language switcher component
   - Supports keyboard navigation and screen readers

### Translation Files Structure

```bash
src/locales/
├── en/
│   ├── common.json      # Common UI strings (buttons, messages, etc.)
│   ├── navigation.json  # Navigation and menu items
│   ├── admin.json       # Admin-specific translations
│   ├── parent.json      # Parent dashboard translations
│   ├── profesor.json    # Teacher dashboard translations
│   ├── dashboard.json   # Dashboard-specific translations
│   └── language.json    # Language-related strings
└── es/
    └── [same files in Spanish]
```

## Usage

### Basic Usage

```tsx
import { useLanguage } from "@/components/language/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

### Advanced Usage

```tsx
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

function AdvancedComponent() {
  const { t } = useDivineParsing(["admin", "dashboard"]);

  return (
    <div>
      <h1>{t("admin.title")}</h1>
      <p>{t("dashboard.welcome")}</p>
    </div>
  );
}
```

### Using Specific Namespaces

```tsx
const { t } = useLanguage();
const title = t("admin.title", "admin"); // Specify namespace
```

## Translation Key Format

- Use dot notation: `category.subcategory.key`
- Keep keys descriptive but concise
- Group related keys: `button.save`, `button.cancel`, `form.title`, etc.

## Adding New Translations

1. Add the key-value pair to both `en/[namespace].json` and `es/[namespace].json`
2. Use the same key in both files
3. Test that the translation appears correctly in both languages

Example:

```json
// en/common.json
{
  "new.feature": "New Feature"
}

// es/common.json
{
  "new.feature": "Nueva Función"
}
```

## Language Detection

The system automatically detects the user's preferred language:

1. **Stored preference** (localStorage)
2. **Browser language** (navigator.language)
3. **Fallback to Spanish** (es)

## Performance Features

- **Chunked Loading**: Translations load on-demand per namespace
- **Caching**: Loaded translations are cached in memory
- **Background Prefetching**: Upcoming namespaces can be preloaded
- **Lazy Loading**: Reduces initial bundle size

## Accessibility

- Full keyboard navigation support
- Screen reader announcements for language changes
- Proper ARIA labels and roles
- High contrast support

## Development Tips

### Debugging Missing Translations

If a translation key returns the key itself, it means the translation is missing:

```tsx
const text = t("missing.key");
// If translation doesn't exist, returns "missing.key"
```

### Checking Loaded Namespaces

```tsx
const { loadedNamespaces } = useLanguage();
console.log("Loaded:", loadedNamespaces);
```

### Performance Monitoring

```tsx
const { getTranslationStats } = useDivineParsing([]);
const stats = getTranslationStats();
console.log(stats); // Shows load times, cache hits, etc.
```

## Maintenance

### Regular Tasks

1. **Synchronize Keys**: Ensure all keys exist in both languages
2. **Test Translations**: Verify translations work in both languages
3. **Performance Monitoring**: Check translation load times
4. **Accessibility Testing**: Ensure screen readers work properly

### Adding New Languages

1. Create new directory under `src/locales/[lang]/`
2. Copy all JSON files from an existing language
3. Translate all values
4. Update `Language` type in providers
5. Add language option to `LanguageToggle`

## Troubleshooting

### Common Issues

1. **Translations not loading**: Check namespace is loaded
2. **Keys returning key name**: Translation missing in JSON file
3. **Performance issues**: Check namespace loading strategy
4. **Hydration mismatches**: Ensure server/client language consistency

### Debug Commands

```bash
# Check if translations are synchronized
npm run check-translations

# Validate JSON syntax
npm run validate-locales
```

## Contributing

When adding new features:

1. Use existing translation keys when possible
2. Add new keys to appropriate namespaces
3. Test in both languages
4. Update this documentation if needed

## Support

For i18n-related issues, check:

1. Console for "Divine Parsing Oracle" messages
2. Network tab for translation file loading
3. LocalStorage for language preferences
4. Browser language settings
