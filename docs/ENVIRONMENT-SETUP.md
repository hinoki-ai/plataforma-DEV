# �� Environment Configuration Guide

## 📁 Clean 3-Environment Structure

This project uses a **proper 3-tier environment structure** for maximum clarity and maintainability:

```
.env.example       ✅ Template (committed to git)
.env.local         ✅ Local development (ignored by git)
.env.development   ✅ Development deployment (ignored by git)
.env.production    ✅ Production deployment (ignored by git)
```

## 🚀 Environment Matrix

| Environment | File | Branch | URL | Purpose | NODE_ENV |
|-------------|------|--------|-----|---------|----------|
| **Local** | `.env.local` | `main` | `localhost:3000` | Local development | development |
| **Development** | `.env.development` | `dev` | `dev.school.aramac.dev` | Staging/testing | production |
| **Production** | `.env.production` | `prod` | `school.aramac.dev` | Live production | production |

## 🔧 Environment Files

### 📁 `.env.example` - Template (Committed)
Complete template with all required variables and documentation.

### 📁 `.env.local` - Local Development (Ignored)
```bash
# Used for localhost:3000
NODE_ENV=development
APP_ENV=dev
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://..."  # Supabase connection
```

### 📁 `.env.development` - Development Deployment (Ignored)
```bash
# Used for dev.school.aramac.dev
NODE_ENV=production
APP_ENV=dev
NEXTAUTH_URL="https://dev.school.aramac.dev"
DATABASE_URL="postgresql://..."  # Same as production
```

### 📁 `.env.production` - Production Deployment (Ignored)
```bash
# Used for school.aramac.dev
NODE_ENV=production
APP_ENV=prod
NEXTAUTH_URL="https://school.aramac.dev"
DATABASE_URL="postgresql://..."  # Supabase production
```

## 🚀 Quick Setup

### Local Development:
```bash
cp .env.example .env.local
# Edit .env.local if needed (DATABASE_URL is already configured)
npm run dev
```

### Development Deployment:
```bash
cp .env.example .env.development
# Edit .env.development with dev-specific settings
git checkout dev
git push origin dev
```

### Production Deployment:
```bash
cp .env.example .env.production
# Edit .env.production with production secrets
git checkout prod
git push origin prod
```

## 🔑 Test Credentials

Once deployed, login with:
- **Admin**: `admin@manitospintadas.cl` / `admin123`
- **Teacher**: `profesor@manitospintadas.cl` / `profesor123`

## 🔒 Security

- **Never commit** `.env.local`, `.env.development`, or `.env.production`
- **Use Vercel environment variables** for sensitive production data
- **Rotate secrets regularly** in all environments

## 🐛 Troubleshooting

### Database Issues:
```bash
# Check database connection
curl https://[domain]/api/health

# Reset database (if needed)
npm run db:seed:emergency
```

### Authentication Issues:
```bash
# Check NextAuth configuration
curl https://[domain]/api/auth/session

# Verify environment variables
npm run env:status
```

## 📋 Deployment Commands

```bash
# Local development
npm run dev

# Deploy to development
git checkout dev && git push

# Deploy to production  
git checkout prod && git push

# Check environment status
npm run env:status
```
