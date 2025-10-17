# Clerk Frontend API Configuration Fix

## Problem

The application is experiencing CORS errors when trying to load Clerk's JavaScript:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at
https://clerk.plataforma.aramac.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js
```

## Root Cause

The Clerk Frontend API is configured to use a custom domain (`clerk.plataforma.aramac.dev`) that is not properly set up to serve Clerk's assets. This causes the Clerk SDK to try loading scripts from a domain that doesn't have the required files.

## Solution

You have two options:

### Option 1: Use Clerk's Default Domain (Recommended)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application: **Plataforma Astral**
3. Navigate to **API Keys** section
4. Under **Frontend API**, remove the custom domain setting
5. Use the default Clerk domain (e.g., `https://[your-app].clerk.accounts.dev`)
6. Copy the new **Publishable Key**
7. Update environment variables in Vercel:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   ```
8. Redeploy the application

### Option 2: Properly Configure Custom Domain

If you want to keep using `clerk.plataforma.aramac.dev`:

1. In Clerk Dashboard, go to **Domains**
2. Add `clerk.plataforma.aramac.dev` as a Frontend API domain
3. Follow Clerk's instructions to:
   - Add required DNS records (CNAME)
   - Wait for DNS propagation
   - Verify domain ownership
4. Once verified, Clerk will serve assets from that domain
5. No environment variable changes needed

## Verification

After fixing the configuration:

1. Clear browser cache
2. Visit https://plataforma.aramac.dev
3. Check browser console - there should be no CORS errors
4. Verify Clerk authentication loads correctly
5. Test sign-in functionality

## Current CSP Configuration

The Content-Security-Policy has been updated to support both scenarios:

- Default Clerk domains: `https://*.clerk.accounts.dev`
- Custom domain: `https://clerk.plataforma.aramac.dev`

## Related Files

- `src/components/providers.tsx` - ClerkProvider configuration
- `next.config.ts` - CSP headers
- `.env.production` - Clerk publishable key

## Technical Details

The publishable key embeds the Frontend API domain. When Clerk initializes, it extracts the domain from the key and attempts to load `clerk.browser.js` from:

- Custom domain: `https://[custom-domain]/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
- Default domain: `https://[app-slug].clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js`

If the domain isn't properly configured to serve these assets, CORS errors occur.
