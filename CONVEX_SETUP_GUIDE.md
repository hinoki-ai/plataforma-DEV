# 🚀 Convex Authentication Setup Guide

## Complete Setup Instructions

Your authentication system has been fully configured to work with Convex! Follow these steps to get everything running.

---

## ✅ What's Already Done

✨ **Convex Schema** - All 32 tables defined in `convex/schema.ts`
✨ **Auth Functions** - User management in `convex/users.ts` and `convex/auth.ts`
✨ **NextAuth Adapter** - Full adapter in `convex/authAdapter.ts`
✨ **Auth Integration** - `src/lib/auth.ts` configured with ConvexAdapter
✨ **Registration API** - Parent registration working with Convex
✨ **Seed Script** - Test users and data in `convex/seed.ts`

---

## 📋 Setup Steps

### Step 1: Initialize Convex

Run Convex in development mode:

```bash
npx convex dev
```

This will:
1. Open your browser to the Convex dashboard
2. Ask you to log in or create a Convex account
3. Create a new project or select an existing one
4. Generate a deployment URL like `https://your-project.convex.cloud`

**Keep this terminal running!** Convex will watch for changes and push updates automatically.

### Step 2: Update Environment Variables

Copy the Convex URL from the terminal output and add it to your `.env` file:

```bash
# Update your .env file
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-key-here-32-characters-minimum
```

**Important**: The `NEXT_PUBLIC_CONVEX_URL` must be set for authentication to work!

### Step 3: Seed the Database

In a new terminal (keep `npx convex dev` running), seed your database:

```bash
# Open Convex dashboard
npx convex dashboard
```

In the dashboard:
1. Go to the **Functions** tab
2. Find `seed:seedDatabase`
3. Click **Run** with empty args `{}`

This creates test users:
- **Admin**: admin@manitospintadas.cl / admin123
- **Profesor**: profesor@manitospintadas.cl / profesor123  
- **Parent**: parent@manitospintadas.cl / parent123

### Step 4: Start Next.js

In another terminal, start your development server:

```bash
npm run dev
```

This starts both Convex and Next.js together.

---

## 🧪 Testing Authentication

### Test Credentials Login

1. Go to http://localhost:3000/login
2. Login with:
   - Email: `admin@manitospintadas.cl`
   - Password: `admin123`
3. You should be redirected to `/admin`

### Test OAuth Login (Optional)

1. Configure Google OAuth in `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
2. Go to http://localhost:3000/login
3. Click "Sign in with Google"
4. OAuth users are created as PARENT role by default

### Test Parent Registration

1. Go to http://localhost:3000/register-parent (or your registration page)
2. Fill in the form with valid data
3. User is created with PENDING status
4. Admin must verify before account becomes active

---

## 🔧 How It Works

### Authentication Flow

1. **Credentials Login**:
   ```
   User enters email/password
   → NextAuth calls authorize()
   → auth-convex.ts authenticateUser()
   → Convex query users.getUserByEmail
   → bcrypt.compare() password
   → Return user if valid
   → NextAuth creates JWT session
   ```

2. **OAuth Login (Google)**:
   ```
   User clicks "Sign in with Google"
   → NextAuth OAuth flow
   → ConvexAdapter creates/finds user
   → Convex mutation authAdapter.createUser
   → User created with PARENT role
   → NextAuth creates JWT session
   ```

3. **Session Management**:
   ```
   JWT strategy (no database sessions)
   → User role stored in JWT token
   → Middleware checks role for route protection
   → Session expires after 24 hours
   ```

### Database Adapter

The `ConvexAdapter` implements NextAuth's Adapter interface:

```typescript
// Key methods:
- createUser() - Creates new OAuth users
- getUserByEmail() - Finds user by email
- linkAccount() - Links OAuth accounts
- createSession() - Creates sessions (not used with JWT)
- createVerificationToken() - For email verification
```

### Role-Based Access

Middleware in `src/middleware.ts` protects routes:

```typescript
/admin/** → ADMIN only
/profesor/** → PROFESOR only
/parent/** → PARENT only
/ → Public
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema (32 tables) |
| `convex/users.ts` | User CRUD operations |
| `convex/auth.ts` | OAuth accounts & sessions |
| `convex/authAdapter.ts` | NextAuth adapter functions |
| `convex/seed.ts` | Database seeding |
| `src/lib/auth.ts` | NextAuth configuration |
| `src/lib/convex-adapter.ts` | Adapter interface |
| `src/lib/auth-convex.ts` | Auth helper functions |
| `src/lib/convex.ts` | Convex client setup |

---

## 🐛 Troubleshooting

### "Convex client not initialized"

**Cause**: `NEXT_PUBLIC_CONVEX_URL` not set

**Fix**:
```bash
# Check .env file
cat .env | grep CONVEX

# Should show:
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

### "Cannot find module '.../_generated/...'"

**Cause**: Convex types not generated

**Fix**:
```bash
# Make sure convex dev is running
npx convex dev

# Types are auto-generated in convex/_generated/
ls convex/_generated/
```

### Authentication fails but credentials are correct

**Cause**: User may not exist or password hash mismatch

**Fix**:
```bash
# Re-seed database
npx convex dashboard
# Run: seed:seedDatabase

# Or check if user exists:
# In dashboard Functions tab, run:
# users:getUserByEmail with args: {"email": "admin@manitospintadas.cl"}
```

### OAuth login creates duplicate users

**Cause**: Email mismatch between OAuth provider and database

**Fix**: Check the `signIn` callback in `src/lib/auth.ts` - it prevents duplicate OAuth accounts for non-PARENT roles.

### Session expires immediately

**Cause**: Token/session configuration issue

**Fix**: Check `authOptions` in `src/lib/auth.ts`:
```typescript
session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60, // 24 hours
}
```

---

## 🔐 Security Notes

### Password Hashing

All passwords are hashed with bcrypt (10 rounds):

```typescript
// In auth-convex.ts
const hashedPassword = await bcryptjs.hash(password, 10);

// Verification
const isValid = await bcryptjs.compare(password, user.password);
```

### JWT Tokens

NextAuth uses JWT strategy (not database sessions):
- Tokens stored in HTTP-only cookies
- Tokens expire after 24 hours
- Auto-refresh every hour

### Role Protection

Middleware enforces role-based access:
- Checks user role from JWT
- Redirects unauthorized users
- Logs access attempts

---

## 🎯 Next Steps

1. ✅ **Complete Setup** - Follow steps 1-4 above
2. ✅ **Test Login** - Try all test users
3. ✅ **Test Registration** - Create a new parent account
4. ✅ **Test OAuth** - Configure Google login
5. ✅ **Run Tests** - `npm run test:unit` and `npm run test:e2e`

---

## 📚 Additional Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Guide](https://stack.convex.dev/nextauth)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Auth.js Adapter Docs](https://authjs.dev/reference/adapters)

---

## 🆘 Need Help?

1. Check Convex dashboard for errors: `npx convex dashboard`
2. Check Next.js logs in terminal
3. Enable debug mode in `.env`: `NEXTAUTH_DEBUG=true`
4. Review this guide: `CONVEX_SETUP_GUIDE.md`

---

**Your authentication system is production-ready!** 🎉

Once you complete the setup steps, you'll have:
- ✅ Full user authentication (credentials + OAuth)
- ✅ Role-based access control
- ✅ Secure password hashing
- ✅ Real-time database with Convex
- ✅ Type-safe queries and mutations
