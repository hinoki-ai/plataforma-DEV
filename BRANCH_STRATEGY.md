# 🏗️ Branch Strategy - Plataforma Astral SaaS Platform

## Branch Structure

### ✅ Active Branches

#### `main` (Production Branch)

- **Purpose**: Production-ready SaaS platform code
- **Environment**: plataforma-astral.com (Main SaaS platform)
- **Deployment**: Automatic on push (HIGH RISK)
- **Protection**: Maximum security protection
- **Workflow**: Only thoroughly tested, production-ready code

#### `prod` (Staging Branch)

- **Purpose**: Pre-production testing and staging
- **Environment**: plataforma-astral.com (Staging environment)
- **Deployment**: Automatic on push
- **Protection**: Standard protection
- **Workflow**: Final testing before production deployment

#### `dev` (Development Branch)

- **Purpose**: Primary development and testing
- **Environment**: dev.plataforma-astral.com (Development sandbox)
- **Deployment**: Automatic on push
- **Protection**: Light protection
- **Workflow**: All new features, bug fixes, and experiments

## 🚫 Deprecated Branches

### Deleted Branches

- `master` → Renamed to `main`
- `dev` → Renamed to `prod`
- `developer` → Deleted (redundant)
- `school.aramac.dev` → Renamed to `prod`
- `manitospintadas.cl` → Renamed to `main`

### Why Three Branches?

- **Multi-environment support**: Separate environments for client, service, and development
- **Risk isolation**: Client production is protected from service/demo changes
- **Marketing flexibility**: Service site can be updated independently
- **Development safety**: Sandbox environment for testing without affecting live sites

## 🔄 Workflow

### Development Process

```bash
# 1. Always work on dev branch
git checkout dev
git pull origin dev

# 2. Create feature branches if needed (optional)
git checkout -b feature/new-feature

# 3. Work and commit
git add .
git commit -m "feat: add new feature"

# 4. Merge back to dev (if using feature branches)
git checkout dev
git merge feature/new-feature

# 5. Push to deploy to dev environment
git push origin dev
```

### Staging Deployment (plataforma-astral.com staging)

```bash
# Deploy to staging environment
git checkout prod
git merge dev  # After testing in dev
git push origin prod  # Auto-deploys to plataforma-astral.com (staging)
```

### Production Deployment (plataforma-astral.com)

```bash
# Only deploy thoroughly tested, production-ready code
git checkout main
git merge prod  # Only after thorough testing
git push origin main  # Auto-deploys to plataforma-astral.com
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

| Branch  | Environment         | URL                          | Auto-deploy | Risk Level |
| ------- | ------------------- | ---------------------------- | ----------- | ---------- |
| `dev`   | Development Sandbox | `dev.plataforma-astral.com` | ✅ Yes      | 🟢 Low     |
| `prod`  | Staging Environment | `plataforma-astral.com`     | ✅ Yes      | 🟡 Medium  |
| `main`  | Production Platform | `plataforma-astral.com`     | ✅ Yes      | 🔴 High    |

## ⚠️ Important Rules

1. **Never work directly on `main` or `prod` branches**
2. **Always develop on `dev` branch first**
3. **Test on dev before promoting to `prod`**
4. **Only promote to `main` after thorough testing and approval**
5. **Run branch checks regularly**: `npm run check-branches`
6. **Use feature branches for complex changes** (optional)
7. **Keep all branches clean and deployable**

## 🔧 Scripts

```bash
# Check for deprecated branches
npm run check-branches

# Deploy commands (automatic on push to respective branches)
# dev → dev.plataforma-astral.com
# prod → plataforma-astral.com (staging)
# main → plataforma-astral.com (production)
```

## 📞 Contact

For questions about branch strategy:

- Development: <agustinaramac@gmail.com>
- Production: <inacorgan@gmail.com> (Adrina)
