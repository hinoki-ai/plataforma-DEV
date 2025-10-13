# 🚀 Deployment Checklist - Plataforma Astral

## Pre-Deployment (Required)

- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run type-check` - TypeScript compilation succeeds
- [ ] `npm run build` - Build completes successfully
- [ ] `git clean -fd` - Remove untracked files
- [ ] `npx convex deploy -y` - Backend deploys successfully
- [ ] Test translations locally (Spanish text, not keys)

## Deployment Options

### Option 1: Standard (Automatic)
```bash
git add .
git commit -m "feat: [description]"
npx convex deploy -y
git push origin main
```

### Option 2: Manual (When Auto Fails)
```bash
npx vercel --prod --skip-domain
sleep 30
npx vercel alias set [new-url] plataforma.aramac.dev
```

## Post-Deployment Verification

- [ ] Site loads: `https://plataforma.aramac.dev`
- [ ] No 401 auth errors
- [ ] Health check: `curl https://plataforma.aramac.dev/api/health`
- [ ] Build updated: Check `build_[timestamp]` in HTML
- [ ] Translations work: See Spanish text, not `home.welcome.title`
- [ ] Login accessible
- [ ] Database connected

## Emergency Commands

```bash
# Check status
npx vercel ls | head -10

# Force deploy
npx vercel --prod --skip-domain

# Fix domain
npx vercel alias set [url] plataforma.aramac.dev

# Rollback
npx vercel rollback

# Verify
curl -s https://plataforma.aramac.dev/api/health
```

## Common Issues & Fixes

### ❌ 401 Authentication Error
```
npx vercel --prod --skip-domain
npx vercel alias set [new-url] plataforma.aramac.dev
```

### ❌ GitHub Webhook Didn't Trigger
```
npx vercel --prod
# OR
npx vercel --prod --skip-domain
npx vercel alias set [url] plataforma.aramac.dev
```

### ❌ Translations Show Keys Instead of Text
- Check i18n system was updated
- Verify `src/locales/` files exist
- Build should have been tested locally

### ❌ Build Fails
```
npm run lint && npm run type-check && npm run build
```

---

**REMEMBER**: Always test deployment manually if automatic fails. Never assume push = deployed.
