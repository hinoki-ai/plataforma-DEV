# 🚀 Deployment Guide - Plataforma Astral

## Overview

This guide covers deployment for Plataforma Astral, built with Next.js 15 and Convex serverless backend. The recommended deployment platform is Vercel for optimal performance and simplicity.

## Architecture

| Component      | Service | Production URL                      |
| -------------- | ------- | ----------------------------------- |
| **Frontend**   | Vercel  | `your-domain.com`                   |
| **Backend**    | Convex  | `https://your-project.convex.cloud` |
| **Repository** | GitHub  | Your repository                     |

## Prerequisites

- **Node.js**: 18.17.0 or higher
- **Convex Account**: Free tier at [convex.dev](https://convex.dev)
- **Vercel Account**: Free tier at [vercel.com](https://vercel.com)
- **GitHub**: Repository connected

---

## Quick Deployment (5 Minutes)

### 1. Deploy Convex Backend

```bash
# Install dependencies
npm install

# Deploy Convex to production
npx convex deploy

# Save the deployment URL shown in terminal
# Example: https://your-project.convex.cloud
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables (see below)
4. Click "Deploy"

**Option B: Via CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts to add environment variables
```

### 3. Configure Environment Variables

Add these in Vercel dashboard (`Settings > Environment Variables`):

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXTAUTH_SECRET=your-32-character-secret-minimum
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id       # Optional
GOOGLE_CLIENT_SECRET=your-google-secret      # Optional
CLOUDINARY_URL=cloudinary://key:secret@name  # Optional
```

### 4. Verify Deployment

```bash
# Check deployment status
curl -I https://your-domain.vercel.app

# Check health endpoint
curl https://your-domain.vercel.app/api/health

# Expected response: {"status":"healthy","backend":"convex",...}
```

**That's it!** Your application is live. 🎉

---

## Environment Configuration

### Development (.env.local)

```env
# Convex
NEXT_PUBLIC_CONVEX_URL="https://dev-project.convex.cloud"

# Auth
NEXTAUTH_SECRET="development-secret-key-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Media (Optional)
CLOUDINARY_URL=""
```

### Production (Vercel Environment Variables)

Set these in Vercel dashboard:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL="https://prod-project.convex.cloud"

# Auth
NEXTAUTH_SECRET="production-secret-32-chars-minimum-secure"
NEXTAUTH_URL="https://your-production-domain.com"

# OAuth (Optional)
GOOGLE_CLIENT_ID="prod-google-client-id"
GOOGLE_CLIENT_SECRET="prod-google-client-secret"

# Media (Optional)
CLOUDINARY_URL="cloudinary://prod-key:prod-secret@prod-cloud"
```

---

## Convex Deployment Details

### Initial Setup

```bash
# First time setup
npx convex dev

# This will:
# - Authenticate with Convex
# - Create/select project
# - Generate types
# - Provide deployment URL
```

### Production Deployment

```bash
# Deploy schema and functions to production
npx convex deploy

# Deploy with confirmation bypass
npx convex deploy -y

# Check deployment status
npx convex dashboard
```

### Environment Management

Convex automatically manages:

- ✅ Database schema
- ✅ Function deployments
- ✅ Type generation
- ✅ Data persistence
- ✅ Backups

No migrations or manual database management needed!

---

## Vercel Deployment Details

### Automatic Deployments

Vercel automatically deploys on:

- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview deployments
- ✅ Pull requests → Preview deployments

### Build Configuration

Vercel auto-detects Next.js. No configuration needed.

**Vercel Settings** (optional customization):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Update `NEXTAUTH_URL` environment variable

---

## Deployment Workflow

### Development → Production

```bash
# 1. Local development
npm run dev                    # Next.js on localhost:3000
npx convex dev                 # Convex in dev mode

# 2. Test locally
npm run lint                   # Check code quality
npm run type-check             # Verify TypeScript
npm run test:unit              # Run tests (optional)

# 3. Commit changes
git add .
git commit -m "feat: your feature"

# 4. Deploy Convex backend
npx convex deploy

# 5. Deploy Next.js frontend
git push origin main           # Vercel auto-deploys

# 6. Verify
curl https://your-domain.com/api/health
```

---

## Database Management

### Seed Production Data

```bash
# Connect to production Convex
npx convex dashboard

# Or run seed script with production URL
CONVEX_DEPLOYMENT=prod npx tsx scripts/seed-convex.ts
```

### View Production Data

```bash
# Open Convex dashboard
npx convex dashboard

# Navigate to "Data" tab to view/edit records
```

### Backup Strategy

Convex provides automatic backups:

- Point-in-time recovery
- Automatic snapshots
- Export functionality via dashboard

---

## Monitoring & Troubleshooting

### Check Deployment Status

```bash
# Vercel deployments
npx vercel ls

# Convex deployments
npx convex dashboard

# View logs
npx vercel logs
```

### Common Issues

#### 1. "Convex client not initialized"

**Cause**: Missing `NEXT_PUBLIC_CONVEX_URL`

**Fix**:

```bash
# Check Vercel environment variables
npx vercel env ls

# Add if missing
npx vercel env add NEXT_PUBLIC_CONVEX_URL production

# Redeploy
git push origin main
```

#### 2. Authentication loop

**Cause**: Wrong `NEXTAUTH_URL`

**Fix**:

```bash
# Update NEXTAUTH_URL to match your domain
npx vercel env rm NEXTAUTH_URL production
npx vercel env add NEXTAUTH_URL production
# Enter: https://your-actual-domain.com

# Redeploy
git push origin main
```

#### 3. Build fails

**Cause**: TypeScript errors or missing dependencies

**Fix**:

```bash
# Test build locally
npm run build

# Fix errors, then commit and push
git commit -am "fix: build errors"
git push origin main
```

#### 4. 500 Server Errors

**Check**:

- Vercel function logs: `npx vercel logs`
- Convex dashboard errors
- Environment variables are set correctly

---

## Performance Optimization

### Automatic Optimizations

Vercel + Convex provide:

- ✅ Global CDN (Edge Network)
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Serverless functions
- ✅ Smart caching

### Manual Optimizations

```bash
# Analyze bundle size
npm run analyze

# Check Lighthouse scores
npm run test:performance
```

---

## Security Best Practices

### Before Deploying

- [ ] Never commit `.env` files
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable Vercel security headers
- [ ] Review `git diff` for secrets before pushing
- [ ] Use different secrets for dev/prod

### Vercel Security Features

Enable in Vercel dashboard:

- ✅ Automatic HTTPS
- ✅ DDoS protection
- ✅ Security headers
- ✅ Environment variable encryption

---

## Rollback Procedure

### Vercel Rollback

```bash
# List recent deployments
npx vercel ls

# Rollback to previous deployment
npx vercel rollback [deployment-url]

# Or use Vercel dashboard → Deployments → Promote to Production
```

### Convex Rollback

Convex doesn't support automatic rollback, but you can:

1. Revert code changes in git
2. Run `npx convex deploy` to deploy previous schema

---

## Cost Estimates

### Free Tier Limits

**Vercel Free**:

- 100 GB bandwidth/month
- Unlimited deployments
- Automatic SSL
- Preview deployments

**Convex Free**:

- 1 GB database storage
- 1M function calls/month
- Real-time subscriptions
- Automatic backups

### Production Estimates (100-500 users)

- **Vercel Pro**: $20/month
- **Convex**: Typically within free tier
- **Total**: ~$20/month

---

## Support Resources

### Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)

### Dashboards

- Vercel: [vercel.com](https://vercel.com)
- Convex: `npx convex dashboard`

### Project Docs

- `START_HERE.md` - Quick start
- `DOCUMENTATION_INDEX.md` - All docs
- `docs/TROUBLESHOOTING_AUTH.md` - Auth issues

---

## Quick Reference

```bash
# Development
npm run dev                     # Start Next.js dev server
npx convex dev                  # Start Convex dev server

# Quality checks
npm run lint                    # ESLint check
npm run type-check              # TypeScript check
npm run test:unit               # Unit tests

# Deployment
npx convex deploy               # Deploy Convex backend
git push origin main            # Deploy Next.js (Vercel auto-deploy)

# Monitoring
npx vercel logs                 # View Vercel logs
npx convex dashboard            # View Convex dashboard
curl https://domain.com/api/health  # Health check

# Troubleshooting
npx vercel env ls               # List environment variables
npx vercel ls                   # List deployments
npx vercel rollback             # Rollback deployment
```

---

**Remember**: Deploy Convex first (`npx convex deploy`), then push to GitHub for Vercel deployment.

Simple. Fast. Serverless. ✨
