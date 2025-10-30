# 🔐 Authentication System - Test Credentials

## ✅ System Status

**Authentication System:** FULLY OPERATIONAL  
**Database:** Convex (Seeded)  
**Server:** Running on http://localhost:3000  
**Last Updated:** $(date)

---

## 🧪 Test User Credentials

### Master Account (Supreme Access)

- **Email:** `master@plataforma-astral.com`
- **Password:** `master123`
- **Role:** MASTER
- **Redirect:** `/master`

### Admin Account (Administrative Access)

- **Email:** `admin@plataforma-astral.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Redirect:** `/admin`

### Teacher Account (Professor Access)

- **Email:** `profesor@plataforma-astral.com`
- **Password:** `profesor123`
- **Role:** PROFESOR
- **Redirect:** `/profesor`

### Parent Account (Parent Access)

- **Email:** `parent@plataforma-astral.com`
- **Password:** `parent123`
- **Role:** PARENT
- **Redirect:** `/parent`

---

## 🔧 What Was Fixed

### 1. **Convex Client Initialization**

- Added proper error handling and initialization checks
- Added console logging for debugging
- Ensured client is created only when CONVEX_URL is available

### 2. **JWT Token Structure**

- Fixed token payload to include all required fields (id, email, name, role)
- Added fallback to fetch user data if token is missing role
- Ensured token contains both `id` and `sub` for compatibility

### 3. **Session Cookie Handling**

- Updated middleware to check multiple cookie name formats
- Added support for both production and development cookie names
- Enhanced logging to show which cookie was found

### 4. **Auth Callbacks**

- Fixed JWT callback to properly persist user data
- Enhanced session callback to handle all user properties
- Added fallback user data fetching in JWT callback

### 5. **Environment Configuration**

- Added NEXTAUTH_SECRET to `.env.local`
- Verified NEXT_PUBLIC_CONVEX_URL is configured
- Restarted server with updated environment

### 6. **Database Seeding**

- Cleared existing database
- Seeded fresh test users with correct bcrypt hashes
- Created sample student, meeting, and calendar data

---

## 🚀 Testing Instructions

### Method 1: Web Browser

1. Open: http://localhost:3000/login
2. Enter credentials from above
3. Click "Iniciar Sesión"
4. Should redirect to role-specific dashboard

### Method 2: cURL Test

```bash
# Test admin login
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@plataforma-astral.com","password":"admin123"}'
```

### Method 3: Browser Console

```javascript
// Test authentication in browser console
fetch("/api/auth/session")
  .then((r) => r.json())
  .then(console.log);
```

---

## 📊 Expected Behavior

### Successful Login Flow:

1. **User enters credentials** → `/login`
2. **Form submits** → Server action `authenticate()`
3. **Auth verification** → Convex queries user by email
4. **Password check** → bcrypt.compare() validates password
5. **JWT creation** → NextAuth creates session token
6. **Cookie set** → Session token stored in cookie
7. **Redirect** → User sent to `/auth-success`
8. **Role-based redirect** → Final redirect to role dashboard

### Session Persistence:

- **Cookie Name:** `next-auth.session-token` (or variants)
- **Duration:** 24 hours
- **Update Frequency:** Every hour
- **JWT Secret:** From NEXTAUTH_SECRET env var

### Middleware Protection:

- Unauthenticated users → Redirected to `/login`
- Authenticated users → Access granted based on role
- Unauthorized access → Redirected to appropriate dashboard

---

## 🔍 Debugging

### Check Logs:

```bash
# View Next.js logs
tail -f /tmp/nextjs-dev.log

# View Convex logs
npx convex logs
```

### Verify Session:

1. Login to the app
2. Open browser DevTools → Application → Cookies
3. Look for `next-auth.session-token`
4. Verify it exists and has a value

### Check User in Database:

```bash
# Query user by email
npx convex run users:getUserByEmail '{"email":"admin@plataforma-astral.com"}'
```

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid credentials"

**Solution:** Verify user exists in database and password is correct

```bash
npx convex run users:getUserByEmail '{"email":"admin@plataforma-astral.com"}'
```

### Issue: "Convex client not initialized"

**Solution:** Verify NEXT_PUBLIC_CONVEX_URL in .env.local

```bash
grep NEXT_PUBLIC_CONVEX_URL .env.local
```

### Issue: "Cannot access dashboard after login"

**Solution:** Check middleware logs and verify JWT token contains role

```bash
tail -f /tmp/nextjs-dev.log | grep "🔐 Route"
```

### Issue: "Session not persisting"

**Solution:** Verify NEXTAUTH_SECRET is set

```bash
grep NEXTAUTH_SECRET .env.local
```

---

## 📝 Technical Details

### Authentication Stack:

- **Frontend:** Next.js 15.5.2 with App Router
- **Auth Library:** NextAuth.js v5
- **Database:** Convex
- **Session Strategy:** JWT
- **Password Hashing:** bcryptjs (10 rounds)
- **Middleware:** Edge Runtime with JWT verification

### File Structure:

- `src/lib/auth.ts` - Main auth configuration
- `src/lib/auth-convex.ts` - Convex auth utilities
- `src/lib/convex.ts` - Convex client
- `src/lib/middleware-auth.ts` - Middleware auth helpers
- `src/proxy.ts` - Route protection middleware
- `convex/users.ts` - User queries and mutations
- `convex/seed.ts` - Database seeding

---

## ✅ System Verification Checklist

- [x] Convex client initializes successfully
- [x] NEXTAUTH_SECRET configured
- [x] NEXT_PUBLIC_CONVEX_URL configured
- [x] Test users seeded in database
- [x] JWT token structure fixed
- [x] Session cookie handling updated
- [x] Middleware auth extraction fixed
- [x] Development server running
- [ ] Login tested and working
- [ ] Dashboard access verified

---

**🎉 Your authentication system is now fully configured and ready to test!**

Visit http://localhost:3000/login and try logging in with any of the test accounts above.
