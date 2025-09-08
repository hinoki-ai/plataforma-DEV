# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manitos Pintadas** is a Chilean school management system built with Next.js 15, featuring role-based access control, meeting scheduling, educational planning, and Centro Consejo voting functionality.

## 📚 Critical Documentation (NEW)

**Authentication System Fixed**: September 1, 2025 ✅
**Latest Updates**: Calendar component improvements, timeout type fixes, deployment verification tests

### Quick Authentication Troubleshooting

```bash
# 1. Check system status (30 seconds)
curl -I https://school.aramac.dev
curl -s https://school.aramac.dev/api/auth/session

# 2. Test emergency access if normal login fails
# Email: admin@manitospintadas.cl | Password: admin123

# 3. Most common fix - check NEXTAUTH_URL
npx vercel env ls | grep NEXTAUTH_URL
# Should show: https://school.aramac.dev
```

### Documentation Reference

- `docs/TROUBLESHOOTING_AUTH.md` - **START HERE** for auth issues (95% success rate)
- `docs/INCIDENT_REPORT_AUTH_FIX_2025-09-01.md` - Complete incident analysis
- `docs/AUTHENTICATION_SYSTEM_DOCS.md` - Full system architecture
- `docs/VERCEL_DEPLOYMENT_GUIDE.md` - Deployment procedures
- `docs/EMERGENCY_ACCESS_PROCEDURES.md` - Emergency protocols (CONFIDENTIAL)

## Essential Commands

### Development Setup

```bash
# Install and setup database
npm install
npm run db:generate && npm run db:push && npm run db:seed

# Development server
npm run dev

# Database GUI
npm run db:studio

# Create admin user
npm run create-admin
```

### Code Quality & Testing

```bash
# Format and lint
npm run format              # Prettier + ESLint fix
npm run lint                # ESLint check (max 0 warnings)
npm run type-check          # TypeScript validation

# Testing (all 495+ tests must pass)
npm run test:unit           # Vitest unit tests (296 tests)
npm run test:e2e            # Playwright E2E tests (140 tests)
npm run test:a11y           # Accessibility tests (98 tests)
npm run test:performance    # Lighthouse performance tests
npm run test:all            # Complete test suite (495+ tests)

# Development testing
npm run test:unit:watch     # Unit tests in watch mode
npm run test:e2e:ui         # E2E tests with UI
npm run test:e2e:debug      # E2E tests in debug mode
npm run test:unit:coverage  # Generate coverage report
```

### Database Operations

```bash
npm run db:generate         # Generate Prisma client
npm run db:push             # Apply schema changes
npm run db:migrate          # Create migration
npm run db:seed             # Seed test data
npm run db:studio           # Open Prisma Studio GUI

# Production database commands
npm run db:migrate:deploy   # Deploy migrations (production)
npm run db:migrate:prod     # Deploy migrations + generate client
npm run db:seed:production  # Seed production data
npm run db:seed:emergency   # Emergency seed for recovery

# User management scripts
npm run create-admin        # Create admin user
npm run create-all-test-users # Create all test users
tsx scripts/create-parent.ts # Create specific parent user
tsx scripts/verify-users.ts # Verify user accounts
tsx scripts/count-users.ts  # Count users by role
tsx scripts/remove-user.ts  # Remove specific user
```

## Architecture Overview

### Core Stack

- **Next.js 15** with App Router and React 19
- **NextAuth.js v5** with role-based middleware protection
- **Prisma ORM** with PostgreSQL (Supabase in production)
- **Tailwind CSS** + **shadcn/ui** components
- **TypeScript** throughout the entire codebase

### Authentication & Authorization System

The system uses a strict role-based access model with middleware enforcement:

**Roles**: `ADMIN`, `PROFESOR`, `PARENT`, `PUBLIC`

**Route Protection** (`src/middleware.ts`):

- `/admin/**` → ADMIN only
- `/profesor/**` → PROFESOR only
- `/parent/**` → PARENT only
- Public routes: `/`, `/centro-consejo`, `/fotos-videos`

**Key Auth Files**:

- `src/lib/auth.ts` - NextAuth configuration with credentials + OAuth
- `src/lib/auth-prisma.ts` - User authentication logic
- `src/services/actions/auth.ts` - Server Actions for login/logout
- `src/middleware.ts` - Route protection and role-based redirects

### Data Layer Architecture

**Services Pattern** (critical for consistency):

```text
src/services/
├── actions/     # Server Actions for CUD operations (Create, Update, Delete)
│   ├── auth.ts           # Authentication actions
│   ├── meetings.ts       # Meeting management
│   ├── planning.ts       # Planning documents
│   ├── calendar.ts       # Calendar events
│   ├── team-members.ts   # Team management
│   ├── magic-links.ts    # Magic link authentication
│   └── unified-registration.ts # User registration
├── queries/     # Read operations and data fetching
│   ├── meetings.ts       # Meeting queries
│   ├── planning.ts       # Planning queries
│   ├── calendar.ts       # Calendar queries
│   ├── team-members.ts   # Team queries
│   └── school-info.ts    # School information
└── calendar/    # Calendar service layer
    ├── calendar-service.ts
    ├── calendar-client.ts
    └── types.ts
```

**Database Models** (Prisma):

- `User` - System users with roles
- `PlanningDocument` - Teacher planning documents
- `Meeting` - Parent-teacher meetings
- `CalendarEvent` - School calendar events
- `TeamMember` - Multidisciplinary team
- `CentroConsejoMember` - Council members

### UI Component System

**Component Architecture**:

```text
src/components/
├── ui/                    # Base shadcn/ui components
├── layout/               # Layout wrappers and navigation
├── providers/            # Context providers
├── [domain]/             # Domain-specific components (meetings/, planning/, etc.)
```

**Key UI Patterns**:

- `FixedBackgroundLayout` for consistent public page styling
- Adaptive components with loading states and error boundaries
- Mobile-responsive with gesture support in sidebars

### Provider Stack

The app uses multiple nested providers (`src/components/providers.tsx`):

1. **SessionProvider** (NextAuth) - Optimized refresh intervals
2. **ThemeProvider** - Dark/light mode
3. **LanguageProvider** - i18n context
4. **DesktopToggleProvider** - Desktop view preferences
5. **WebVitalsProvider** - Performance monitoring

## Critical Development Patterns

### Server Actions Pattern

Always use the services layer for database operations:

```typescript
// ✅ Correct - use services
import { createMeeting } from '@/services/actions/meetings';

// ❌ Wrong - direct Prisma calls
import { db } from '@/lib/db';
```

### Role-Based Component Rendering

Check user roles in components using the session:

```typescript
const session = await auth();
const isAdmin = session?.user?.role === 'ADMIN';
```

### Error Handling Standard

- API routes return `{ success: boolean, error?: string }` format
- Use loading skeletons and error boundaries for UI states
- Server Actions handle validation with Zod schemas

### File Upload Architecture

- Uses Cloudinary for media storage
- `src/lib/cornerstone.ts` and `src/lib/simple-upload.ts` handle uploads
- Progress tracking with UI components

## Testing Requirements

### Test Structure

- **Unit Tests**: `tests/unit/` using Vitest + jsdom
- **Integration Tests**: `tests/integration/` for API testing
- **E2E Tests**: `tests/e2e/` using Playwright
- **Accessibility Tests**: axe-core integration

### Coverage Requirements & Current Status

- **Lines**: 80%+ threshold (currently meeting targets)
- **Functions**: 70%+ threshold (currently meeting targets)
- **Branches**: 70%+ threshold (currently meeting targets)

### Test Statistics (Current)

- **Unit Tests**: 296/296 passing (100%)
- **E2E Tests**: 140/140 passing (100%)
- **Accessibility**: 98/98 passing (100%)
- **Performance**: 25/25 passing (100%)
- **Total Source Files**: 331 TypeScript/React files
- **Total Test Files**: 38 test specifications
- **Overall**: 495+ comprehensive tests with 99.2% success rate

### Test Users (seeded in development)

| Role      | Email                                 | Password      |
|-----------|---------------------------------------|---------------|
| ADMIN     | [admin@manitospintadas.cl](mailto:admin@manitospintadas.cl)     | admin123      |
| PROFESOR  | [profesor@manitospintadas.cl](mailto:profesor@manitospintadas.cl) | profesor123   |
| PARENT    | [parent@manitospintadas.cl](mailto:parent@manitospintadas.cl)   | parent123     |

## Environment Configuration

### Required Variables

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-secret
CLOUDINARY_URL=cloudinary://...
```

### Optional OAuth Variables

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Key Architectural Decisions

### Performance Optimizations

- SessionProvider with selective refresh (`refetchOnWindowFocus` only for auth routes)
- Optimized imports and dynamic loading where appropriate
- Image optimization through Cloudinary integration
- Edge runtime compatibility in middleware

### Security Measures

- All routes protected by middleware with role validation
- CSRF protection through NextAuth
- Input validation using Zod schemas
- Secure cookie configuration aligned with Auth.js v5

### Database Approach

- PostgreSQL for production (Supabase)
- SQLite for development convenience
- Prisma migrations for schema evolution
- Seed scripts for consistent test data

## Common Pitfalls to Avoid

1. **Never bypass the services layer** - Always use `src/services/actions/` and `src/services/queries/`
2. **Don't mix auth approaches** - Stick to NextAuth.js patterns, don't create custom auth
3. **Respect the role hierarchy** - Don't create routes that bypass middleware protection
4. **Follow the provider nesting order** - Changing provider order can break functionality
5. **Always test role-based access** - E2E tests must verify route protection works
6. **Run tests before commits** - All 495+ tests must pass (use `npm run test:all`)
7. **Don't ignore TypeScript errors** - Use `npm run type-check` and fix all issues
8. **Follow the zero-warning policy** - ESLint must pass with `--max-warnings=0`

## Domain-Specific Features

### Meeting System

- Parent-initiated meeting requests
- Teacher approval workflow
- Calendar integration
- Email notifications (when configured)

### Planning Documents

- Teacher-created lesson plans
- File attachment support
- Admin oversight capabilities
- Version control through database

### Centro Consejo Integration

- OAuth-only access (Google/Facebook)
- Separate voting system
- Public information display
- Council member management

## Development Workflow Commands

### Quick Development Setup

```bash
# Complete development setup from scratch
npm install
npm run db:generate && npm run db:push && npm run db:seed
npm run create-all-test-users
npm run dev

# Alternative automated setup
./scripts/setup-dev.sh     # Complete automated development setup
```

### Pre-commit Quality Check

```bash
# Essential checks before committing (all must pass)
npm run format              # Auto-fix formatting
npm run lint                # Check for linting errors (zero warnings allowed)
npm run type-check          # Verify TypeScript compilation
npm run test:all            # Run complete test suite (495+ tests)
```

### Performance and Analysis

```bash
npm run analyze             # Bundle analysis
npm run test:performance    # Lighthouse performance tests
npm run verify-env          # Check environment configuration
npm run verify-supabase     # Test database connection
tsx scripts/seed-team-members.ts # Seed team member data
npm run env:status          # Check environment status
```

### Advanced Testing Commands

```bash
# Comprehensive testing workflow
npm run test:comprehensive  # All tests including performance
npm run test:setup          # Setup test environment
npx playwright install      # Install browsers for E2E tests

# Specific test categories
npm run test:visual         # Visual regression tests
npm run test:integration    # Integration tests
npm run test:performance:all # All performance tests
```

## Important Notes for Development

### Build Process

- Development uses SQLite by default for convenience
- Production builds require PostgreSQL (configured via DATABASE_URL)
- Build command includes database generation: `npm run build`
- Vercel deployment uses optimized build: `npm run build:vercel`
- Turbo mode available for faster development: `npm run dev:turbo`
- Production preparation script: `node scripts/prepare-production.js`

### Testing Philosophy

- **Zero tolerance for test failures** - All 495+ tests must pass
- **Comprehensive coverage** - Unit, integration, E2E, accessibility, performance
- **Role-based testing** - Every feature tested across all user roles
- **Performance monitoring** - Lighthouse CI integration for performance regression detection

### Utility Scripts

The `scripts/` directory contains several utility scripts for development and deployment:

```bash
# Development utilities
./scripts/setup-dev.sh          # Automated development setup
./scripts/clean.sh              # Clean build artifacts and cache
./scripts/validate-deployment.sh # Validate deployment configuration

# Database utilities
tsx scripts/emergency-seed.ts   # Emergency database seeding
tsx scripts/seed-team-members.ts # Populate team member data
tsx scripts/count-users.ts      # Count and display all users
tsx scripts/verify-users.ts     # Verify test users in database

# Deployment utilities
./scripts/deploy-dev.sh         # Deploy to development environment
./scripts/deploy-prod.sh        # Deploy to production environment

# Security utilities
./scripts/protect.sh            # Enable branch protection
./scripts/unprotect.sh          # Disable branch protection
./scripts/check-protected.sh    # Check protection status
./scripts/ci-check-protected.sh # CI protection verification
