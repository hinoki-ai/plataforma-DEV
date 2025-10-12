# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Plataforma Astral** is a comprehensive SaaS platform for teacher, admin, and parent control with extensive features, built with Next.js 15 and Convex (serverless backend), designed for educational institutions. The platform features role-based access control, meeting scheduling, educational planning, and Centro Consejo voting functionality. The project has been migrated from Prisma/PostgreSQL to Convex for real-time capabilities and simplified backend management.

## 📚 Critical Documentation (NEW)

**Authentication System Fixed**: September 1, 2025 ✅
**Latest Updates**: Calendar component improvements, timeout type fixes, deployment verification tests

### Quick Authentication Troubleshooting

```bash
# 1. Check system status (30 seconds)
curl -I https://plataforma-astral.com
curl -s https://plataforma-astral.com/api/auth/session

# 2. Test emergency access if normal login fails
# Email: admin@plataforma-astral.com | Password: admin123

# 3. Most common fix - check NEXTAUTH_URL
npx vercel env ls | grep NEXTAUTH_URL
# Should show: https://plataforma-astral.com
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
# Install dependencies
npm install

# Initialize Convex (first time only)
npx convex dev
# This will open browser, create/select project, and generate types

# Add Convex URL to .env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Development server (Terminal 1)
npx convex dev

# Development server (Terminal 2)
npm run dev

# View Convex dashboard
npx convex dashboard
```

### Code Quality & Testing

```bash
# Format and lint
npm run format              # Prettier + ESLint fix
npm run lint                # ESLint check (max 0 warnings)
npm run type-check          # TypeScript validation

# Testing (NOTE: Tests being updated for Convex)
npm run test:unit           # Vitest unit tests
npm run test:e2e            # Playwright E2E tests
npm run test:a11y           # Accessibility tests
npm run test:performance    # Lighthouse performance tests
npm run test:all            # Complete test suite

# Development testing
npm run test:unit:watch     # Unit tests in watch mode
npm run test:e2e:ui         # E2E tests with UI
npm run test:e2e:debug      # E2E tests in debug mode
npm run test:unit:coverage  # Generate coverage report
```

### Convex Operations

```bash
# Development
npx convex dev              # Start Convex dev server (watches for changes)
npx convex dashboard        # Open Convex dashboard in browser

# Deployment
npx convex deploy           # Deploy to production
npx convex deploy --prod    # Deploy with production flag

# Data Management
# Use Convex dashboard for data viewing/editing
# Or create custom scripts using Convex client

# Note: Old Prisma commands (db:*) have been removed
# Convex handles schema automatically from convex/schema.ts
```

## Architecture Overview

### Core Stack

- **Next.js 15** with App Router and React 19
- **Convex** serverless backend with real-time database
- **NextAuth.js v5** with role-based middleware protection
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
- `src/lib/auth-convex.ts` - User authentication logic with Convex
- `src/lib/convex.ts` - Convex client configuration
- `src/services/actions/auth.ts` - Server Actions for login/logout
- `src/middleware.ts` - Route protection and role-based redirects

### Data Layer Architecture

**Backend**: Convex serverless functions in `convex/` directory

```text
convex/
├── schema.ts             # Database schema (32 models)
├── users.ts              # User operations
├── meetings.ts           # Meeting management
├── planning.ts           # Planning documents
├── calendar.ts           # Calendar events
├── students.ts           # Student management
├── activities.ts         # Activity tracking
├── notifications.ts      # Notifications
├── votes.ts              # Voting system
├── media.ts              # Photos & videos
├── teamMembers.ts        # Team management
├── schoolInfo.ts         # School information
├── auth.ts               # OAuth & sessions
└── _generated/           # Auto-generated types
```

**Services Layer** (backward-compatible wrappers):

```text
src/services/
├── actions/     # Server Actions wrapping Convex mutations
│   ├── auth.ts           # Authentication actions
│   ├── meetings.ts       # Meeting management
│   ├── planning.ts       # Planning documents
│   ├── calendar.ts       # Calendar events
│   ├── team-members.ts   # Team management
│   └── unified-registration.ts # User registration
├── queries/     # Read operations wrapping Convex queries
│   ├── meetings.ts       # Meeting queries
│   ├── planning.ts       # Planning queries
│   ├── calendar.ts       # Calendar queries
│   ├── team-members.ts   # Team queries
│   └── school-info.ts    # School information
└── calendar/    # Calendar service layer
    ├── calendar-service.ts  # Being migrated to Convex
    ├── calendar-client.ts
    └── types.ts
```

**Database Models** (Convex Schema):

- `users` - System users with roles
- `planningDocuments` - Teacher planning documents
- `meetings` - Parent-teacher meetings
- `calendarEvents` - School calendar events
- `teamMembers` - Multidisciplinary team
- `centroConsejoMembers` - Council members
- Plus 26 more models for complete functionality

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
import { createMeeting } from "@/services/actions/meetings";

// ✅ Or use Convex client directly in API routes
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const client = getConvexClient();
const meetings = await client.query(api.meetings.getMeetings, {});

// ❌ Wrong - old Prisma calls (removed)
import { db } from "@/lib/db"; // This file no longer exists
```

### Role-Based Component Rendering

Check user roles in components using the session:

```typescript
const session = await auth();
const isAdmin = session?.user?.role === "ADMIN";
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

| Role     | Email                                                             | Password    |
| -------- | ----------------------------------------------------------------- | ----------- |
| ADMIN    | [admin@plataforma-astral.com](mailto:admin@plataforma-astral.com)       | admin123    |
| PROFESOR | [profesor@plataforma-astral.com](mailto:profesor@plataforma-astral.com) | profesor123 |
| PARENT   | [parent@plataforma-astral.com](mailto:parent@plataforma-astral.com)     | parent123   |

## Environment Configuration

### Required Variables

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-secret
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
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

- **Convex** serverless database (real-time, type-safe)
- No migrations needed - schema defined in `convex/schema.ts`
- Automatic type generation from schema
- Built-in dashboard for data inspection
- Real-time subscriptions out of the box

## Common Pitfalls to Avoid

1. **Never bypass the services layer** - Always use `src/services/actions/` and `src/services/queries/` or Convex client
2. **Always run `npx convex dev`** - Required for type generation and development
3. **Don't mix auth approaches** - Stick to NextAuth.js patterns, don't create custom auth
4. **Respect the role hierarchy** - Don't create routes that bypass middleware protection
5. **Follow the provider nesting order** - Changing provider order can break functionality
6. **Always test role-based access** - E2E tests must verify route protection works
7. **Check migration status** - See `MIGRATION.md` for which API routes are migrated
8. **Don't ignore TypeScript errors** - Use `npm run type-check` and fix all issues
9. **Follow the zero-warning policy** - ESLint must pass with `--max-warnings=0`
10. **Keep Convex dev running** - Required for hot reload and type updates

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
Use Convex dashboard for test user creation
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
npx convex dashboard        # View Convex dashboard
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

- Development requires Convex dev server running (`npx convex dev`)
- Production builds require `NEXT_PUBLIC_CONVEX_URL` environment variable
- Build command: `npm run build`
- Convex deployment: `npx convex deploy` (separate from Next.js)
- Deploy Next.js after deploying Convex to production
- Turbo mode available for faster development: `npm run dev:turbo`

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
npx convex dashboard           # Manage Convex data
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
```
