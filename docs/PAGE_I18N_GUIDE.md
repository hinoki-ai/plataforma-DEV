# Page-by-Page Internationalization (i18n) Guide

This guide explains how to implement page-specific internationalization in the Plataforma Astral project using the Divine Parsing Oracle chunked i18n system.

## Overview

The platform uses a **chunked i18n system** that loads translation namespaces on-demand to optimize bundle size and performance. Each page can have its own translation namespace, loaded only when needed.

## Architecture

### Core Components

1. **ChunkedLanguageProvider** - Main provider that manages translation loading
2. **useDivineParsing** hook - Loads namespaces for specific pages
3. **Translation Registry** - Maps language-namespace combinations to translation objects

### Supported Languages

- **Spanish (es)** - Default language
- **English (en)** - Secondary language

## How to Add Page-Specific i18n

### Step 1: Create Translation Files

Create JSON files for each language in the appropriate locale directories:

```
src/locales/es/your-page.json
src/locales/en/your-page.json
```

**File Structure Example:**

```json
{
  "page.title": "Page Title",
  "page.description": "Page description",
  "section.title": "Section Title",
  "section.content": "Section content",
  "hero.welcome": "Welcome message"
}
```

### Step 2: Register Translations in Provider

Update `src/components/language/ChunkedLanguageProvider.tsx`:

1. **Add imports** at the top:

```typescript
import yourPageES from "../../locales/es/your-page.json";
import yourPageEN from "../../locales/en/your-page.json";
```

2. **Add to translations object**:

```typescript
const translations = {
  es: {
    // ... existing namespaces
    "your-page": yourPageES,
  },
  en: {
    // ... existing namespaces
    "your-page": yourPageEN,
  },
} as const;
```

3. **Add to translationRegistry**:

```typescript
const translationRegistry: Record<string, TranslationStrings> = {
  // ... existing entries
  "es-your-page": yourPageES,
  "en-your-page": yourPageEN,
};
```

### Step 3: Update Page Component

#### Client Component Pattern

In your page component (`src/app/your-page/page.tsx`):

```typescript
"use client";

import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function YourPage() {
  // Load your page-specific namespace
  const { t } = useDivineParsing(["your-page"]);

  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{t("page.description")}</p>
    </div>
  );
}
```

#### Server Component Pattern

For server components, use `getServerTranslation`:

```typescript
import { getServerTranslation } from "@/lib/server-translations";
import { requireAuth } from "@/lib/server-auth";

export default async function YourPage() {
  const session = await requireAuth();

  // Create translation function
  const t = (key: string) => getServerTranslation(key, "your-namespace", "es");

  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{t("page.description")}</p>
    </div>
  );
}
```

## Translation Key Patterns

### Namespace Usage

```typescript
// Direct key lookup (assumes "your-page" namespace)
t("section.title");

// Explicit namespace (overrides default)
t("section.title", "common");
```

### Nested Keys

```json
{
  "user": {
    "profile": {
      "name": "User Name",
      "email": "User Email"
    }
  }
}
```

```typescript
t("user.profile.name"); // Returns "User Name"
```

### Arrays in Translations

```json
{
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
```

```typescript
{t("features").map((feature, index) => (
  <li key={index}>{feature}</li>
))}
```

## Best Practices

### 1. Namespace Organization

- **Page-specific content**: Use dedicated namespaces (e.g., "dpa", "terminos")
- **Shared content**: Use "common" namespace
- **Role-specific content**: Use role namespaces (e.g., "admin", "profesor")

### 2. Key Naming Conventions

```json
{
  "page.title": "Page Title",
  "page.description": "Page Description",
  "hero.title": "Hero Title",
  "hero.subtitle": "Hero Subtitle",
  "section.name.title": "Section Title",
  "section.name.content": "Section Content"
}
```

### 3. Performance Considerations

- Load only required namespaces per page
- Use shallow loading for better performance
- Avoid loading large namespaces unnecessarily

### 4. Fallback Strategy

The system provides multiple fallback levels:

1. **Direct translation** (fastest)
2. **Registry lookup** (compatibility)
3. **Alternative namespace** (common namespace)
4. **Opposite language** (missing translations)
5. **Key transformation** (snake_case ↔ camelCase)
6. **Formatted key** (development-only fallback)

## Examples

### Complete Page Implementation

```typescript
// src/app/contact/page.tsx
"use client";

import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function ContactPage() {
  const { t } = useDivineParsing(["contact"]);

  return (
    <div>
      <h1>{t("page.title")}</h1>
      <div>
        <h2>{t("contact.form.title")}</h2>
        <p>{t("contact.form.description")}</p>
      </div>
    </div>
  );
}
```

### Translation File Structure

```json
// src/locales/es/contact.json
{
  "page.title": "Contáctanos",
  "contact.form.title": "Envíanos un mensaje",
  "contact.form.description": "Estamos aquí para ayudarte",
  "contact.form.name": "Nombre",
  "contact.form.email": "Correo electrónico",
  "contact.form.message": "Mensaje"
}
```

```json
// src/locales/en/contact.json
{
  "page.title": "Contact Us",
  "contact.form.title": "Send us a message",
  "contact.form.description": "We're here to help",
  "contact.form.name": "Name",
  "contact.form.email": "Email",
  "contact.form.message": "Message"
}
```

## Implementation Checklist

When implementing i18n for a page, verify:

- [ ] All hardcoded Spanish strings replaced
- [ ] All hardcoded English strings replaced
- [ ] Translation keys added to both `es` and `en` files
- [ ] Namespace registered in ChunkedLanguageProvider (if new)
- [ ] Correct hook/function used (client vs server)
- [ ] Key naming follows conventions
- [ ] Error messages translated
- [ ] Loading states translated
- [ ] Empty states translated
- [ ] Button labels translated
- [ ] Form labels and placeholders translated
- [ ] Dialog/modal content translated
- [ ] Page metadata (title, description) translated
- [ ] No linting errors
- [ ] Language switching works correctly

## Common Pitfalls to Avoid

1. **Don't forget error messages** - Often in catch blocks or error states
2. **Don't forget loading states** - "Cargando...", "Loading..." etc.
3. **Don't forget empty states** - "No hay datos", "No data available"
4. **Don't forget button labels** - Even simple "Guardar", "Cancelar"
5. **Don't forget dialog content** - Titles, descriptions, button labels
6. **Don't forget form labels** - Input labels, placeholders, help text
7. **Don't forget table headers** - Column names
8. **Don't mix patterns** - Use server translations for server components, client hooks for client components
9. **Don't create duplicate keys** - Check existing namespaces first
10. **Don't forget metadata** - Page titles in metadata objects

## Testing Translations

### Development Mode Features

- Missing translation warnings in console
- Fallback chain logging
- Translation validation utilities

### Validation

Run translation validation:

```bash
npm run validate-translations
```

### Visual Testing

1. View page in browser, switch languages
2. Verify all text changes when language switches
3. Check for any remaining hardcoded strings
4. Test error states and loading states
5. Verify dialog/modal content translates

## Troubleshooting

### Common Issues

1. **Translations not loading**: Check namespace registration in provider
2. **Wrong namespace**: Verify `useDivineParsing` namespace parameter
3. **Missing keys**: Check JSON file syntax and key paths
4. **Performance issues**: Review loaded namespaces per page

### Debug Mode

Enable debug logging in development:

```typescript
// In component
const { t, loadedNamespaces } = useDivineParsing(["your-namespace"]);

console.log("Loaded namespaces:", loadedNamespaces);
```

## Migration from Legacy System

If migrating from the old `useLanguage` hook:

1. Replace import:

   ```typescript
   // Old
   import { useLanguage } from "@/components/language/LanguageContext";

   // New
   import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
   ```

2. Update hook usage:

   ```typescript
   // Old
   const { t } = useLanguage();

   // New
   const { t } = useDivineParsing(["your-namespace"]);
   ```

3. Add namespace parameter to translation calls if needed:

   ```typescript
   // Old (implicit common namespace)
   t("key");

   // New (explicit namespace)
   t("key", "your-namespace");
   ```
