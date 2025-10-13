# ✅ Production Deployment Checklist - Authentication Fix

Use this checklist when deploying the authentication fix to production.

---

## 🔐 Pre-Deployment

### Environment Verification
- [ ] Check production Convex URL is configured in Vercel
- [ ] Verify NEXTAUTH_SECRET exists in Vercel environment variables
- [ ] Confirm NEXTAUTH_URL matches production domain: `https://plataforma.aramac.dev`
- [ ] Backup current environment variables (screenshot or export)

### Code Verification
- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` with no errors
- [ ] Run `npm run type-check` with no errors
- [ ] Review all changed files in git diff

### Data Safety
- [ ] Export/backup users table from production Convex dashboard
- [ ] Count real users in production: `npx convex run users:getUserCountByRole '{}'`
- [ ] Verify no test users in production database
- [ ] Document current user count: ______ users

---

## 🚀 Deployment Steps

### 1. Deploy Convex Backend
- [ ] Run `npx convex deploy` (deploys to production)
- [ ] Verify deployment in Convex dashboard
- [ ] Check no errors in Convex logs
- [ ] Test a simple query: `npx convex run users:getUserCountByRole '{}'`

### 2. Update Vercel Environment Variables

If NEXTAUTH_SECRET is missing:
- [ ] Generate new secret: `openssl rand -base64 32`
- [ ] Add to Vercel: `npx vercel env add NEXTAUTH_SECRET production`
- [ ] Paste the generated secret

Verify all variables:
- [ ] NEXT_PUBLIC_CONVEX_URL = `https://industrious-manatee-7.convex.cloud`
- [ ] NEXTAUTH_SECRET = (32+ character secret)
- [ ] NEXTAUTH_URL = `https://plataforma.aramac.dev`

### 3. Deploy Frontend
- [ ] Commit changes: `git add . && git commit -m "fix: authentication for production"`
- [ ] Push to main: `git push origin main`
- [ ] Wait for Vercel deployment to complete
- [ ] Check Vercel dashboard for successful deployment

### 4. Verify Deployment
- [ ] Site loads: https://plataforma.aramac.dev
- [ ] No 401/403 errors on homepage
- [ ] Login page accessible: https://plataforma.aramac.dev/login
- [ ] No JavaScript errors in browser console
- [ ] Check network tab - all requests successful

---

## 🧪 Testing Production

### Test Real User Login
- [ ] Navigate to login page
- [ ] Enter real user credentials
- [ ] Click "Iniciar Sesión"
- [ ] Verify redirect to correct dashboard
- [ ] Check session persists (refresh page)
- [ ] Verify user data displays correctly

### Test Different Roles
- [ ] Test ADMIN login and dashboard access
- [ ] Test PROFESOR login and dashboard access
- [ ] Test PARENT login and dashboard access
- [ ] Verify each role sees appropriate menu/features

### Test Session Persistence
- [ ] Login and close browser tab
- [ ] Reopen site - should still be logged in
- [ ] Check session expires after 24 hours
- [ ] Verify logout works properly

### Test Protected Routes
- [ ] Try accessing /admin without login → redirects to login
- [ ] Try accessing /profesor without login → redirects to login
- [ ] Login as PARENT → try /admin → redirects to /parent

---

## 🔍 Monitoring (First 2 Hours)

### Vercel Logs
- [ ] Monitor for errors: `npx vercel logs --follow`
- [ ] Check for authentication errors
- [ ] Watch for 500 errors
- [ ] Monitor response times

### Convex Logs
- [ ] Monitor functions: `npx convex logs --prod`
- [ ] Check getUserByEmail calls
- [ ] Watch for failed queries
- [ ] Monitor database performance

### User Feedback
- [ ] No user reports of login issues
- [ ] No reports of session problems
- [ ] No access denied errors
- [ ] Dashboard loading correctly

---

## 🐛 Troubleshooting

### If Login Fails

Check these in order:

1. **Verify user exists in production**
   ```bash
   npx convex run users:getUserByEmail '{"email":"user@example.com"}'
   ```

2. **Check NEXTAUTH_SECRET is set**
   ```bash
   npx vercel env ls | grep NEXTAUTH_SECRET
   ```

3. **Verify NEXTAUTH_URL matches domain**
   - Should be: `https://plataforma.aramac.dev`
   - NOT: `http://localhost:3000` or other variants

4. **Check session cookie**
   - Open DevTools → Application → Cookies
   - Look for `next-auth.session-token`
   - Verify it's being set on login

5. **Review production logs**
   ```bash
   npx vercel logs | grep -i "auth\|error\|401\|403"
   ```

### If Redirects Loop

1. Check NEXTAUTH_URL in Vercel env vars
2. Verify middleware.ts is deployed correctly
3. Check for conflicting redirects
4. Clear browser cookies and retry

### If Session Doesn't Persist

1. Verify NEXTAUTH_SECRET is consistent
2. Check cookie domain settings
3. Verify JWT is being created correctly
4. Check session expiry time (should be 24h)

---

## 🔄 Rollback Plan

### If Critical Issues Occur

**Immediate Rollback:**
```bash
npx vercel rollback
```

**Restore Convex:**
1. Open dashboard: `npx convex dashboard`
2. Go to Settings → Backups
3. Restore from pre-deployment snapshot

**Emergency User Access:**
1. Create temporary admin via Convex dashboard
2. Have admin reset affected user passwords
3. Notify users of temporary credentials

---

## ✅ Post-Deployment (24 Hour Check)

### Verify Stability
- [ ] No login errors reported
- [ ] Session persistence working
- [ ] All user roles functioning
- [ ] No unusual Convex errors
- [ ] No Vercel timeout errors

### Performance Check
- [ ] Login response time < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] No memory leaks
- [ ] Database queries optimized

### User Satisfaction
- [ ] Users can access dashboards
- [ ] No complaints about login
- [ ] Session persistence stable
- [ ] All features working

---

## 📝 Deployment Record

Fill in after deployment:

**Date:** _______________  
**Time:** _______________  
**Deployed By:** _______________  
**Git Commit:** _______________  
**Vercel Deployment URL:** _______________  
**User Count Before:** _______________  
**User Count After:** _______________  

**Issues Encountered:**
- [ ] None
- [ ] Minor (list below)
- [ ] Major (list below)

**Notes:**
_________________________________
_________________________________
_________________________________

**Sign-off:**
- [ ] Development tested and working
- [ ] Production deployed successfully
- [ ] All tests passed
- [ ] Monitoring active
- [ ] Team notified

---

## 🎉 Success Criteria

Deployment is successful when:

✅ All users can login with existing credentials  
✅ Sessions persist across browser sessions  
✅ Role-based access control works correctly  
✅ No authentication errors in logs  
✅ Dashboard access works for all roles  
✅ No user complaints within 24 hours  

---

**Ready to deploy? Go through each item carefully!**

*Template created: October 2024*  
*For: Plataforma Astral Authentication Fix*
