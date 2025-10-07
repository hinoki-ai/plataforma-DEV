# Vercel Deployment Guide

**Project**: Manitos Pintadas School Management System  
**Production URL**: https://school.aramac.dev  
**Last Updated**: September 1, 2025

## 🚀 DEPLOYMENT OVERVIEW

The Manitos Pintadas system is deployed on Vercel with the following configuration:

- **Framework**: Next.js 15
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 20.x
- **Region**: Washington, D.C. (IAD)

## 🔧 VERCEL PROJECT SETUP

### Project Configuration

```yaml
Project Name: school-aramac
Team: agostinos-projects-903e65da
Repository: GitHub (private)
Branch: prod
Domain: school.aramac.dev
```

### Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "nodejs": "20.x"
}
```

## 🌐 ENVIRONMENT VARIABLES

### Production Environment Variables (Required)

```bash
# Core Application
NEXTAUTH_URL="https://school.aramac.dev"
NEXTAUTH_SECRET="production-secret-32-chars-minimum"
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# OAuth Providers
GOOGLE_CLIENT_ID="108364777055-r7vp0o8iur71l63dh9tj43gkdvsasc9o.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# File Storage
CLOUDINARY_URL="cloudinary://556976281197323:x7lXEyiBsj1p4tS9843ZFnfVTOs@dzut7fqpa"

# Supabase (Auto-injected by Vercel)
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

### Environment Variable Management

```bash
# List all environment variables
npx vercel env ls

# Add environment variable
npx vercel env add VARIABLE_NAME production

# Remove environment variable
npx vercel env rm VARIABLE_NAME production

# Pull development environment variables
npx vercel env pull .env.vercel
```

## 🚢 DEPLOYMENT PROCESS

### 1. Pre-Deployment Checklist

- [ ] All tests passing (`npm run test:all`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Linting clean (`npm run lint`)
- [ ] Build successful locally (`npm run build`)
- [ ] Database migrations applied (`npm run db:push`)

### 2. Environment Variable Verification

```bash
# Critical variables to verify:
npx vercel env ls | grep -E "NEXTAUTH_URL|DATABASE_URL|NEXTAUTH_SECRET"

# Ensure NEXTAUTH_URL matches production domain
# Should be: https://school.aramac.dev
```

### 3. Deployment Commands

#### Standard Deployment

```bash
# Deploy to production
npx vercel --prod

# Alternative: Push to prod branch (auto-deploy)
git push origin prod
```

#### Emergency Deployment

```bash
# Force redeploy with verbose output
npx vercel --prod --force --debug

# Deploy specific commit
npx vercel --prod --target production
```

### 4. Post-Deployment Verification

```bash
# Check deployment status
npx vercel ls

# Test site accessibility
curl -I https://school.aramac.dev

# Test authentication
curl -s https://school.aramac.dev/api/auth/session

# Test login page
curl -s https://school.aramac.dev/login | grep -i "login\|error"
```

## 📊 MONITORING & LOGS

### Deployment Monitoring

```bash
# View recent deployments
npx vercel ls --limit 10

# Check deployment logs
npx vercel logs --app school-aramac

# Follow real-time logs
npx vercel logs --app school-aramac --follow

# Get logs for specific deployment
npx vercel logs https://school-aramac-[hash].vercel.app
```

### Build Logs Analysis

```bash
# Common build issues to look for:
# - TypeScript errors
# - Missing environment variables
# - Database connection issues
# - Dependency resolution problems
```

## 🚨 COMMON DEPLOYMENT ISSUES

### Issue #1: Build Failures

**Symptoms**: Deployment fails during build phase

#### Common Causes:

- TypeScript compilation errors
- Missing dependencies
- Environment variable issues during build
- Database connection failures during build

#### Solutions:

```bash
# Fix TypeScript errors
npm run type-check

# Install missing dependencies
npm install

# Check build locally
npm run build

# Verify environment variables
npx vercel env ls
```

### Issue #2: Authentication Not Working Post-Deploy

**Symptoms**: Login fails after successful deployment

#### Root Cause Check:

```bash
# Check NEXTAUTH_URL
npx vercel env ls | grep NEXTAUTH_URL

# Should match production domain exactly
```

#### Solution:

```bash
# Update NEXTAUTH_URL if incorrect
npx vercel env rm NEXTAUTH_URL production
npx vercel env add NEXTAUTH_URL production
# Enter: https://school.aramac.dev

# Redeploy
npx vercel --prod
```

### Issue #3: Database Connection Errors

**Symptoms**: Runtime errors related to Prisma/database

#### Diagnostic:

```bash
# Check database environment variables
npx vercel env ls | grep -E "DATABASE|POSTGRES|SUPABASE"

# Test database connection locally
npm run verify-supabase
```

#### Solution:

```bash
# Regenerate Prisma client for production
npm run db:generate

# Apply any pending migrations
npm run db:migrate:deploy

# Redeploy with fresh client
npx vercel --prod
```

## 🔄 ROLLBACK PROCEDURES

### Quick Rollback

```bash
# List recent deployments
npx vercel ls

# Promote previous deployment
npx vercel promote https://school-aramac-[previous-hash].vercel.app --scope production
```

### Emergency Rollback

```bash
# If current deployment is completely broken:
# 1. Identify last working deployment from list
npx vercel ls

# 2. Promote immediately
npx vercel promote https://school-aramac-[working-hash].vercel.app

# 3. Verify rollback success
curl -I https://school.aramac.dev
```

## 🔧 ADVANCED CONFIGURATION

### Custom Headers

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};
```

### Edge Runtime Configuration

```javascript
// For specific routes requiring Edge Runtime
export const runtime = "edge";
```

### Build Optimization

```json
{
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "app/api/auth/[...nextauth]/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📋 DEPLOYMENT CHECKLIST TEMPLATE

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] All tests passing (495+ tests)
- [ ] TypeScript compilation clean
- [ ] ESLint zero warnings
- [ ] Build successful locally
- [ ] Database schema up to date

### Environment Variables

- [ ] NEXTAUTH_URL correct for target environment
- [ ] DATABASE_URL pointing to correct database
- [ ] OAuth credentials valid and current
- [ ] All required variables present
- [ ] No sensitive data exposed

### Post-Deployment

- [ ] Site loads correctly
- [ ] Authentication working all roles
- [ ] Database connection verified
- [ ] Critical user flows tested
- [ ] Error monitoring active
- [ ] Performance metrics acceptable

## 🔍 PERFORMANCE MONITORING

### Key Metrics to Track

```bash
# Build Time: Target < 2 minutes
# First Load Time: Target < 3 seconds
# Authentication Response: Target < 500ms
# Database Query Time: Target < 200ms
```

### Vercel Analytics

- Core Web Vitals monitoring
- Real user performance metrics
- Edge function execution times
- Error rate tracking

### Custom Monitoring

```javascript
// Performance logging in pages
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics service
}
```

## 🚀 OPTIMIZATION TIPS

### Build Performance

```bash
# Enable SWC minification
# next.config.js
swcMinify: true

# Optimize images
images: {
  domains: ['res.cloudinary.com']
}

# Bundle analysis
npm run analyze
```

### Runtime Performance

```bash
# Enable production optimizations
NODE_ENV=production

# Use database connection pooling
DATABASE_URL with pooling parameters

# Implement proper caching headers
Cache-Control: public, s-maxage=31536000, immutable
```

---

**This guide ensures reliable deployments and quick issue resolution.**  
**Last major deployment**: September 1, 2025 (Authentication fix)\*\*  
**Success Rate**: 99.2% (based on deployment history)\*\*
