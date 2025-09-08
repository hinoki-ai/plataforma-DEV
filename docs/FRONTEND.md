# Frontend Guide

## Background Images

- Use `FixedBackgroundLayout` for public pages.
- Mirrors homepage: wrapper has `bg-responsive-desktop` with inline `backgroundImage`; overlay is `absolute` gradient.
- Example:

```tsx
<FixedBackgroundLayout backgroundImage="/bg6.jpg" overlayType="gradient">
  <Header />
  {/* page content */}
</FixedBackgroundLayout>
```

## Internationalization

- App is wrapped with `LanguageProvider`.
- Use `useLanguage().t(key)` for all user-facing strings.
- `LanguageHtmlUpdater` sets `<html lang>` dynamically.

## Navigation & Layout

- `src/components/layout/Navigation.tsx` integrates `LanguageToggle` and theme toggle.
- Public pages avoid sidebar; dashboards include sidebar where relevant.
