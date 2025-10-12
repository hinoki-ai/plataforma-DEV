# 🔧 Environment Configuration Guide

## Overview

This guide covers environment variable configuration for Plataforma Astral across different environments.

## Environment Structure

```
.env.example       # Template (committed to git)
.env.local         # Local development (gitignored)
.env.production    # Production reference (gitignored)
```

## Quick Start

### Local Development

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Start development
npm run dev
npx convex dev    # In separate terminal
```

---

## Required Environment Variables

### Convex Backend

```bash
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"
```

**How to get**:

1. Run `npx convex dev`
2. Authenticate and create/select project
3. Copy the URL shown in terminal

### Authentication

```bash
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"  # or your production domain
```

**Generate secret**:

```bash
openssl rand -base64 32
```

---

## Optional Environment Variables

### OAuth (Google Sign-in)

```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Setup**:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

### Media Upload (Cloudinary)

```bash
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

**Setup**:

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials from dashboard
3. Format: `cloudinary://KEY:SECRET@CLOUD_NAME`

---

## Environment Files

### .env.example (Template)

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# Authentication
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Media Upload (Optional)
CLOUDINARY_URL=""
```

### .env.local (Development)

```bash
# Convex Backend (Dev)
NEXT_PUBLIC_CONVEX_URL="https://dev-project.convex.cloud"

# Authentication (Dev)
NEXTAUTH_SECRET="development-secret-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional - use test credentials)
GOOGLE_CLIENT_ID="dev-google-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="dev-google-secret"

# Media (Optional - use dev account)
CLOUDINARY_URL="cloudinary://dev_key:dev_secret@dev_cloud"
```

### Production (Vercel Environment Variables)

Set these in Vercel dashboard → Settings → Environment Variables:

```bash
# Convex Backend (Production)
NEXT_PUBLIC_CONVEX_URL="https://prod-project.convex.cloud"

# Authentication (Production)
NEXTAUTH_SECRET="production-secret-minimum-32-chars-secure-random"
NEXTAUTH_URL="https://your-production-domain.com"

# OAuth (Production credentials)
GOOGLE_CLIENT_ID="prod-google-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="prod-google-secret"

# Media (Production account)
CLOUDINARY_URL="cloudinary://prod_key:prod_secret@prod_cloud"
```

---

## Configuration by Environment

| Variable                 | Local Development       | Production                | Required    |
| ------------------------ | ----------------------- | ------------------------- | ----------- |
| `NEXT_PUBLIC_CONVEX_URL` | Dev Convex URL          | Production Convex URL     | ✅ Yes      |
| `NEXTAUTH_SECRET`        | Dev secret (32+ chars)  | Secure secret (32+ chars) | ✅ Yes      |
| `NEXTAUTH_URL`           | `http://localhost:3000` | Your production domain    | ✅ Yes      |
| `GOOGLE_CLIENT_ID`       | Test credentials        | Production credentials    | ⚪ Optional |
| `GOOGLE_CLIENT_SECRET`   | Test secret             | Production secret         | ⚪ Optional |
| `CLOUDINARY_URL`         | Dev account             | Production account        | ⚪ Optional |

---

## Vercel Environment Variables

### Adding Variables

**Via Dashboard**:

1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add variable name and value
4. Select environment: Production / Preview / Development
5. Save

**Via CLI**:

```bash
# Add variable
npx vercel env add VARIABLE_NAME production

# List variables
npx vercel env ls

# Remove variable
npx vercel env rm VARIABLE_NAME production

# Pull variables locally (for reference)
npx vercel env pull .env.vercel
```

### Environment Scopes

- **Production**: Used for `main` branch deployments
- **Preview**: Used for PR/branch deployments
- **Development**: Used by `vercel dev` command

---

## Security Best Practices

### ✅ Do

- ✅ Use different secrets for dev/production
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use strong secrets (32+ characters)
- ✅ Store production secrets only in Vercel
- ✅ Rotate secrets regularly
- ✅ Use separate OAuth credentials per environment

### ❌ Don't

- ❌ Commit `.env.local` or `.env.production` to git
- ❌ Share secrets in chat/email
- ❌ Use production credentials in development
- ❌ Use weak or short secrets
- ❌ Hardcode secrets in code

---

## Troubleshooting

### "Convex client not initialized"

**Cause**: Missing or incorrect `NEXT_PUBLIC_CONVEX_URL`

**Fix**:

```bash
# Check .env.local
cat .env.local | grep CONVEX

# Should show: NEXT_PUBLIC_CONVEX_URL=https://...
# If missing, add it and restart dev server
```

### "Invalid NEXTAUTH_SECRET"

**Cause**: Secret too short or missing

**Fix**:

```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local
echo "NEXTAUTH_SECRET=<generated-secret>" >> .env.local

# Restart dev server
```

### Authentication loop

**Cause**: `NEXTAUTH_URL` doesn't match actual URL

**Fix**:

```bash
# Development
NEXTAUTH_URL=http://localhost:3000

# Production (must match your domain exactly)
NEXTAUTH_URL=https://your-actual-domain.com

# No trailing slash!
```

### Environment variables not updating

**Fix**:

```bash
# Restart Next.js dev server
# Ctrl+C, then npm run dev

# For Vercel, redeploy
git commit --allow-empty -m "redeploy"
git push origin main
```

---

## Verification

### Check Local Configuration

```bash
# Verify environment variables are loaded
npm run env:status

# Or manually check
node -e "console.log(process.env.NEXT_PUBLIC_CONVEX_URL)"
```

### Check Production Configuration

```bash
# List Vercel environment variables
npx vercel env ls

# Test production endpoints
curl https://your-domain.com/api/health

# Expected: {"status":"healthy","backend":"convex",...}
```

---

## Migration Checklist

Moving from development to production:

- [ ] Deploy Convex to production (`npx convex deploy`)
- [ ] Get production Convex URL
- [ ] Generate secure `NEXTAUTH_SECRET` (32+ chars)
- [ ] Set production `NEXTAUTH_URL` (your domain)
- [ ] Configure production OAuth credentials (if using)
- [ ] Set up production Cloudinary account (if using)
- [ ] Add all variables to Vercel
- [ ] Test deployment
- [ ] Verify health endpoint

---

## Environment Variables Reference

### Complete List

```bash
# === REQUIRED ===

# Convex backend URL (public, safe to expose)
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# Auth secret (private, never expose)
NEXTAUTH_SECRET="minimum-32-characters-random-string"

# Auth callback URL (must match deployment URL)
NEXTAUTH_URL="http://localhost:3000"  # or production domain

# === OPTIONAL ===

# Google OAuth
GOOGLE_CLIENT_ID="your-app.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# Cloudinary media upload
CLOUDINARY_URL="cloudinary://key:secret@cloud"

# === DEVELOPMENT ONLY ===

# Override NODE_ENV if needed (usually auto-detected)
NODE_ENV="development"  # or "production"

# Enable debug logging (optional)
DEBUG="*"
NEXTAUTH_DEBUG="true"
```

---

## Quick Reference

```bash
# Generate secret
openssl rand -base64 32

# Check local env
cat .env.local

# Pull Vercel env (for reference)
npx vercel env pull

# Add Vercel env variable
npx vercel env add VAR_NAME production

# Test health endpoint
curl http://localhost:3000/api/health

# View Convex dashboard
npx convex dashboard
```

---

## Additional Resources

- **Next.js Env Vars**: [nextjs.org/docs/basic-features/environment-variables](https://nextjs.org/docs/basic-features/environment-variables)
- **Vercel Env Vars**: [vercel.com/docs/environment-variables](https://vercel.com/docs/environment-variables)
- **Convex Deployment**: [docs.convex.dev/production/hosting](https://docs.convex.dev/production/hosting)
- **NextAuth Config**: [next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)

---

**Remember**: Always use different secrets for development and production. Never commit secrets to git.
