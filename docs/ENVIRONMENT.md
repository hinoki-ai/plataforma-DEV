# 🔧 Environment Configuration Guide

## Overview

This guide covers environment variable configuration for Plataforma Astral across different environments.

## Environment Structure

```text
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

### Authentication (Clerk)

```bash
# Clerk Authentication (Production keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_FRONTEND_API_URL="https://clerk.your-domain.com"
```

**Setup Clerk**:

1. Sign up at [clerk.com](https://clerk.com)
2. Create application
3. Get API keys from Clerk dashboard
4. Configure webhook endpoints for user events

---

## Optional Environment Variables

### Media Upload (Cloudinary)

```bash
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

**Setup**:

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials from dashboard
3. Format: `cloudinary://KEY:SECRET@CLOUD_NAME`

### Cogníto AI Assistant (Optional)

```bash
# OpenAI API Key (for embeddings)
OPENAI_API_KEY="sk-..."

# Groq API Key (for fast LLM inference)
GROQ_API_KEY="gsk_..."
```

**Setup Cogníto AI Assistant**:

1. Sign up at [OpenAI](https://platform.openai.com) for embeddings
2. Get API key from OpenAI dashboard
3. Sign up at [Groq](https://groq.com) for fast LLM inference
4. Get API key from Groq dashboard
5. Add both keys to Convex Dashboard → Settings → Environment Variables

**Cogníto Features**:

- Ultra-fast responses using Groq-hosted Llama 3.1
- Vector search for contextual answers
- Read-only security (no data modifications)
- Spanish language support for Chilean users
- Enhanced educational platform guidance

---

## Environment Files

### .env.example (Template)

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
CLERK_WEBHOOK_SECRET=""
NEXT_PUBLIC_CLERK_FRONTEND_API_URL="https://clerk.your-domain.com"

# Email Service (Optional)
RESEND_API_KEY=""

# Media Upload (Optional)
CLOUDINARY_URL=""
```

### .env.local (Development)

```bash
# Convex Backend (Dev)
NEXT_PUBLIC_CONVEX_URL="https://dev-project.convex.cloud"
CONVEX_DEPLOYMENT="dev:your-project-name"

# Clerk Authentication (Dev)
# Uses keyless development keys automatically
# Uncomment below for production keys testing
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
# CLERK_SECRET_KEY="sk_live_..."
# CLERK_WEBHOOK_SECRET="whsec_..."
# NEXT_PUBLIC_CLERK_FRONTEND_API_URL="https://clerk.your-domain.com"

# Email Service (Dev)
RESEND_API_KEY=""

# Media (Optional - use dev account)
CLOUDINARY_URL="cloudinary://dev_key:dev_secret@dev_cloud"
```

### Production (Vercel Environment Variables)

Set these in Vercel dashboard → Settings → Environment Variables:

```bash
# Convex Backend (Production)
NEXT_PUBLIC_CONVEX_URL="https://prod-project.convex.cloud"

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_FRONTEND_API_URL="https://clerk.your-domain.com"

# Email Service (Production)
RESEND_API_KEY=""

# Media (Production account)
CLOUDINARY_URL="cloudinary://prod_key:prod_secret@prod_cloud"
```

---

## Configuration by Environment

| Variable                             | Local Development       | Production                | Required    |
| ------------------------------------ | ----------------------- | ------------------------- | ----------- |
| `NEXT_PUBLIC_CONVEX_URL`             | Dev Convex URL          | Production Convex URL     | ✅ Yes      |
| `CONVEX_DEPLOYMENT`                  | `dev:your-project-name` | N/A (managed by Convex)   | ✅ Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Keyless (auto)          | Production Clerk key      | ✅ Yes      |
| `CLERK_SECRET_KEY`                   | Keyless (auto)          | Production Clerk secret   | ✅ Yes      |
| `CLERK_WEBHOOK_SECRET`               | Keyless (auto)          | Production webhook secret | ⚪ Optional |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | Auto-configured         | Your Clerk domain         | ✅ Yes      |
| `RESEND_API_KEY`                     | Test key                | Production Resend key     | ⚪ Optional |
| `CLOUDINARY_URL`                     | Dev account             | Production account        | ⚪ Optional |

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

### Clerk Authentication Issues

**Cause**: Missing or incorrect Clerk configuration

**Fix**:

```bash
# Check Clerk configuration
npx clerk telemetry disable  # Optional: disable telemetry

# Verify keys in Clerk dashboard
# Ensure webhook URLs are configured for your domain

# For development, Clerk provides keyless authentication
# For production, ensure all Clerk keys are set in Vercel
```

### Convex Connection Issues

**Cause**: Wrong Convex URL or deployment mismatch

**Fix**:

```bash
# Check Convex deployment
npx convex dev --once

# Verify CONVEX_DEPLOYMENT matches your project
echo $CONVEX_DEPLOYMENT

# Update NEXT_PUBLIC_CONVEX_URL if deployment changed
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
- [ ] Set up Clerk application and get production keys
- [ ] Configure Clerk webhooks for your production domain
- [ ] Set up production Resend account (if using email)
- [ ] Set up production Cloudinary account (if using media upload)
- [ ] Add all environment variables to Vercel dashboard
- [ ] Test deployment and authentication flow
- [ ] Verify health endpoint

---

## Environment Variables Reference

### Complete List

```bash
# === REQUIRED ===

# Convex backend URL (public, safe to expose)
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# Convex deployment identifier
CONVEX_DEPLOYMENT="dev:your-project-name"

# Clerk Authentication (public key - safe to expose)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."

# Clerk Authentication (private - never expose)
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Clerk Frontend API URL
NEXT_PUBLIC_CLERK_FRONTEND_API_URL="https://clerk.your-domain.com"

# === OPTIONAL ===

# Email service
RESEND_API_KEY="re_..."

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
- **Clerk Documentation**: [clerk.com/docs](https://clerk.com/docs)
- **Clerk Next.js Guide**: [clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)

---

**Remember**: Always use different secrets for development and production. Never commit secrets to git.
