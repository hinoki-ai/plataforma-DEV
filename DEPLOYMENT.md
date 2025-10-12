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

## 🚀 Quick Deployment

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
npm run test:unit       # Unit tests (optional but recommended)
```

### 3. Deploy to Production

```bash
# Commit your changes
git add .
git commit -m "feat: your feature description"

# Deploy Convex backend
npx convex deploy -y

# Push to trigger Vercel deployment
git push origin main
```

**That's it!** GitHub push triggers automatic Vercel deployment.

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
# Vercel deployments
npx vercel ls

# Convex deployment status
npx convex dashboard
```

### Health Checks

```bash
# Frontend health
curl https://plataforma.aramac.dev/api/health

# Check if site is live
curl -I https://plataforma.aramac.dev
```

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

### Deployment Fails

```bash
# Check build logs on Vercel dashboard
# Or check locally
npm run build

# Common fixes
rm -rf .next node_modules
npm install
npm run build
```

### Convex Connection Issues

```bash
# Check Convex status
npx convex dashboard

# Redeploy Convex
npx convex deploy -y

# Verify URL is correct
echo $NEXT_PUBLIC_CONVEX_URL
```

### Environment Variable Issues

```bash
# Verify required variables exist
npx vercel env ls

# Pull environment variables locally
npx vercel env pull .env.local
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

## 🎯 Best Practices

1. **Test locally first** - Always test on localhost before pushing
2. **Small commits** - Deploy small, incremental changes
3. **Clear commit messages** - Use conventional commits (feat:, fix:, chore:)
4. **Monitor deployments** - Check Vercel dashboard after push
5. **Keep dependencies updated** - Run `npm audit` regularly

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Vercel Dashboard**: Monitor deployment status
- **Convex Dashboard**: Monitor backend status and data

---

**Remember**: Simple is better. One branch, one deployment, one source of truth.
