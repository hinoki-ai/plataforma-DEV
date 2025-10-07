# Authentication System Setup Guide

## ✅ Status Overview

The authentication system is **99% complete** with Convex integration. Only environment configuration is needed.

## 🔧 What's Implemented

### ✅ Core Authentication
- [x] NextAuth.js v5 with JWT strategy
- [x] Convex backend integration via custom adapter
- [x] Credentials authentication (email/password)
- [x] Google OAuth provider (configurable)
- [x] Password hashing with bcryptjs
- [x] Role-based access control (MASTER, ADMIN, PROFESOR, PARENT, PUBLIC)
- [x] Session management with Convex
- [x] Middleware route protection

### ✅ User Registration
- [x] Parent self-registration flow
- [x] Parent registration with student info verification
- [x] Admin-created user accounts (via admin panel)
- [x] OAuth account linking
- [x] Email validation
- [x] Password strength requirements

### ✅ Security Features
- [x] Rate limiting on auth endpoints
- [x] Password change functionality with validation
- [x] Session token management
- [x] CSRF protection
- [x] Secure cookie configuration
- [x] Security headers in middleware

### ✅ UI Components
- [x] Login page with form validation
- [x] Parent registration page
- [x] Password visibility toggle
- [x] Loading states and error messages
- [x] Optimistic UI updates
- [x] i18n support (Spanish/English)

### ✅ API Routes
- [x] `/api/auth/[...nextauth]` - NextAuth handlers with rate limiting
- [x] `/api/auth/register-parent` - Parent self-registration
- [x] `/api/auth/change-password` - Password change with validation
- [x] `/api/auth/oauth-status` - OAuth configuration status

### ✅ Convex Functions
- [x] User CRUD operations
- [x] Authentication queries
- [x] Session management
- [x] Account linking (OAuth)
- [x] Verification tokens
- [x] Auth adapter for NextAuth

## 🚀 Required Setup Steps

### 1. Initialize Convex Project

```bash
# Start Convex development server
npx convex dev
```

This will:
- Open your browser for Convex authentication
- Create or select a Convex project
- Generate your Convex URL
- Generate TypeScript types

### 2. Configure Environment Variables

Update your `.env` file with the Convex URL from step 1:

```bash
# Convex Backend (REQUIRED)
NEXT_PUBLIC_CONVEX_URL=https://your-actual-project.convex.cloud

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=http://localhost:3000  # Change to your domain in production
NEXTAUTH_SECRET=your-32-character-secret-key-here

# OAuth Providers (OPTIONAL)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for file uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Start Development Server

```bash
# Terminal 1: Convex development server
npx convex dev

# Terminal 2: Next.js development server
npm run dev
```

## 📝 Testing Credentials

After seeding (if implemented), test users:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@manitospintadas.cl | admin123 |
| PROFESOR | profesor@manitospintadas.cl | profesor123 |
| PARENT | parent@manitospintadas.cl | parent123 |

## 🔐 Authentication Flow

### Credentials Login
1. User enters email/password on `/login`
2. Server action `authenticate()` validates credentials
3. Convex queries user by email
4. Password verified with bcryptjs
5. JWT token created with user role
6. Middleware redirects to role-specific dashboard

### OAuth Login (Google)
1. User clicks "Sign in with Google"
2. OAuth flow handled by NextAuth
3. User account created/linked in Convex
4. Only PARENT role allowed for OAuth
5. Teachers/admins must use credentials

### Parent Self-Registration
1. User visits `/registro-padre`
2. Fills parent and student information
3. API creates pending user account
4. Meeting record created for verification
5. Admin reviews and activates account

## 🛡️ Security Measures

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (recommended)

### Rate Limiting
- **Auth actions**: 5 attempts per 15 minutes
- **Session requests**: 100 requests per 15 minutes
- **Password changes**: 5 attempts per 15 minutes

### Route Protection
Protected routes are automatically secured by middleware:
- `/admin/**` → ADMIN or MASTER only
- `/profesor/**` → PROFESOR, ADMIN, or MASTER
- `/parent/**` → PARENT, ADMIN, or MASTER

## 🔧 Troubleshooting

### "Cannot find module '@/convex/_generated/api'"

**Solution**: Run `npx convex dev` to generate types

### "NEXT_PUBLIC_CONVEX_URL is not defined"

**Solution**: 
1. Run `npx convex dev`
2. Copy the URL shown in terminal
3. Add to `.env` file

### Login shows "Credenciales inválidas"

**Checklist**:
1. Is Convex dev server running?
2. Is NEXT_PUBLIC_CONVEX_URL set correctly?
3. Does user exist in database?
4. Is password hashed correctly?

### OAuth login fails

**Checklist**:
1. Are GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET set?
2. Is redirect URI configured in Google Console?
3. Is NEXTAUTH_URL set correctly?

### Session expires immediately

**Solution**: Check NEXTAUTH_SECRET is set and matches across deployments

## 📚 Key Files Reference

### Authentication Core
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/auth-convex.ts` - User authentication with Convex
- `src/lib/convex-adapter.ts` - NextAuth adapter for Convex
- `src/lib/middleware-auth.ts` - Edge-compatible auth for middleware
- `src/middleware.ts` - Route protection

### Convex Backend
- `convex/users.ts` - User queries and mutations
- `convex/authAdapter.ts` - NextAuth adapter functions
- `convex/auth.ts` - Session and account management
- `convex/schema.ts` - Database schema

### Server Actions
- `src/services/actions/auth.ts` - Login/logout actions
- `src/services/actions/unified-registration.ts` - User registration

### UI Components
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/registro-padre/page.tsx` - Parent registration

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `src/app/api/auth/register-parent/route.ts` - Parent registration
- `src/app/api/auth/change-password/route.ts` - Password management

## 🎯 Next Steps

1. **Run Convex Setup** (Required)
   ```bash
   npx convex dev
   ```

2. **Update Environment** (Required)
   - Add NEXT_PUBLIC_CONVEX_URL
   - Set NEXTAUTH_SECRET

3. **Test Login Flow** (Recommended)
   - Create test user via Convex dashboard
   - Test credentials login
   - Test OAuth login (if configured)

4. **Deploy** (Production)
   ```bash
   # Deploy Convex first
   npx convex deploy --prod
   
   # Then deploy Next.js
   vercel deploy --prod
   ```

## ✨ Features Ready to Use

Once environment is configured, all these features work immediately:

- ✅ Login with credentials
- ✅ Login with Google OAuth
- ✅ Parent self-registration
- ✅ Role-based dashboards
- ✅ Password change
- ✅ Session management
- ✅ Route protection
- ✅ Rate limiting
- ✅ Security headers

## 🆘 Support

For issues or questions:
1. Check this guide first
2. Review error messages in browser console
3. Check Convex dashboard for data issues
4. Review NextAuth documentation: https://next-auth.js.org/
5. Review Convex documentation: https://docs.convex.dev/
