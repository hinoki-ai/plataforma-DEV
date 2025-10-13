# 🚀 Deployment Guide - Plataforma Astral

## 🎯 Single-Branch Deployment Strategy

**Simple approach**: One branch (`main`), automatic deployments to production.

```text
localhost:3000 → test → commit → push main → plataforma.aramac.dev
```

## 🏗️ Architecture

| Component      | Service | URL/Endpoint                                 |
| -------------- | ------- | -------------------------------------------- |
| **Frontend**   | Vercel  | `plataforma.aramac.dev`                      |
| **Backend**    | Convex  | `https://industrious-manatee-7.convex.cloud` |
| **Repository** | GitHub  | `github.com/hinoki-ai/plataforma-DEV`        |

## 🚀 Deployment Procedures

### 1. Local Development

```bash
# Start development servers
npm run dev              # Next.js (localhost:3000)
npx convex dev          # Convex backend (watch mode)
```

### 2. Pre-Deployment Checks

```bash
# Quality checks (all must pass)
npm run lint            # ESLint check
npm run type-check      # TypeScript validation
npm run build          # Build test (critical for i18n and other issues)

# Clean up any leftover files that might interfere
git clean -fd           # Remove untracked files/directories
```

### 3. Standard Deployment (Automatic)

```bash
# Commit your changes
git add .
git commit -m "feat: your feature description"

# Deploy Convex backend first
npx convex deploy -y

# Push to trigger Vercel deployment
git push origin main
```

### 4. Manual Deployment (When Automatic Fails)

**⚠️ CRITICAL**: GitHub webhooks can be delayed or fail. Always have manual deployment ready.

```bash
# Method 1: Force redeploy existing
npx vercel --prod

# Method 2: Skip domain assignment, then manually assign
npx vercel --prod --skip-domain
# Wait for build to complete, then:
npx vercel alias set https://plataforma-aramac-[hash].vercel.app plataforma.aramac.dev
```

### 5. Emergency Deployment (When Vercel Protection Blocks Access)

**Problem**: New deployments may get automatic Vercel authentication protection (401 errors)

```bash
# Deploy without automatic domain assignment
npx vercel --prod --skip-domain

# Find the new deployment URL
npx vercel ls | head -15

# Manually assign domain to unprotected deployment
npx vercel alias set https://plataforma-aramac-[new-hash].vercel.app plataforma.aramac.dev
```

## 📋 Environment Variables

### Required (Production)

```bash
# Authentication
NEXTAUTH_URL=https://plataforma.aramac.dev
NEXTAUTH_SECRET=your-32-character-secret

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://industrious-manatee-7.convex.cloud
CONVEX_DEPLOY_KEY=your-convex-deploy-key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Local Development

```bash
# Create .env.local file
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret
NEXT_PUBLIC_CONVEX_URL=your-convex-dev-url
```

## 🔍 Verify Deployment

### Check Deployment Status

```bash
# Vercel deployments (shows all deployments with status)
npx vercel ls

# Check if domain is pointing to latest deployment
npx vercel alias ls

# Convex deployment status
npx convex dashboard
```

### Health Checks

```bash
# Frontend health (should return healthy status)
curl -s https://plataforma.aramac.dev/api/health

# Check if site is live and accessible
curl -I https://plataforma.aramac.dev

# Verify build number has updated
curl -s https://plataforma.aramac.dev | grep -o "build_[0-9]*"

# Test translations are working (should show Spanish text, not keys)
curl -s https://plataforma.aramac.dev | grep -E "(Bienvenidas|Nuestra Misión)"
```

### Post-Deployment Verification Checklist

- [ ] Site loads without 401/403 errors
- [ ] Health endpoint returns `{"status":"healthy","database":"connected","backend":"convex"}`
- [ ] Build number has updated (check HTML for `build_[timestamp]`)
- [ ] Translations display in Spanish (not `home.welcome.title` keys)
- [ ] Login page accessible
- [ ] No console errors in browser dev tools
- [ ] Mobile responsive design works
- [ ] All major pages load (admin, profesor, parent, etc.)

## 🛡️ Branch Management

### Only One Branch Exists

- ✅ **main** - Production branch
- ❌ No `dev` branch (develop locally only)
- ❌ No feature branches (unless absolutely necessary)

### Clean Up Old Branches (If Needed)

```bash
# List all branches
git branch -a

# Delete local branches
git branch -D branch-name

# Delete remote branches (be careful!)
git push origin --delete branch-name
```

## 🔄 Deployment Pipeline

```text
┌─────────────────┐
│ Local Machine   │
│  localhost:3000 │
└────────┬────────┘
         │
         │ git commit
         ▼
┌─────────────────┐
│   GitHub        │
│   main branch   │
└────────┬────────┘
         │
         │ webhook
         ├─────────────────┬────────────────┐
         ▼                 ▼                ▼
┌─────────────┐   ┌─────────────┐  ┌──────────────┐
│   Convex    │   │   Vercel    │  │  Run Checks  │
│   Deploy    │   │   Build     │  │  (if config) │
└─────────────┘   └─────────────┘  └──────────────┘
         │                 │
         └────────┬────────┘
                  ▼
        ┌──────────────────┐
        │   PRODUCTION     │
        │ aramac.dev       │
        └──────────────────┘
```

## 🚨 Troubleshooting

### 1. GitHub Webhook Delay/Failure

**Problem**: `git push origin main` doesn't trigger Vercel deployment automatically.

**Symptoms**: No new deployment appears after push, old version still live.

**Solutions**:
```bash
# Force manual deployment
npx vercel --prod

# Or deploy without domain assignment, then manually assign
npx vercel --prod --skip-domain
sleep 30  # Wait for build
npx vercel alias set https://plataforma-aramac-[hash].vercel.app plataforma.aramac.dev
```

### 2. Vercel Authentication Protection (401 Errors)

**Problem**: New deployments return 401 "Authentication Required" errors.

**Symptoms**: Site shows Vercel login page instead of your app.

**Solutions**:
```bash
# Deploy without automatic domain assignment
npx vercel --prod --skip-domain

# Find the new deployment URL
npx vercel ls | grep "Ready" | head -1

# Manually assign domain to unprotected deployment
npx vercel alias set [new-deployment-url] plataforma.aramac.dev
```

### 3. i18n Translations Not Working (Shows Keys Instead of Text)

**Problem**: Site displays `home.welcome.title` instead of "Bienvenidas y bienvenidos...".

**Symptoms**: All text shows as translation keys, not actual Spanish text.

**Root Cause**: Complex chunked i18n system fails in production builds.

**Solutions**:
- The i18n system has been simplified to use direct synchronous lookups
- If issue persists, check that `src/locales/` files exist and are properly formatted
- Verify build completes without i18n-related errors

### 4. Build Fails

**Problem**: Deployment fails during build phase.

**Symptoms**: Vercel shows "Build Failed" status.

**Solutions**:
```bash
# Test build locally first
npm run lint
npm run type-check
npm run build

# Clean and rebuild if needed
rm -rf .next node_modules
npm install
npm run build

# Check for missing dependencies or circular imports
npm ls --depth=0
```

### 5. Domain Not Updating

**Problem**: Domain still points to old deployment.

**Symptoms**: Site shows old content despite new deployment being "Ready".

**Solutions**:
```bash
# Check current alias assignment
npx vercel alias ls

# Force domain reassignment
npx vercel alias set [latest-ready-deployment-url] plataforma.aramac.dev

# Verify domain is updated
curl -I https://plataforma.aramac.dev
```

### 6. Convex Connection Issues

**Problem**: Backend database connections fail.

**Symptoms**: API calls return errors, health check shows `"database": "disconnected"`.

**Solutions**:
```bash
# Check Convex status
npx convex dashboard

# Redeploy Convex functions
npx convex deploy -y

# Verify environment variables
echo $NEXT_PUBLIC_CONVEX_URL
echo $CONVEX_DEPLOY_KEY

# Check Convex logs
npx convex logs
```

### 7. Environment Variable Issues

**Problem**: Missing or incorrect environment variables.

**Symptoms**: Authentication fails, API calls error out.

**Solutions**:
```bash
# Check Vercel environment variables
npx vercel env ls

# Pull environment variables locally for debugging
npx vercel env pull .env.local

# Required variables:
# NEXTAUTH_URL=https://plataforma.aramac.dev
# NEXTAUTH_SECRET=[32-char-secret]
# NEXT_PUBLIC_CONVEX_URL=https://industrious-manatee-7.convex.cloud
# CONVEX_DEPLOY_KEY=[deploy-key]
```

### 8. Untracked Files Interfering

**Problem**: Leftover files cause deployment issues.

**Symptoms**: Build fails with unexpected errors.

**Solutions**:
```bash
# Clean untracked files before deployment
git clean -fd  # Remove untracked files/directories
git status     # Verify clean state

# If needed, clean more aggressively
git clean -xfd  # Remove ignored files too (be careful!)
```

### 9. Emergency Rollback

**Problem**: New deployment breaks critical functionality.

**Solutions**:
```bash
# Rollback to previous deployment
npx vercel rollback

# Or manually reassign domain to previous deployment
npx vercel ls  # Find previous working deployment
npx vercel alias set [previous-url] plataforma.aramac.dev
```

## 📊 Post-Deployment Checklist

After deployment, verify:

- [ ] Site is accessible: `https://plataforma.aramac.dev`
- [ ] Login works
- [ ] Database connections work (Convex)
- [ ] No console errors
- [ ] Performance is acceptable (Lighthouse)

## 🔐 Security

### Before Pushing to Production

1. **Never commit secrets** (use environment variables)
2. **Review changes** (`git diff --cached`)
3. **Check for sensitive data** in logs or files
4. **Test authentication** locally first

### Environment Variables Best Practices

- Store secrets in Vercel dashboard
- Use different secrets for local/production
- Never commit `.env` files to git
- Rotate secrets regularly

## 📚 Additional Commands

```bash
# View deployment logs
npx vercel logs

# Rollback deployment (if needed)
npx vercel rollback

# Open Vercel dashboard
npx vercel

# Open Convex dashboard
npx convex dashboard

# Check current deployment URL
npx vercel ls | head -n 5
```

## 🎯 Critical Best Practices

### Deployment Safety
1. **Always test locally first** - Run `npm run build` before pushing
2. **Small commits** - Deploy small, incremental changes to minimize rollback risk
3. **Have manual deployment ready** - GitHub webhooks can fail - know the manual commands
4. **Monitor deployments actively** - Don't assume push = deployed
5. **Keep multiple deployment methods** - Always have fallback options

### Pre-Deployment Checklist
- [ ] All linting passes (`npm run lint`)
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Convex backend deploys without errors (`npx convex deploy -y`)
- [ ] No untracked files that might interfere (`git clean -fd`)
- [ ] Environment variables are set correctly
- [ ] Translations working locally (not showing keys)

### Post-Deployment Verification
- [ ] Site loads without authentication prompts
- [ ] Health check returns healthy status
- [ ] Build number updated in HTML
- [ ] Translations display properly (Spanish text, not keys)
- [ ] Login functionality works
- [ ] Database connections active
- [ ] No console errors in production

### Emergency Procedures
1. **If deployment fails**: Use manual deployment commands
2. **If site shows 401**: Redeploy with `--skip-domain` and manually assign alias
3. **If translations broken**: Check i18n system was properly updated
4. **If database issues**: Redeploy Convex backend
5. **If critical failure**: Use rollback commands immediately

### Maintenance
- **Keep dependencies updated** - Run `npm audit` regularly
- **Monitor Vercel/Convex dashboards** - Check for errors proactively
- **Test deployments regularly** - Don't wait for issues to test deployment process
- **Document all changes** - Update this guide when new issues arise

## 🔧 i18n System Architecture

### Current Implementation
- **Framework**: Custom chunked i18n system with Divine Parsing Oracle
- **Files**: Located in `src/locales/{es,en}/*.json`
- **Provider**: `ChunkedLanguageProvider.tsx` with synchronous fallbacks
- **Hook**: `useLanguage()` for component access
- **Translation Function**: `t(key, namespace)` - direct synchronous lookups

### Critical Notes
- **DO NOT** use complex async loading in production
- **ALWAYS** test translations locally before deployment
- **VERIFY** Spanish text displays (not `home.welcome.title` keys)
- If translations break, the system falls back to key display

## 📞 Support & Emergency Contacts

- **GitHub Issues**: Report bugs and request features
- **Vercel Dashboard**: Monitor deployment status (`npx vercel`)
- **Convex Dashboard**: Monitor backend status (`npx convex dashboard`)
- **Emergency**: If site is completely down, use rollback procedures immediately

## 🚨 Critical Deployment Commands (Keep These Handy)

```bash
# Emergency deployment (when GitHub webhooks fail)
npx vercel --prod --skip-domain
sleep 30
npx vercel alias set [new-url] plataforma.aramac.dev

# Check deployment status
npx vercel ls | head -10

# Verify working deployment
curl -s https://plataforma.aramac.dev/api/health
curl -s https://plataforma.aramac.dev | grep -E "(Bienvenidas|build_)"

# Rollback if needed
npx vercel rollback
```

---

**CRITICAL REMINDER**: GitHub webhooks are unreliable. Always have manual deployment commands ready. Test deployments don't assume success - verify with health checks and visual inspection.
