# Hydration Fix Guide

## Overview
This guide explains how to use the hydration-safe utilities to prevent SSR/client mismatches in your Next.js application.

## Common Hydration Issues and Solutions

### 1. Date/Time Rendering
**Problem**: Dates render differently on server and client due to timezone differences.

**Solution**: Use the `HydratedDate` components:

```tsx
// Instead of:
{format(new Date(date), 'dd MMM yyyy')}

// Use:
import { HydratedDate } from '@/components/ui/hydrated-date';
<HydratedDate date={date} format="dd MMM yyyy" />

// For times:
<HydratedTime date={date} />

// For date and time:
<HydratedDateTime date={date} />

// For relative time:
<HydratedRelativeTime date={date} />
```

### 2. LocalStorage/SessionStorage Access
**Problem**: Storage APIs don't exist on the server.

**Solution**: Use safe storage utilities:

```tsx
import { 
  getLocalStorageSafe, 
  setLocalStorageSafe,
  getSessionStorageSafe,
  setSessionStorageSafe 
} from '@/lib/hydration-utils';

// Instead of:
const value = localStorage.getItem('key');

// Use:
const value = getLocalStorageSafe('key', defaultValue);

// Setting values:
setLocalStorageSafe('key', value); // Returns boolean success
```

### 3. Client-Only Components
**Problem**: Components that should only render on client.

**Solution**: Use `ClientOnly` wrapper:

```tsx
import { ClientOnly } from '@/components/ui/client-only';

<ClientOnly fallback={<div>Loading...</div>}>
  <ComponentThatUsesWindowAPI />
</ClientOnly>
```

### 4. Dynamic Content
**Problem**: Content that changes between server and client.

**Solution**: Use `suppressHydrationWarning`:

```tsx
// For elements with dynamic content
<div suppressHydrationWarning>
  {dynamicContent}
</div>
```

### 5. Browser API Access
**Problem**: Accessing window, document, navigator on server.

**Solution**: Use hydration hooks:

```tsx
import { useHydrationFix, useBrowserAPI } from '@/hooks/useHydrationFix';

// Check if hydrated
const isHydrated = useHydrationFix();

// Safe browser API access
const windowWidth = useBrowserAPI(() => window.innerWidth, 1024);
```

## Best Practices

1. **Always check for window/document existence**:
```tsx
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

2. **Use useEffect for client-side operations**:
```tsx
useEffect(() => {
  // This only runs on client
  const value = localStorage.getItem('key');
}, []);
```

3. **Provide server-side defaults**:
```tsx
const [value, setValue] = useState('server-default');

useEffect(() => {
  setValue(localStorage.getItem('key') || 'client-default');
}, []);
```

4. **Use stable IDs for lists**:
```tsx
import { generateStableId } from '@/lib/hydration-utils';

items.map((item, index) => (
  <div key={generateStableId('item', index)}>
    {item.name}
  </div>
))
```

## Component Examples

### Safe Modal/Dialog
```tsx
import { ClientOnly } from '@/components/ui/client-only';

export function SafeModal({ isOpen, children }) {
  return (
    <ClientOnly>
      {isOpen && (
        <div className="modal">
          {children}
        </div>
      )}
    </ClientOnly>
  );
}
```

### Safe Theme Toggle
```tsx
import { useHydrationFix } from '@/hooks/useHydrationFix';

export function ThemeToggle() {
  const isHydrated = useHydrationFix();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = getLocalStorageSafe('theme', 'light');
    setTheme(stored);
  }, []);

  if (!isHydrated) {
    return <div className="theme-toggle-placeholder" />;
  }

  return (
    <button onClick={() => toggleTheme()}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

## Testing for Hydration Issues

1. **Enable React Strict Mode** in `next.config.js`:
```js
module.exports = {
  reactStrictMode: true,
}
```

2. **Check Console for Warnings**:
- Look for "Text content does not match"
- Look for "Hydration failed"
- Look for "Expected server HTML"

3. **Test with JavaScript Disabled**:
- Server-rendered content should still be visible
- No layout shifts when JS loads

4. **Use React DevTools**:
- Check the Profiler for unnecessary re-renders
- Inspect component props for mismatches

## Migration Checklist

- [ ] Replace all date formatting with `HydratedDate` components
- [ ] Wrap client-only components with `ClientOnly`
- [ ] Replace direct localStorage access with safe utilities
- [ ] Add `suppressHydrationWarning` to dynamic content
- [ ] Use `useHydrationFix` hook for conditional rendering
- [ ] Test with React Strict Mode enabled
- [ ] Check console for hydration warnings
- [ ] Verify server-rendered content matches client

## Common Pitfalls to Avoid

1. **Don't use Math.random() during render**
2. **Don't use Date.now() for keys**
3. **Don't access localStorage in component body**
4. **Don't conditionally render based on window size without hydration check**
5. **Don't use user agent detection without proper guards**

## Need Help?

If you're still experiencing hydration issues:

1. Check if the component is wrapped in `HydrationErrorBoundary`
2. Use `useHydrationError` hook to catch and log errors
3. Enable verbose hydration logging in development
4. Consider using Next.js `dynamic` import with `ssr: false` for problematic components