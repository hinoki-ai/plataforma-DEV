# 🏗️ Branch Strategy - Plataforma Astral SaaS Platform

## Single-Branch Strategy

### ✅ Active Branch

#### `main` (Production Branch)

- **Purpose**: Production-ready SaaS platform code
- **Environment**: plataforma.aramac.dev (Production)
- **Deployment**: Automatic on push to GitHub → Vercel
- **Backend**: Convex (https://industrious-manatee-7.convex.cloud)
- **Workflow**: Develop locally, test thoroughly, push to production

### 🚫 Deprecated Branches (Deleted)

All other branches have been removed to simplify the workflow:
- ❌ `dev` - Development is done locally only
- ❌ `prod` - Merged into main
- ❌ `master` - Renamed to main
- ❌ `school.aramac.dev` - Deleted
- ❌ All feature branches - Deleted

### Why Single Branch?

- **Simplicity**: One branch = one source of truth
- **Less confusion**: No branch management overhead
- **Faster iteration**: Develop locally → test → push to production
- **Clean history**: Linear development timeline

## 🔄 Workflow

### Development Process

```bash
# 1. Pull latest changes
git checkout main
git pull origin main

# 2. Develop locally
npm run dev  # Test on localhost:3000
npx convex dev  # Keep Convex dev server running

# 3. Test thoroughly locally
npm run lint
npm run type-check
npm run test:unit

# 4. Commit and deploy
git add .
git commit -m "feat: add new feature"
git push origin main  # Triggers automatic deployment
```

### Deployment Flow

```
Local Development (localhost:3000)
          ↓
    Test Locally
          ↓
  Commit to main
          ↓
Push to GitHub (main branch)
          ↓
Convex Deploy (automatic)
          ↓
Vercel Deploy (automatic)
          ↓
Production (plataforma.aramac.dev)
```

## 🛡️ Branch Protection

### Automatic Checks

- Run `npm run check-branches` before any major operations
- Script will warn about deprecated branches
- Prevents accidental merges from old branches

### Manual Reviews Required

- All merges to `main` require review
- Check for:
  - Test coverage
  - Performance impact
  - Security considerations
  - Database migrations

## 📋 Environment Mapping

| Environment       | Location            | URL                      | Backend                                                |
| ----------------- | ------------------- | ------------------------ | ------------------------------------------------------ |
| **Development**   | Local Machine       | `localhost:3000`         | Convex Dev (local)                                     |
| **Production**    | Vercel              | `plataforma.aramac.dev`  | Convex Prod (industrious-manatee-7.convex.cloud)       |

## ⚠️ Important Rules

1. **All development happens locally** (localhost:3000)
2. **Test thoroughly before pushing** (lint, type-check, tests)
3. **Only push to main when ready for production**
4. **Keep Convex dev server running** during local development
5. **One branch = One source of truth**

## 🔧 Deployment Commands

```bash
# Local development
npm run dev              # Start Next.js dev server
npx convex dev          # Start Convex dev server

# Pre-deployment checks
npm run lint            # Check code quality
npm run type-check      # Check TypeScript
npm run test:unit       # Run tests

# Deploy to production
git add .
git commit -m "your message"
git push origin main    # Auto-deploys to plataforma.aramac.dev
```

## 📞 Contact

For questions about branch strategy:

- Development: <agustinaramac@gmail.com>
- Production: <inacorgan@gmail.com> (Adrina)
