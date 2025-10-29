# Production Login Issue - Debug Guide

## Current Status

Users can log in but get stuck on the login page and can't access dashboards.

## Changes Made (Debugging)

I've enabled **production logging** in the authentication middleware to identify why session cookies aren't being detected.

### Files Modified

1. `src/lib/middleware-auth.ts` - Added production logging for:
   - Cookie detection
   - JWT verification
   - Error messages
2. `src/middleware.ts` - Enhanced logging for:
   - Session checks
   - Redirect decisions
3. `src/services/actions/auth.ts` - Fixed NEXT_REDIRECT handling

## Deployment Steps

### 1. Commit Changes

```bash
git add .
git commit -m "fix: add production logging for auth debugging + fix NEXT_REDIRECT"
git push origin main
```

### 2. Wait for Vercel Deployment

- Vercel will automatically deploy
- Wait for "✅ Deployment Complete" notification
- Should take 2-3 minutes

### 3. Test Login in Production

1. Open: `https://plataforma.aramac.dev/login`
2. Clear cookies/cache (Ctrl+Shift+Del)
3. Login with: `admin@plataforma-astral.com` / `admin123`
4. **Keep browser DevTools open** (F12)

### 4. Collect Logs

#### Browser Console (F12 → Console)

Look for:

```
🚪 authenticate() invoked
✅ authenticateUser succeeded
✅ NEXT_REDIRECT caught - re-throwing to allow redirect
```

#### Vercel Logs (Server Side)

1. Go to: https://vercel.com/hinoki-ai/plataforma/logs
2. Filter by "Function Logs"
3. Look for:
   - `[MIDDLEWARE-AUTH] Found session token`
   - `[MIDDLEWARE-AUTH] No session token found`
   - `[MIDDLEWARE-AUTH] JWT verified`
   - `[MIDDLEWARE] Session check`
   - `[MIDDLEWARE] Logged in user on auth page, redirecting`

## What We're Looking For

### Scenario 1: Session Cookie Not Found

**Logs show:**

```
❌ [MIDDLEWARE-AUTH] No session token found
availableCookies: "some-cookie, another-cookie"
triedCookieNames: "__Secure-next-auth.session-token, ..."
```

**Cause:** Session cookie name mismatch or not being set
**Fix:** Check NEXTAUTH_URL and NEXTAUTH_SECRET in Vercel env vars

### Scenario 2: JWT Verification Fails

**Logs show:**

```
❌ [MIDDLEWARE-AUTH] Middleware auth error
errorMessage: "signature verification failed"
```

**Cause:** NEXTAUTH_SECRET mismatch between cookie creation and validation
**Fix:** Regenerate NEXTAUTH_SECRET in Vercel

### Scenario 3: Session Incomplete

**Logs show:**

```
🔐 [MIDDLEWARE] Session check { isLoggedIn: true, hasRole: false }
⚠️ [MIDDLEWARE] Logged in but incomplete session
```

**Cause:** JWT callback not populating token correctly
**Fix:** Check NextAuth callbacks in `src/lib/auth.ts`

### Scenario 4: Cookie Found and Valid

**Logs show:**

```
🔑 [MIDDLEWARE-AUTH] Found session token in cookie
✅ [MIDDLEWARE-AUTH] JWT verified
👤 [MIDDLEWARE] Logged in user on auth page, redirecting
```

**Result:** Should work! User redirects to dashboard

## Environment Variables Check

### Required in Vercel

Go to: https://vercel.com/hinoki-ai/plataforma/settings/environment-variables

Ensure these are set:

```bash
NEXT_PUBLIC_CONVEX_URL=https://different-jackal-611.convex.cloud
NEXTAUTH_SECRET=<32-character-random-string>
NEXTAUTH_URL=https://plataforma.aramac.dev
NODE_ENV=production
```

### Generate New NEXTAUTH_SECRET (if needed)

```bash
openssl rand -base64 32
```

## Quick Fixes

### Fix 1: Regenerate NEXTAUTH_SECRET

1. Generate new secret: `openssl rand -base64 32`
2. Update in Vercel env vars
3. Redeploy
4. All users will need to log in again (this clears old sessions)

### Fix 2: Check NEXTAUTH_URL

Must match exactly: `https://plataforma.aramac.dev`

- No trailing slash
- Must be HTTPS
- Must match domain exactly

### Fix 3: Clear All Sessions

If cookies are mismatched:

1. Browser DevTools → Application → Cookies
2. Delete ALL cookies for `plataforma.aramac.dev`
3. Try login again

## After Collecting Logs

### Send Me This Info

1. **Browser console logs** (copy/paste or screenshot)
2. **Vercel function logs** for the login attempt
3. **Which scenario** matches (1, 2, 3, or 4)

### Common Issues & Solutions

| Log Message                        | Issue                  | Solution                            |
| ---------------------------------- | ---------------------- | ----------------------------------- |
| "No session token found"           | Cookie not set         | Check NEXTAUTH_SECRET, NEXTAUTH_URL |
| "signature verification failed"    | Secret mismatch        | Regenerate NEXTAUTH_SECRET          |
| "isLoggedIn: false"                | Session not created    | Check auth.ts callbacks             |
| "Logged in but incomplete session" | Missing user data      | Check JWT callback                  |
| Cookie found but no redirect       | Middleware logic issue | Check middleware.ts                 |

## Rollback Plan

If these changes break something:

```bash
git revert HEAD
git push origin main
```

## Next Steps After Debugging

1. Once we identify the issue from logs
2. Apply the appropriate fix
3. Remove debug logging (restore production-only minimal logs)
4. Deploy fixed version
5. Test thoroughly

## Contact

Share the logs and I'll help identify the exact issue and fix.
