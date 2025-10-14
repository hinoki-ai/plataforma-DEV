# Authentication System Documentation

**Last Updated**: October 14, 2025
**Status**: Fully Operational ✅
**Site**: <https://plataforma.aramac.dev>

## 🏗️ SYSTEM ARCHITECTURE

### Overview

The Plataforma Astral authentication system uses **NextAuth.js v5** with a hybrid approach:

- **Credentials Provider**: For staff (ADMIN, PROFESOR, MASTER) - Convex database authentication
- **OAuth Providers**: For parents (PARENT) - Google login
- **Role-Based Access**: Middleware-enforced route protection
- **Transition Pages**: Auth-success page handles role-based routing

### Authentication Flow

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Login  │───▶│ NextAuth.js │───▶│ Convex DB   │───▶│ JWT Session │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                                      │
                           ▼                                      ▼
                   ┌─────────────┐                        ┌─────────────┐
                   │ Auth-Success│                        │ Role-Based  │
                   │ Transition  │───▶───────────────────▶│ Dashboard   │
                   └─────────────┘                        └─────────────┘
                           ▲                                      │
                           │                                      ▼
                   ┌─────────────┐                        ┌─────────────┐
                   │ Middleware  │◀───────────────────────│ Route        │
                   │ Protection  │                        │ Protection   │
                   └─────────────┘                        └─────────────┘
```

## 🔧 CORE COMPONENTS

### 1. NextAuth Configuration (`src/lib/auth.ts`)

```typescript
// Key Features:
- trustHost: true // Required for Vercel deployment
- session.strategy: 'jwt' // JWT-based sessions
- session.maxAge: 24 * 60 * 60 // 24 hour sessions
- debug: false // Production setting

// CRITICAL FIX: Added pages configuration
pages: {
  signIn: "/login",
  signOut: "/login",
  error: "/login",
}
```

**Critical Environment Variables**:

- `NEXTAUTH_URL`: Must match exact production domain
- `NEXTAUTH_SECRET`: 32+ character secret key (minimum 32 chars)
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL

### 2. Convex Database Authentication (`src/lib/auth-convex.ts`)

```typescript
// Authentication Methods:
- authenticateUser(email, password) // Credentials login via Convex
- findUserByEmail(email) // OAuth validation
- Emergency bypass: admin@plataforma-astral.com / admin123 (when DB fails)
```

### 3. Route Protection (`src/middleware.ts`)

```typescript
// Protected Routes:
- /master/** → MASTER only
- /admin/** → ADMIN + MASTER
- /profesor/** → PROFESOR + ADMIN + MASTER
- /parent/** → PARENT + ADMIN + MASTER

// Public Routes:
- /, /centro-consejo, /fotos-videos, /login, /auth-success

// CRITICAL: /auth-success excluded from middleware checks
if (pathname.startsWith("/auth-success")) {
  return NextResponse.next(); // Skip auth checks
}
```

### 4. Auth Success Transition Page (`src/app/auth-success/page.tsx`)

**Purpose**: Handles role-based routing after successful authentication
**Features**:

- Validates complete session data (user.id, user.email, user.role)
- Retry mechanism for delayed session cookies (3 attempts)
- Role-based redirects with fallback to home
- Timeout safety (10 seconds)

### 5. Smart Cookie Detection (`src/lib/middleware-auth.ts`)

**Environment-aware cookie detection**:

- Production/HTTPS: prioritizes `__Secure-` prefixed cookies
- Development/HTTP: prioritizes standard cookies
- Debug logging for troubleshooting

## 👥 USER ROLES & ACCESS

### MASTER Role

- **Access**: Complete system control and oversight
- **Routes**: `/master/**`
- **Authentication**: Credentials only (database)
- **Capabilities**: All administrative functions, security center, audit logs, user management

### ADMIN Role

- **Access**: Full system administration
- **Routes**: `/admin/**`
- **Authentication**: Credentials only (database)
- **Capabilities**: User management, meetings, planning oversight, calendar management, voting system

### PROFESOR Role

- **Access**: Teaching and planning features
- **Routes**: `/profesor/**`
- **Authentication**: Credentials only (database)
- **Capabilities**: Planning documents, meetings, calendar view, student data, parent communication

### PARENT Role

- **Access**: Parent-specific features
- **Routes**: `/parent/**`
- **Authentication**: OAuth (Google) or credentials
- **Capabilities**: Meeting requests, student progress, voting participation, calendar viewing

### PUBLIC Role

- **Access**: Public information only
- **Routes**: Public routes only
- **Authentication**: None required
- **Capabilities**: General school information, Centro Consejo voting

## 🔐 SECURITY IMPLEMENTATION

### Password Security

```typescript
// Hashing: bcryptjs with salt rounds 12
const hashedPassword = await bcrypt.hash(password, 12);

// Verification: secure comparison
const isValid = await verifyPassword(plaintext, hashed);
```

### Session Management

```typescript
// JWT Configuration:
- Algorithm: HS256 (default)
- Expiration: 24 hours
- Secure cookies in production
- SameSite: 'lax' for OAuth compatibility
```

### CSRF Protection

- Built-in NextAuth CSRF protection
- Session token validation
- Origin verification

### OAuth Security

```typescript
// Provider Configuration:
- Google OAuth: Restricted to parent registration
- Existing staff accounts: OAuth blocked for ADMIN/PROFESOR/MASTER roles
- New OAuth users: Auto-assigned PARENT role
```

## 🚨 CRITICAL ISSUES & FIXES

### Resolved Issues

#### 1. **Redirect Loop Between Login & Dashboard**

**Problem**: Users stuck in infinite `/login → /auth-success → /login` loop
**Root Cause**: Race condition between client/server session detection, `/auth-success` not excluded from middleware
**Fix**: Added `/auth-success` to middleware skip list, improved session validation

#### 2. **Race Condition in Login Flow**

**Problem**: Session cookie not set before middleware checked it
**Fix**: Added 200ms delay after session update, replaced `window.location.href` with `router.push()`

#### 3. **Session Validation Issues**

**Problem**: Auth-success page didn't validate complete session data
**Fix**: Added validation for `session.user.role`, retry mechanism (3 attempts), 10s timeout

#### 4. **Cookie Detection Problems**

**Problem**: Middleware couldn't find session cookies in different environments
**Fix**: Environment-aware cookie detection (`__Secure-` prefix in production)

#### 5. **Missing NextAuth Pages Configuration**

**Problem**: NextAuth using default redirects that conflicted with custom flow
**Fix**: Added explicit `pages` configuration in authOptions

### Testing Checklist

#### HIGH PRIORITY (Must Pass)

- [x] MASTER role login → `/master`
- [x] ADMIN role login → `/admin`
- [x] PROFESOR role login → `/profesor`
- [x] PARENT role login → `/parent`
- [x] Invalid credentials → error message, stay on login
- [x] Protected route (logged out) → redirect to login
- [x] Session persistence across refresh

#### MEDIUM PRIORITY (90%+ Pass Rate)

- [x] Concurrent login attempts → no race conditions
- [x] OAuth flow (Google) → works for parents only
- [x] Session expiration → graceful redirect
- [x] Logout flow → session cleared

## 🌐 ENVIRONMENT CONFIGURATION

### Production Environment (Vercel)

```bash
# Core Authentication
NEXTAUTH_URL="https://plataforma.aramac.dev"
NEXTAUTH_SECRET="production-secret-32-chars-minimum"
NEXT_PUBLIC_CONVEX_URL="https://industrious-manatee-7.convex.cloud"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Development Environment

```bash
# Local Development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-32-chars-minimum"
NEXT_PUBLIC_CONVEX_URL="your-convex-dev-url"
```

### Environment File Hierarchy

1. `.env.local` - Local development overrides
2. `.env.production` - Production-specific values
3. `.env` - Default/shared values
4. `Vercel Environment Variables` - Production deployment

## 🚀 DEPLOYMENT PROCESS

### Quick Deployment

```bash
# Deploy Convex backend first
npx convex deploy -y

# Commit and push (triggers Vercel deployment)
git add .
git commit -m "feat: authentication updates"
git push origin main

# Verify deployment
curl -s https://plataforma.aramac.dev/api/health
```

### Pre-Deployment Checklist

- [x] All critical auth issues resolved
- [x] TypeScript compilation passes
- [x] ESLint passes (0 warnings)
- [x] Environment variables configured
- [x] Convex deployment successful

## 🔍 TESTING & VALIDATION

### Critical Test Cases

**Must Pass Before Production:**

- [x] MASTER login → `/master` dashboard
- [x] ADMIN login → `/admin` dashboard
- [x] PROFESOR login → `/profesor` dashboard
- [x] PARENT login → `/parent` dashboard
- [x] Invalid credentials → error, stay on login
- [x] Session persistence after refresh
- [x] Logout → redirect to login, session cleared

### Health Checks

```bash
# System health
curl -s https://plataforma.aramac.dev/api/health

# Authentication status
curl -s https://plataforma.aramac.dev/api/auth/session

# Route protection test
curl -I https://plataforma.aramac.dev/admin  # Should redirect when not logged in
```

## 🚨 EMERGENCY PROCEDURES

### Emergency Admin Access

If authentication system fails completely:

1. **Emergency Bypass** in `src/lib/auth-convex.ts`:

   ```typescript
   if (email === "admin@plataforma-astral.com" && password === "admin123") {
     return emergency_admin_user; // Works even if Convex is down
   }
   ```

2. **Emergency Credentials**:
   - Email: `admin@plataforma-astral.com`
   - Password: `admin123`

3. **When to Use**: Only when Convex database is completely unreachable

### Recovery Steps

```bash
# Check Convex status
npx convex dashboard

# Redeploy if needed
npx convex deploy -y

# Verify health endpoint
curl -s https://plataforma.aramac.dev/api/health
```

## 🔧 TROUBLESHOOTING

### Common Issues

#### Redirect Loops

**Symptoms**: Stuck bouncing between login and dashboard
**Check**:

- Is `/auth-success` in middleware skip list? (Should be excluded)
- Browser console for session data
- Network tab for auth API calls
- Clear cookies and try again

#### Session Not Persisting

**Symptoms**: Logged out after refresh
**Check**:

- Is `NEXTAUTH_SECRET` set correctly (32+ chars)?
- Cookie present in Application tab?
- Correct domain/path on cookie?

#### Wrong Role Redirects

**Symptoms**: Logged in but wrong dashboard
**Check**:

- Console logs: is role correctly set in JWT?
- Database: does user have correct role?
- Middleware logs: is role detected?

#### OAuth Issues

**Symptoms**: Google login not working
**Check**:

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set?
- OAuth restricted to PARENT role only?
- Callback URL matches Google Console settings

### Debug Commands

```bash
# Check middleware logs
curl -I https://plataforma.aramac.dev/admin

# Test session endpoint
curl -s https://plataforma.aramac.dev/api/auth/session

# Check Convex deployment
npx convex dashboard
```

---

**Status**: ✅ FULLY OPERATIONAL  
**Last Updated**: October 14, 2025  
**All Critical Issues**: RESOLVED
