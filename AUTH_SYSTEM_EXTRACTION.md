# Authentication System Extraction - Plataforma Astral

## Overview

This document provides a comprehensive extraction of the login authentication system integrated with Convex database in the Plataforma Astral educational management system.

**Tech Stack:**

- **NextAuth.js v5 (Auth.js)** - Authentication framework
- **Convex** - Serverless database backend
- **Next.js 15** - Application framework with App Router
- **bcryptjs** - Password hashing
- **JWT** - Session management strategy

---

## Architecture Components

### 1. Core Authentication Files

#### 📁 `/src/lib/auth.ts` - NextAuth Configuration

**Purpose:** Main NextAuth.js configuration with providers and callbacks

**Key Features:**

- JWT session strategy (24-hour expiry, hourly updates)
- Dual authentication providers:
  - **Credentials Provider**: Email/password authentication via Convex
  - **Google OAuth Provider**: For parent users only
- Convex adapter integration
- Role-based authentication callbacks
- Custom session/JWT handling with role propagation

**Configuration:**

```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,        // 24 hours
  updateAge: 60 * 60,           // Update every hour
}
```

**Security Features:**

- OAuth restriction: Only PARENT role can use OAuth (Google)
- Admin/Teacher users must use credentials authentication
- Automatic role injection into session
- Password verification via Convex utilities

#### 📁 `/src/lib/auth-convex.ts` - Convex Authentication Utilities

**Purpose:** Bridge between NextAuth and Convex database operations

**Core Functions:**

1. **`authenticateUser(email, password)`**
   - Queries Convex for user by email
   - Verifies password using bcryptjs
   - Returns user object without password
   - Checks `isActive` status

2. **`findUserByEmail(email)`**
   - Retrieves user from Convex by email
   - Used in OAuth flow and user lookups

3. **`findUserById(id)`**
   - Retrieves user from Convex by ID
   - Used for session validation

4. **`createUser(data)`**
   - Creates new user in Convex
   - Hashes password with bcryptjs (10 rounds)
   - Supports OAuth and credential users

**Type Definitions:**

```typescript
export type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

export interface User {
  _id: Id<"users">;
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  isActive: boolean;
}
```

#### 📁 `/src/lib/convex.ts` - Convex Client

**Purpose:** Central Convex HTTP client configuration

```typescript
export const convexHttpClient = CONVEX_URL
  ? new ConvexHttpClient(CONVEX_URL)
  : null;

export function getConvexClient() {
  if (!convexHttpClient) {
    throw new Error("Convex client not initialized");
  }
  return convexHttpClient;
}
```

**Environment Required:**

- `NEXT_PUBLIC_CONVEX_URL` - Convex backend URL

---

### 2. Convex Backend Layer

#### 📁 `/convex/schema.ts` - Database Schema

**Authentication Tables:**

**`users` Table:**

```typescript
users: defineTable({
  name: v.optional(v.string()),
  email: v.string(),
  emailVerified: v.optional(v.number()),
  image: v.optional(v.string()),
  password: v.optional(v.string()),
  phone: v.optional(v.string()),
  role: v.union(
    v.literal("MASTER"),
    v.literal("ADMIN"),
    v.literal("PROFESOR"),
    v.literal("PARENT"),
    v.literal("PUBLIC")
  ),
  isActive: v.boolean(),
  parentRole: v.optional(v.string()),
  status: v.optional(v.union(...)),
  provider: v.optional(v.string()),
  isOAuthUser: v.boolean(),
  createdByAdmin: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_email", ["email"])
.index("by_role", ["role"])
.index("by_isActive", ["isActive"])
```

**`accounts` Table (OAuth):**

```typescript
accounts: defineTable({
  userId: v.id("users"),
  type: v.string(),
  provider: v.string(),
  providerAccountId: v.string(),
  refresh_token: v.optional(v.string()),
  access_token: v.optional(v.string()),
  expires_at: v.optional(v.number()),
  token_type: v.optional(v.string()),
  scope: v.optional(v.string()),
  id_token: v.optional(v.string()),
  session_state: v.optional(v.string()),
})
  .index("by_userId", ["userId"])
  .index("by_provider_providerAccountId", ["provider", "providerAccountId"]);
```

**`sessions` Table:**

```typescript
sessions: defineTable({
  sessionToken: v.string(),
  userId: v.id("users"),
  expires: v.number(),
})
  .index("by_sessionToken", ["sessionToken"])
  .index("by_userId", ["userId"]);
```

**`verificationTokens` Table:**

```typescript
verificationTokens: defineTable({
  identifier: v.string(),
  token: v.string(),
  expires: v.number(),
}).index("by_identifier_token", ["identifier", "token"]);
```

#### 📁 `/convex/users.ts` - User Queries & Mutations

**Queries:**

- `getUserByEmail(email)` - Find user by email
- `getUserById(userId)` - Find user by ID
- `getUsers(role?, isActive?)` - Get users with filters
- `getUserCountByRole()` - Statistics by role
- `getUserStats()` - Dashboard statistics
- `getStaffUsers()` - Get ADMIN + PROFESOR users

**Mutations:**

- `createUser(data)` - Create new user
- `updateUser(id, updates)` - Update user fields
- `deleteUser(id)` - Delete user
- `updateLastLogin(userId)` - Track last login

**Validation:**

- Email uniqueness on creation/update
- Required fields enforcement
- Timestamp auto-management

#### 📁 `/convex/auth.ts` - Auth-specific Operations

**Account Operations:**

- `getAccountByProvider()` - Find OAuth account
- `getAccountsByUserId()` - User's OAuth accounts
- `createAccount()` - Link OAuth provider
- `deleteAccount()` - Unlink provider

**Session Operations:**

- `getSessionByToken()` - Validate session token
- `getSessionsByUserId()` - User's active sessions
- `createSession()` - Create new session
- `updateSession()` - Refresh session expiry
- `deleteSession()` - Logout
- `deleteExpiredSessions()` - Cleanup cron job

**Verification Tokens:**

- `getVerificationToken()` - Find verification token
- `createVerificationToken()` - Generate email verification
- `deleteVerificationToken()` - Consume token

#### 📁 `/convex/authAdapter.ts` - NextAuth Adapter

**Purpose:** Implements NextAuth Adapter interface for Convex

**Key Methods:**

- `createUser()` - Create user via NextAuth (OAuth flow)
- `getUser(id)` - Retrieve user for session
- `getUserByEmail()` - OAuth email lookup
- `getUserByAccount()` - Find user by OAuth provider
- `updateUser()` - Update user profile
- `linkAccount()` - Connect OAuth provider
- `createSession()` - JWT session creation
- `getSessionAndUser()` - Validate session + user
- `useVerificationToken()` - Email verification flow

**Default Behavior:**

- New OAuth users → `PARENT` role
- Auto-set `isOAuthUser: true`
- Status: `ACTIVE` on creation

---

### 3. Adapter Layer

#### 📁 `/src/lib/convex-adapter.ts` - NextAuth ↔ Convex Bridge

**Purpose:** Converts NextAuth adapter calls to Convex API calls

**Implementation Pattern:**

```typescript
export function ConvexAdapter(client: ConvexHttpClient): Adapter {
  return {
    async createUser(user) {
      const userId = await client.mutation(api.authAdapter.createUser, {
        ...transformedData,
      });
      return { ...adapterUser };
    },
    // ... more adapter methods
  };
}
```

**Handles:**

- Date ↔ timestamp conversions
- Adapter type conformance
- Role injection from Convex
- Error handling

---

### 4. Middleware & Route Protection

#### 📁 `/src/middleware.ts` - Route Authorization

**Purpose:** Edge runtime middleware for route-based access control

**Route Access Matrix:**

```typescript
const ROUTE_ACCESS: Record<string, UserRole[]> = {
  "/master": ["MASTER"],
  "/admin": ["MASTER", "ADMIN"],
  "/profesor": ["MASTER", "ADMIN", "PROFESOR"],
  "/parent": ["MASTER", "ADMIN", "PARENT"],
  "/api/master": ["MASTER"],
  "/api/admin": ["MASTER", "ADMIN"],
  // ...
};
```

**Security Features:**

- Pre-auth redirects for logged-in users
- Role-based route authorization
- Automatic role-appropriate redirects
- Security headers on all responses:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin

**Flow:**

1. Check if route requires authentication
2. Validate user session via `getMiddlewareAuth()`
3. Check role permissions via `hasMiddlewareAccess()`
4. Redirect unauthorized users
5. Add security headers

#### 📁 `/src/lib/middleware-auth.ts` - Auth Helpers

**Key Functions:**

- `getMiddlewareAuth(req)` - Get session in Edge runtime
- `hasMiddlewareAccess(role, allowedRoles)` - Check authorization
- `getRoleRedirectPath(role)` - Default dashboard paths

---

### 5. Server Actions Layer

#### 📁 `/src/services/actions/auth.ts` - Auth Server Actions

**Purpose:** Server Actions for authentication operations

**Functions:**

1. **`authenticate(prevState, formData)`**
   - Form action compatible with `useActionState`
   - Validates email and password
   - Calls NextAuth `signIn()`
   - Returns error messages in Spanish
   - Redirects to `/auth-success` on success

2. **`loginAction(email, password)`**
   - Programmatic login
   - Returns `{ success: boolean, error?: string }`

3. **`logoutAction()`**
   - Calls NextAuth `signOut()`
   - No automatic redirect

**Error Handling:**

```typescript
switch (error.type) {
  case "CredentialsSignin":
    return "Credenciales inválidas...";
  case "CallbackRouteError":
    return "Error de autenticación...";
  default:
    return "Error de autenticación...";
}
```

---

### 6. Client Components

#### 📁 `/src/app/(auth)/login/page.tsx` - Login Page

**Features:**

- `useActionState` hook integration
- Real-time form validation
- Email regex validation
- Password visibility toggle
- Optimistic UI states
- i18n support
- Session-based redirect logic
- Accessibility (ARIA labels)

**State Management:**

```typescript
const [errorMessage, dispatch] = useActionState(authenticate, undefined);
const { status, data: session } = useSession();
```

**Validation:**

- Email format check (regex)
- Password minimum length (6 chars)
- Touched state tracking
- Real-time error display

---

## Authentication Flows

### Flow 1: Credentials Login (Email/Password)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User submits login form                                      │
│    ↓ (email, password)                                          │
│ 2. authenticate() Server Action                                 │
│    ↓                                                             │
│ 3. signIn("credentials", { email, password })                   │
│    ↓                                                             │
│ 4. Credentials Provider authorize() callback                    │
│    ├─→ authenticateUser(email, password)                        │
│    │   ├─→ Convex: getUserByEmail()                             │
│    │   └─→ bcrypt.compare(password, user.password)              │
│    └─→ Return user object with role                             │
│                                                                  │
│ 5. signIn() callback                                            │
│    └─→ Verify user exists in Convex                             │
│                                                                  │
│ 6. jwt() callback                                               │
│    └─→ Add role, id to token                                    │
│                                                                  │
│ 7. session() callback                                           │
│    └─→ Add role, id to session.user                             │
│                                                                  │
│ 8. Middleware checks role & redirects                           │
│    └─→ /admin, /profesor, or /parent dashboard                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: OAuth Login (Google)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google"                            │
│    ↓                                                             │
│ 2. Redirect to Google OAuth                                     │
│    ↓                                                             │
│ 3. Google returns with user profile                             │
│    ↓                                                             │
│ 4. signIn() callback                                            │
│    ├─→ findUserByEmail() in Convex                              │
│    ├─→ If user exists:                                          │
│    │   ├─→ role !== "PARENT" → BLOCK (401)                      │
│    │   └─→ role === "PARENT" → ALLOW                            │
│    └─→ If new user:                                             │
│        ├─→ Set role = "PARENT"                                  │
│        ├─→ Set needsRegistration = true                         │
│        └─→ Create via authAdapter.createUser()                  │
│                                                                  │
│ 5. Convex authAdapter                                           │
│    ├─→ createUser() mutation                                    │
│    ├─→ linkAccount() mutation                                   │
│    └─→ createSession() mutation                                 │
│                                                                  │
│ 6. jwt() callback                                               │
│    └─→ Add role="PARENT", needsRegistration to token            │
│                                                                  │
│ 7. session() callback                                           │
│    └─→ Add to session.user                                      │
│                                                                  │
│ 8. Middleware redirect                                          │
│    └─→ needsRegistration ? "/centro-consejo" : "/parent"        │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Session Validation (Middleware)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User navigates to protected route (/admin/*)                 │
│    ↓                                                             │
│ 2. Middleware intercepts request                                │
│    ↓                                                             │
│ 3. getMiddlewareAuth(request)                                   │
│    ├─→ Extract session token from cookie                        │
│    ├─→ Convex: getSessionAndUser(token)                         │
│    └─→ Return session with user.role                            │
│                                                                  │
│ 4. Check route access matrix                                    │
│    ├─→ Route: "/admin/*"                                        │
│    ├─→ Allowed: ["MASTER", "ADMIN"]                             │
│    └─→ User role: "PROFESOR" → UNAUTHORIZED                     │
│                                                                  │
│ 5. hasMiddlewareAccess(userRole, allowedRoles)                  │
│    └─→ Returns false                                            │
│                                                                  │
│ 6. Redirect to appropriate dashboard                            │
│    └─→ getRoleRedirectPath("PROFESOR") → "/profesor"            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role Hierarchy

```
MASTER (Level 4)
  └─→ Full system access
      ├─→ Can access all routes
      ├─→ User management
      ├─→ System configuration
      └─→ God mode features

ADMIN (Level 3)
  └─→ Institution management
      ├─→ Can access: /admin/*, /profesor/*, /parent/*
      ├─→ User creation
      ├─→ Meeting oversight
      └─→ Planning document review

PROFESOR (Level 2)
  └─→ Teacher functions
      ├─→ Can access: /profesor/*
      ├─→ Planning documents
      ├─→ Meeting management
      └─→ Student interactions

PARENT (Level 1)
  └─→ Guardian functions
      ├─→ Can access: /parent/*
      ├─→ Meeting requests
      ├─→ Student information
      └─→ Communication tools

PUBLIC (Level 0)
  └─→ Public access only
      ├─→ Can access: /, /centro-consejo
      ├─→ OAuth registration flow
      └─→ Limited features
```

**OAuth Restriction Logic:**

- `MASTER`, `ADMIN`, `PROFESOR` → **Credentials only** (email/password)
- `PARENT`, `PUBLIC` → **OAuth allowed** (Google)

---

## Security Features

### 1. Password Security

- **Hashing:** bcryptjs with 10 salt rounds
- **Storage:** Hashed passwords in Convex `users.password`
- **Validation:** Server-side only, never exposed to client

### 2. Session Security

- **Strategy:** JWT (stateless)
- **Storage:** Secure HTTP-only cookies
- **Expiry:** 24 hours with 1-hour refresh
- **Validation:** Middleware on every protected route

### 3. OAuth Security

- **Role Restriction:** Teachers/admins blocked from OAuth
- **Provider Linking:** Convex `accounts` table
- **Token Management:** Access/refresh tokens stored securely

### 4. Route Protection

- **Middleware Enforcement:** Edge runtime validation
- **Role-Based Access Control:** Fine-grained permissions
- **Security Headers:** OWASP recommended headers
- **Unauthorized Handling:** Graceful redirects

### 5. CSRF Protection

- Built-in via NextAuth.js
- CSRF token validation on mutations

---

## Environment Variables

### Required

```bash
# NextAuth
NEXTAUTH_URL=https://plataforma-astral.com
NEXTAUTH_SECRET=<32-char-secret>

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Optional (OAuth)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Development

```bash
NEXTAUTH_URL=http://localhost:3000
```

---

## Key Convex Operations

### Query Operations (Read)

```typescript
// Get user by email
const user = await client.query(api.users.getUserByEmail, {
  email: "user@example.com",
});

// Get user statistics
const stats = await client.query(api.users.getUserStats, {});

// Validate session
const session = await client.query(api.auth.getSessionByToken, {
  sessionToken: "...",
});
```

### Mutation Operations (Write)

```typescript
// Create user
const userId = await client.mutation(api.users.createUser, {
  email: "new@example.com",
  password: hashedPassword,
  role: "PARENT",
  name: "John Doe",
});

// Update user
await client.mutation(api.users.updateUser, {
  id: userId,
  isActive: false,
});

// Create session
const sessionId = await client.mutation(api.auth.createSession, {
  sessionToken: "...",
  userId: userId,
  expires: Date.now() + 86400000,
});
```

---

## Testing Strategy

### Test Users (Development Seed)

```typescript
{
  email: "admin@plataforma-astral.com",
  password: "admin123",
  role: "ADMIN"
},
{
  email: "profesor@plataforma-astral.com",
  password: "profesor123",
  role: "PROFESOR"
},
{
  email: "parent@plataforma-astral.com",
  password: "parent123",
  role: "PARENT"
}
```

### E2E Test Coverage

- ✅ Credentials login flow
- ✅ OAuth login flow (Google)
- ✅ Role-based route access
- ✅ Session persistence
- ✅ Logout functionality
- ✅ Middleware authorization
- ✅ Password validation
- ✅ Email verification

---

## Migration Notes

### From Prisma to Convex

- **Database:** PostgreSQL → Convex serverless
- **ORM:** Prisma Client → Convex queries/mutations
- **Auth:** Prisma adapter → Custom Convex adapter
- **Real-time:** Manual polling → Native subscriptions
- **Type Generation:** `prisma generate` → `npx convex dev`

### Backward Compatibility

- Services layer maintained for gradual migration
- API routes use Convex client directly
- Server Actions wrap Convex operations

---

## Common Issues & Solutions

### Issue 1: "Convex client not initialized"

**Cause:** Missing `NEXT_PUBLIC_CONVEX_URL`
**Solution:** Add to `.env.local` and restart dev server

### Issue 2: OAuth fails for admin users

**Cause:** Role restriction in `signIn()` callback
**Solution:** Admins must use credentials authentication

### Issue 3: Session expires too quickly

**Cause:** Default session config
**Solution:** Already configured to 24 hours with 1-hour refresh

### Issue 4: Middleware redirect loop

**Cause:** Invalid role in session
**Solution:** Check `jwt()` and `session()` callbacks are propagating role

---

## Development Commands

```bash
# Start Convex dev server (required for auth)
npx convex dev

# Start Next.js dev server
npm run dev

# View Convex dashboard (inspect users, sessions)
npx convex dashboard

# Deploy Convex to production
npx convex deploy --prod

# Build Next.js
npm run build

# Run tests
npm run test:all
```

---

## API Endpoints

### NextAuth Routes (Auto-generated)

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/:provider` - Provider sign in
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get session
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - List providers

### Custom Auth Routes

- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Session validation

---

## Conclusion

This authentication system provides:

- ✅ Secure credential-based authentication
- ✅ OAuth integration (Google) with role restrictions
- ✅ Role-based access control
- ✅ Convex serverless database integration
- ✅ JWT session management
- ✅ Middleware route protection
- ✅ Production-ready security features

**Next Steps:**

1. Enable additional OAuth providers (Facebook, GitHub)
2. Implement email verification flow
3. Add 2FA support
4. Implement password reset functionality
5. Add audit logging for authentication events

---

## References

- NextAuth.js v5 Docs: https://authjs.dev
- Convex Auth Pattern: https://stack.convex.dev/nextauth-adapter
- Convex Docs: https://docs.convex.dev
- Project Repo: `/mnt/Secondary/Projects/Websites/Astral/Plataforma`
