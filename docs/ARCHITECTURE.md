# Architecture Overview

- App Router under `src/app`
- Providers in `src/components/providers.tsx` (Theme, Session, Language, DesktopToggle, WebVitals)
- Auth via NextAuth v5, with proxy enforcing access by role
- DB via Prisma; services split into `services/queries` (read) and `services/actions` (write)
- Layouts: `FixedBackgroundLayout` standardizes public page backgrounds

## Key Modules

- `src/proxy.ts`: redirects and access control
- `src/lib/auth*`: credential auth, session helpers
- `src/components/language/*`: i18n context, toggle, html lang updater
- `src/components/layout/*`: header, navigation, layout wrappers
- `src/services/*`: domain actions/queries

## Routing

- Public: `/`, `/cpa`, `/fotos-videos`, `/public/equipo-multidisciplinario`
- Auth dashboards: `/admin`, `/profesor`, `/parent` + subroutes

## Background System

- Use `FixedBackgroundLayout` with `backgroundImage` and overlay
- Wrapper uses `bg-responsive-desktop` so visuals match homepage

## Error Handling

- API routes return JSON with status codes
- UI uses skeletons and fallbacks for loading/error states
