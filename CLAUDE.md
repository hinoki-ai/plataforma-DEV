# COGNITO AI - Educational Assistant Documentation

This file provides guidance for working with the Cogníto AI educational assistant feature in the Plataforma Astral codebase.

## Project Overview

**Plataforma Astral** is a comprehensive SaaS platform for teacher, admin, and parent control with extensive features, built with Next.js 16 and Convex (serverless backend), designed for educational institutions. The platform features role-based access control, meeting scheduling, educational planning, Centro Consejo voting functionality, and **Cogníto AI** - an integrated educational assistant. The project has been migrated from Prisma/PostgreSQL to Convex for real-time capabilities and simplified backend management.

**Note**: When referring to "Cogníto", this documentation specifically addresses the Cogníto AI educational assistant feature only, not general AI assistance or other AI-related functionality.

## 📚 Critical Documentation

**Status**: Production ready with full Convex integration ✅
**Backend**: 100% migrated to Convex serverless
**Authentication**: Clerk integration complete
**Cogníto AI**: Educational assistant feature integrated

### Primary Documentation Reference

- **⭐ `docs/AI_KNOWLEDGE_BASE.md`** - **PRIMARY**: Complete system documentation (includes Clerk + Convex authentication)
- `DOCUMENTATION_INDEX.md` - Complete documentation catalog
- `docs/CLERK_SETUP.md` - Clerk authentication setup guide
- `DEPLOYMENT.md` - Deployment procedures
- `START_HERE.md` - Quick start guide

### Cogníto AI Feature Documentation

**Cogníto AI** is the integrated educational assistant feature that provides:

- Interactive chat support for users (admin, teacher, parent, master roles)
- Guided onboarding tours for new users
- Proactive suggestions and analytics
- Welcome messages and contextual help
- Real-time educational assistance

**Key Cogníto Components**:

- `src/components/ui/cognito-chat.tsx` - Main chat interface
- `src/components/ui/cognito-tour.tsx` - Interactive onboarding tours
- `src/components/ui/cognito-indicator.tsx` - Floating assistant indicator
- `convex/functions/ask.ts` - Backend chat processing (`cognitoChat` action)

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

- **Next.js 16** with App Router and React 19
- **Convex** serverless backend with real-time database
- **Clerk** authentication with role-based proxy protection
- **Tailwind CSS** + **shadcn/ui** components
- **TypeScript** throughout the entire codebase

### Authentication & Authorization System

The system uses a strict role-based access model with proxy enforcement:

**Roles**: `ADMIN`, `PROFESOR`, `PARENT`, `PUBLIC`

**Route Protection** (`src/proxy.ts`):

- `/admin/**` → ADMIN only
- `/profesor/**` → PROFESOR only
- `/parent/**` → PARENT only
- Public routes: `/`, `/cpa`, `/fotos-videos`

**Key Auth Files**:

- `src/lib/auth.ts` - Clerk authentication integration with Convex user resolution
- `src/lib/convex.ts` - Convex client configuration
- `src/services/actions/clerk-users.ts` - Clerk user management actions
- `src/proxy.ts` - Route protection and role-based redirects

**Note**: System uses Clerk for authentication (migrated from NextAuth.js v5). See `docs/AI_KNOWLEDGE_BASE.md` for complete authentication system details.

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
├── institutionInfo.ts    # Institution information
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
    ├── calendar-service.ts  # Convex integration
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

Always use the services layer or Convex client for database operations:

```typescript
// ✅ Correct - use services
import { createMeeting } from "@/services/actions/meetings";

// ✅ Or use Convex client directly in API routes
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const client = getConvexClient();
const meetings = await client.query(api.meetings.getMeetings, {});
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

### Test Users

Create test users via Convex dashboard or use the seed script:

```bash
npx tsx scripts/seed-convex.ts
```

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
- Edge runtime compatibility in proxy

### Security Measures

- All routes protected by proxy with role validation
- CSRF protection through NextAuth
- Input validation using Zod schemas
- Secure cookie configuration aligned with Auth.js v5

### Database Approach

- **Convex** serverless database (real-time, type-safe)
- No migrations needed - schema defined in `convex/schema.ts`
- Automatic type generation from schema
- Built-in dashboard for data inspection at `npx convex dashboard`
- Real-time subscriptions out of the box
- Edge-compatible with optimistic updates

## Common Pitfalls to Avoid

1. **Never bypass the services layer** - Always use `src/services/actions/` and `src/services/queries/` or Convex client
2. **Always run `npx convex dev`** - Required for type generation and development
3. **Don't mix auth approaches** - Stick to NextAuth.js patterns, don't create custom auth
4. **Respect the role hierarchy** - Don't create routes that bypass proxy protection
5. **Follow the provider nesting order** - Changing provider order can break functionality
6. **Always test role-based access** - E2E tests must verify route protection works
7. **Don't ignore TypeScript errors** - Use `npm run type-check` and fix all issues
8. **Follow the zero-warning policy** - ESLint must pass with `--max-warnings=0`
9. **Keep Convex dev running** - Required for hot reload and type updates
10. **Always query with proper filters** - Use indexes for optimal Convex query performance

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

### Cogníto AI Educational Assistant

- Role-based chat support (Admin/Teacher/Parent/Master)
- Interactive onboarding tours
- Proactive suggestions and analytics
- Welcome messages with contextual help
- Real-time educational assistance

## Development Workflow Commands

### Quick Development Setup

```bash
# Complete development setup from scratch
npm install
npx convex dev              # Terminal 1: Start Convex dev server
npm run dev                 # Terminal 2: Start Next.js dev server

# Seed database (optional)
npx tsx scripts/seed-convex.ts
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
# Database utilities
npx convex dashboard            # Manage Convex data
npx tsx scripts/seed-convex.ts  # Seed database with test data

# Development utilities
./scripts/clean.sh              # Clean build artifacts and cache

# Deployment utilities
npx convex deploy               # Deploy Convex to production
git push origin main            # Deploy Next.js via Vercel
```
