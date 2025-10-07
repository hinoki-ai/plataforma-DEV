# 🏗️ Branch Strategy - Manitos Pintadas School Management System

## Branch Structure

### ✅ Active Branches

#### `main` (Client Production Branch)

- **Purpose**: Real client production code
- **Environment**: manitospintadas.cl (Client site)
- **Deployment**: Automatic on push (HIGH RISK)
- **Protection**: Maximum security protection
- **Workflow**: Only thoroughly tested, client-approved code

#### `prod` (Service/Demo Branch)

- **Purpose**: Service and demo site
- **Environment**: school.aramac.dev (Your service site)
- **Deployment**: Automatic on push
- **Protection**: Standard protection
- **Workflow**: Marketing materials, demos, service features

#### `dev.school.aramac.dev` (Development Branch)

- **Purpose**: Primary development and testing
- **Environment**: dev.school.aramac.dev (Sandbox)
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
# 1. Always work on dev.school.aramac.dev
git checkout dev.school.aramac.dev
git pull origin dev.school.aramac.dev

# 2. Create feature branches if needed (optional)
git checkout -b feature/new-feature

# 3. Work and commit
git add .
git commit -m "feat: add new feature"

# 4. Merge back to dev (if using feature branches)
git checkout dev.school.aramac.dev
git merge feature/new-feature

# 5. Push to deploy to dev environment
git push origin dev.school.aramac.dev
```

### Service Deployment (school.aramac.dev)

```bash
# Deploy to service/demo site
git checkout prod
git merge dev.school.aramac.dev  # After testing in dev
git push origin prod  # Auto-deploys to school.aramac.dev
```

### Client Production Deployment (manitospintadas.cl)

```bash
# Only deploy thoroughly tested, client-approved code
git checkout main
git merge prod  # Only after client approval
git push origin main  # Auto-deploys to manitospintadas.cl
```

## 🛡️ Branch Protection

### Automatic Checks

- Run `npm run check-branches` before any major operations
- Script will warn about deprecated branches
- Prevents accidental merges from old branches

### Manual Reviews Required

- All merges to `manitospintadas.cl` require review
- Check for:
  - Test coverage
  - Performance impact
  - Security considerations
  - Database migrations

## 📋 Environment Mapping

| Branch                  | Environment         | URL                     | Auto-deploy | Risk Level |
| ----------------------- | ------------------- | ----------------------- | ----------- | ---------- |
| `dev.school.aramac.dev` | Development Sandbox | `dev.school.aramac.dev` | ✅ Yes      | 🟢 Low     |
| `prod`                  | Service/Demo Site   | `school.aramac.dev`     | ✅ Yes      | 🟡 Medium  |
| `main`                  | Client Production   | `manitospintadas.cl`    | ✅ Yes      | 🔴 High    |

## ⚠️ Important Rules

1. **Never work directly on `main` or `prod` branches**
2. **Always develop on `dev.school.aramac.dev` first**
3. **Test on dev before promoting to `prod`**
4. **Only promote to `main` after client approval**
5. **Run branch checks regularly**: `npm run check-branches`
6. **Use feature branches for complex changes** (optional)
7. **Keep all branches clean and deployable**

## 🔧 Scripts

```bash
# Check for deprecated branches
npm run check-branches

# Deploy commands (automatic on push to respective branches)
# dev.school.aramac.dev → dev.school.aramac.dev
# prod → school.aramac.dev
# main → manitospintadas.cl
```

## 📞 Contact

For questions about branch strategy:

- Development: <agustinaramac@gmail.com>
- Production: <inacorgan@gmail.com> (Adrina)
