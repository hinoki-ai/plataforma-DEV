# 🚀 Production Deployment - Authentication Fix

## ⚠️ IMPORTANT: Real User Data

This guide is for deploying the authentication fixes to production where **real users** exist.

---

## 🔍 Current Status

### Development (Fixed)
- **URL:** http://localhost:3000
- **Convex:** `https://different-jackal-611.convex.cloud`
- **Status:** ✅ Working with test users

### Production (To Deploy)
- **URL:** https://plataforma.aramac.dev
- **Convex:** `https://industrious-manatee-7.convex.cloud`
- **Status:** 🔄 Needs authentication fixes

---

## 📋 Pre-Deployment Checklist

### 1. Verify Production Environment
```bash
# Check Vercel environment variables
npx vercel env ls

# MUST have these set:
# ✅ NEXT_PUBLIC_CONVEX_URL
# ✅ NEXTAUTH_SECRET
# ✅ NEXTAUTH_URL=https://plataforma.aramac.dev
```

### 2. Check Real User Count
```bash
# Switch to production Convex
export CONVEX_DEPLOYMENT=prod:industrious-manatee-7

# Count users in production
npx convex run users:getUserCountByRole '{}'
```

### 3. Backup Production Data
```bash
# Open Convex dashboard
npx convex dashboard

# Go to "Data" tab → Export users table
# Save backup before deployment
```

---

## 🚀 Deployment Steps

### Step 1: Test Build Locally
```bash
# Ensure everything compiles
npm run build

# Check for errors
npm run lint
npm run type-check
```

### Step 2: Deploy Convex Functions to Production
```bash
# Deploy schema and functions to production
npx convex deploy

# Verify deployment
npx convex dashboard
```

### Step 3: Update Production Environment Variables

In Vercel Dashboard (https://vercel.com/your-team/plataforma):

1. Go to **Settings → Environment Variables**
2. Verify/Update:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://industrious-manatee-7.convex.cloud
   NEXTAUTH_SECRET=<generate-new-secure-secret>
   NEXTAUTH_URL=https://plataforma.aramac.dev
   ```

3. **Generate new NEXTAUTH_SECRET** (if not set):
   ```bash
   openssl rand -base64 32
   ```

### Step 4: Deploy to Vercel
```bash
# Commit changes
git add .
git commit -m "fix: authentication system for production"

# Push to main (triggers automatic deployment)
git push origin main

# OR manually deploy
npx vercel --prod
```

### Step 5: Verify Production Deployment
```bash
# Check if site is live
curl -I https://plataforma.aramac.dev

# Check authentication endpoint
curl https://plataforma.aramac.dev/api/auth/session
```

---

## 🧪 Testing Production Authentication

### Test with Real User Account

1. Go to https://plataforma.aramac.dev/login
2. Use existing real user credentials
3. Verify login works and redirects to correct dashboard
4. Check session persists (refresh page)

### If Login Fails - Debug Steps

```bash
# View production logs
npx vercel logs

# Check Convex logs
npx convex logs --prod

# Verify user exists
npx convex run users:getUserByEmail '{"email":"real-user@example.com"}'
```

---

## 🔐 Creating Admin Users in Production

### Option 1: Via Convex Dashboard
```bash
# Open dashboard
npx convex dashboard

# Go to "Data" → "users" table → "Add Document"
# Add user with bcrypt-hashed password
```

### Option 2: Via Convex Function
```bash
# Create admin user script
npx convex run users:createUser '{
  "email": "admin@plataforma-astral.com",
  "password": "$2b$10$07JuDiQUuQj9AQYD7k7KSeNbPVSx0n6cA8N17biZ95Qroq3owdtRm",
  "name": "Administrator",
  "role": "ADMIN"
}'
```

### Generate Password Hash
```bash
# Install bcrypt CLI
npm install -g bcrypt-cli

# Hash a password
bcrypt-cli hash-password "YourSecurePassword123"
```

Or use Node.js:
```javascript
const bcrypt = require('bcryptjs');
const password = 'YourSecurePassword123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

---

## 🛡️ Production Safety Features

### Seed Script Protection

The seed script now has safeguards:

```bash
# ❌ This will fail if users exist (SAFE)
npx convex run seed:seedDatabase '{}'

# ✅ This skips if users exist
npx convex run seed:seedDatabase '{"skipIfUsersExist": true}'

# ⚠️ DANGEROUS: Force seed (creates duplicates)
npx convex run seed:seedDatabase '{"skipIfUsersExist": false}'
```

### Clear Database Protection

```bash
# ❌ This will fail (requires safety code)
npx convex run seed:clearDatabase '{"confirm": true}'

# ✅ This includes safety code (USE WITH EXTREME CAUTION)
npx convex run seed:clearDatabase '{
  "confirm": true,
  "safetyCode": "DELETE_ALL_DATA_PERMANENTLY_2024"
}'
```

---

## 🔄 Rollback Plan

If something goes wrong:

### 1. Immediate Rollback
```bash
# Revert to previous Vercel deployment
npx vercel rollback
```

### 2. Restore Convex Data
```bash
# Open Convex dashboard
npx convex dashboard

# Go to Settings → Backups
# Restore from snapshot (if available)
```

### 3. Emergency Access
If users can't login:

1. Create emergency admin account via Convex dashboard
2. Share login credentials securely
3. Have admin reset passwords for affected users

---

## 📝 Changes Deployed

### Files Modified:
- `src/lib/convex.ts` - Improved client initialization
- `src/lib/auth.ts` - Fixed JWT token structure
- `src/lib/middleware-auth.ts` - Enhanced cookie detection
- `convex/seed.ts` - Added production safety checks

### What Was Fixed:
1. ✅ Convex client initialization with error handling
2. ✅ JWT token includes all required fields (id, email, name, role)
3. ✅ Middleware checks multiple cookie name formats
4. ✅ Session persistence improved
5. ✅ Role-based access control verified

---

## 🔍 Post-Deployment Verification

### Checklist:

- [ ] Production site loads (https://plataforma.aramac.dev)
- [ ] Login page accessible
- [ ] Real users can login successfully
- [ ] Sessions persist after page refresh
- [ ] Role-based dashboards work correctly
- [ ] Middleware redirects properly
- [ ] No console errors in production
- [ ] All user roles can access their dashboards

### Monitor for 24 Hours:

- Check Vercel analytics for errors
- Monitor Convex function calls
- Watch for user login issues
- Check session persistence

---

## 🆘 Support & Troubleshooting

### Common Issues:

**Issue: "Invalid credentials" for existing users**
- Check if user exists in production Convex
- Verify password hash is correct
- Check NEXTAUTH_SECRET is set in Vercel

**Issue: Login works but redirects to login again**
- Verify NEXTAUTH_URL matches production domain
- Check session cookie is being set
- Verify JWT secret matches between builds

**Issue: "Convex client not initialized"**
- Verify NEXT_PUBLIC_CONVEX_URL in Vercel env vars
- Redeploy after adding env var
- Check Convex deployment is active

### Emergency Contacts:

- Vercel Support: https://vercel.com/support
- Convex Support: https://convex.dev/support
- Check logs: `npx vercel logs` and `npx convex logs`

---

## 📊 Monitoring

### Key Metrics to Watch:

```bash
# Login success rate
# Session duration
# 401/403 errors
# Middleware redirect loops
```

### Tools:

- Vercel Analytics
- Convex Dashboard → Functions → Metrics
- Browser DevTools → Network/Console

---

**✅ Ready to Deploy!**

Follow the steps above carefully, especially with production data.
Test thoroughly before and after deployment.

---

*Last Updated: $(date)*  
*Production URL: https://plataforma.aramac.dev*  
*Convex: https://industrious-manatee-7.convex.cloud*

