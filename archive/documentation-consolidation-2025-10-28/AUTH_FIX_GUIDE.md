# Authentication Fix Guide

## Problem

Users were getting trapped in a redirect loop between `/login` and `/login` (or back to sign-in page), unable to access the dashboard after entering credentials.

## Root Cause

The `authenticate()` server action was catching the `NEXT_REDIRECT` error thrown by NextAuth's `signIn()` function but not re-throwing it properly. Next.js uses thrown errors for redirects, and when this error was caught without being re-thrown correctly, the redirect never completed, leaving users stuck on the login page.

## Fixes Applied

### 1. Fixed `authenticate()` Server Action (`src/services/actions/auth.ts`)

**Changed**: Proper handling of `NEXT_REDIRECT` errors to allow them to propagate

- Added explicit check for `NEXT_REDIRECT` errors
- Immediately re-throw redirect errors without catching them
- Only catch actual authentication errors (AuthError)
- Return error response for unexpected errors instead of throwing

### 2. Enhanced Debugging (`src/app/auth-success/page.tsx`)

**Added**: Enhanced logging with timestamps and detailed session info

- More descriptive log messages with `[AUTH-SUCCESS]` prefix
- Detailed field validation logging
- Timestamps for all log messages

### 3. Created Diagnostic Script (`scripts/debug-auth-flow.mjs`)

**Added**: Comprehensive authentication flow diagnostic tool

- Tests Convex connection
- Verifies user records in database
- Checks environment configuration
- Explains expected auth flow
- Provides troubleshooting recommendations

## Testing the Fix

### Step 1: Restart Development Server

```bash
# Stop current dev server (Ctrl+C)

# Start fresh
npm run dev
```

### Step 2: Clear Browser State

1. Open DevTools (F12)
2. Go to **Application** tab
3. Clear all cookies for `localhost:3000`
4. Clear Local Storage
5. Close DevTools

### Step 3: Test Login

1. Navigate to: `http://localhost:3000/login`
2. Use test credentials:
   - **Admin**: admin@plataforma-astral.com / admin123
   - **Master**: master@plataforma-astral.com / master123
   - **Profesor**: profesor@plataforma-astral.com / profesor123
   - **Parent**: parent@plataforma-astral.com / parent123

3. Submit the form

### Step 4: Monitor Logs

**Browser Console** (F12 → Console tab) should show:

```
🚪 authenticate() invoked
✅ authenticateUser succeeded
✅ NEXT_REDIRECT caught - re-throwing to allow redirect
```

**Server Terminal** should show:

```
🔐 [AUTH-SUCCESS] Session Check: { hasSession: true, role: 'ADMIN', ... }
✅ [AUTH-SUCCESS] Redirecting authenticated ADMIN to /admin
```

### Step 5: Verify Success

You should be redirected to your role-based dashboard:

- ADMIN → `/admin`
- MASTER → `/master`
- PROFESOR → `/profesor`
- PARENT → `/parent`

## If Still Not Working

### Check 1: Session Cookie

1. Open DevTools → Application → Cookies
2. Look for: `next-auth.session-token` (development)
3. If cookie is NOT present after login, there's a session creation issue

### Check 2: Run Diagnostic

```bash
node scripts/debug-auth-flow.mjs
```

This will verify:

- ✅ Convex connection
- ✅ User records exist
- ✅ Environment variables
- ✅ Configuration is correct

### Check 3: Server Logs

Watch for these errors:

- `❌ authenticateUser returned null` → Wrong credentials
- `❌ [AUTH-SUCCESS] No session found` → Session not created
- `❌ Session missing required fields` → JWT/session callback issue

### Check 4: Middleware Logs

Look for:

- `🛡️ Middleware entry` → Middleware is running
- `🔐 Middleware session check` → Session validation
- `🚨 Auth required but user not logged in` → Session cookie missing

## Common Issues & Solutions

| Issue                           | Cause                         | Solution                          |
| ------------------------------- | ----------------------------- | --------------------------------- |
| Redirect loop /login → /login   | NEXT_REDIRECT not re-thrown   | ✅ Fixed in this PR               |
| No session cookie               | NEXTAUTH_SECRET missing/wrong | Check `.env.local`                |
| "Session expired" immediately   | Time sync issue               | Sync system clock                 |
| JWT validation fails            | Wrong NEXTAUTH_SECRET         | Regenerate secret                 |
| Middleware blocks /auth-success | Middleware misconfigured      | ✅ Already excluded in middleware |

## Environment Checklist

Ensure these are set in `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://different-jackal-611.convex.cloud
NEXTAUTH_SECRET=<your-32-character-secret>
NEXTAUTH_URL=http://localhost:3000
```

## Technical Details

### Authentication Flow

1. User submits form → `authenticate()` server action
2. `authenticateUser()` validates credentials with Convex
3. `signIn("credentials", { redirect: true, redirectTo: "/auth-success" })`
4. NextAuth throws `NEXT_REDIRECT` error (normal behavior)
5. Error is re-thrown to allow redirect
6. Browser redirects to `/auth-success`
7. Server-side session check in `/auth-success/page.tsx`
8. Redirect to role-based dashboard
9. Middleware validates session and allows access

### Why NEXT_REDIRECT Must Be Re-thrown

Next.js uses thrown errors for redirects to:

- Work in Server Components
- Work in Server Actions
- Maintain type safety
- Avoid return value conflicts

When `signIn()` calls `redirect()` internally, it throws `NEXT_REDIRECT`. If this error is caught and NOT re-thrown, the redirect never happens, and the user stays on the same page.

## Support

If issues persist after following this guide:

1. Run `node scripts/debug-auth-flow.mjs`
2. Check all logs (browser + server)
3. Verify environment variables
4. Check Convex dashboard: `npx convex dashboard`
5. Test with a fresh incognito window

## Success Criteria

✅ User can log in with valid credentials
✅ User is redirected to role-based dashboard
✅ Session cookie is set
✅ No redirect loops
✅ Middleware allows access to protected routes
✅ Logout works correctly
