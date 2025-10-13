# Authentication System Documentation

**Last Updated**: September 1, 2025  
**Status**: Fully Operational ✅  
**Site**: <https://school.aramac.dev>

## 🏗️ SYSTEM ARCHITECTURE

### Overview

The Plataforma Astral authentication system uses **NextAuth.js v5** with a hybrid approach:

- **Credentials Provider**: For staff (ADMIN, PROFESOR) - database authentication
- **OAuth Providers**: For parents (PARENT) - Google/Facebook login
- **Role-Based Access**: Middleware-enforced route protection

### Authentication Flow

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Login  │───▶│ NextAuth.js │───▶│ Prisma DB   │───▶│ JWT Session │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                                      │
                           ▼                                      ▼
                   ┌─────────────┐                        ┌─────────────┐
                   │ Middleware  │◀───────────────────────│ Protected   │
                   │ Protection  │                        │ Routes      │
                   └─────────────┘                        └─────────────┘
```

## 🔧 CORE COMPONENTS

### 1. NextAuth Configuration (`src/lib/auth.ts`)

```typescript
// Key Features:
- trustHost: true // Required for Vercel deployment
- session.strategy: 'jwt' // JWT-based sessions
- session.maxAge: 24 * 60 * 60 // 24 hour sessions
- debug: false // Production setting
```

**Critical Environment Variables**:

- `NEXTAUTH_URL`: Must match exact production domain
- `NEXTAUTH_SECRET`: 32+ character secret key
- `CONVEX_URL`: Convex deployment URL

### 2. Database Authentication (`src/lib/auth-prisma.ts`)

```typescript
// Authentication Methods:
- authenticateUser(email, password) // Credentials login
- findUserByEmail(email) // OAuth validation
- testPrismaAuthConnection() // Health check

// Emergency Bypass:
- Admin access when database fails
- Hardcoded credentials: admin@plataforma-astral.com / admin123
```

### 3. Route Protection (`src/middleware.ts`)

```typescript
// Protected Routes:
- /admin/** → ADMIN only
- /profesor/** → PROFESOR only
- /parent/** → PARENT only

// Public Routes:
- /, /centro-consejo, /fotos-videos, /login
```

## 👥 USER ROLES & ACCESS

### ADMIN Role

- **Access**: Full system administration
- **Routes**: `/admin/**`
- **Authentication**: Credentials only (database)
- **Capabilities**: User management, system settings, all data access

### PROFESOR Role

- **Access**: Teaching and planning features
- **Routes**: `/profesor/**`
- **Authentication**: Credentials only (database)
- **Capabilities**: Planning documents, meetings, student data

### PARENT Role

- **Access**: Parent-specific features
- **Routes**: `/parent/**`
- **Authentication**: OAuth (Google/Facebook) or credentials
- **Capabilities**: Meeting requests, student progress, communications

### PUBLIC Role

- **Access**: Public information only
- **Routes**: Public routes only
- **Authentication**: None required
- **Capabilities**: General school information, Centro Consejo voting

## 🔐 SECURITY IMPLEMENTATION

### Password Security

```typescript
// Hashing: bcryptjs with salt rounds 12
const hashedPassword = await bcrypt.hash(password, 12);

// Verification: secure comparison
const isValid = await verifyPassword(plaintext, hashed);
```

### Session Management

```typescript
// JWT Configuration:
- Algorithm: HS256 (default)
- Expiration: 24 hours
- Secure cookies in production
- SameSite: 'lax' for OAuth compatibility
```

### CSRF Protection

- Built-in NextAuth CSRF protection
- Session token validation
- Origin verification

### OAuth Security

```typescript
// Provider Configuration:
- Google OAuth: Restricted to parent registration
- Existing staff accounts: OAuth blocked for ADMIN/PROFESOR roles
- New OAuth users: Auto-assigned PARENT role
```

## 🌐 ENVIRONMENT CONFIGURATION

### Production Environment (Vercel)

```bash
# Core Authentication
NEXTAUTH_URL="https://school.aramac.dev"
NEXTAUTH_SECRET="production-secret-32-chars-minimum"
CONVEX_URL="[Convex deployment URL]"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage
CLOUDINARY_URL="cloudinary://api-key:secret@cloud-name"
```

### Development Environment

```bash
# Local Development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-32-chars-minimum"
CONVEX_URL="[Convex development deployment URL]"
```

### Environment File Hierarchy

1. `.env.local` - Local development overrides
2. `.env.production` - Production-specific values
3. `.env` - Default/shared values
4. `Vercel Environment Variables` - Production deployment

## 🚀 DEPLOYMENT PROCESS

### Vercel Deployment Commands

```bash
# Check current environment variables
npx vercel env ls

# Update environment variable
npx vercel env rm NEXTAUTH_URL production
npx vercel env add NEXTAUTH_URL production

# Deploy to production
npx vercel --prod

# Verify deployment
npx vercel ls
curl -I https://school.aramac.dev
```

### Deployment Checklist

- [ ] Verify NEXTAUTH_URL matches production domain
- [ ] Confirm CONVEX_URL points to production Convex deployment
- [ ] Test OAuth provider redirects work
- [ ] Validate all environment variables are set
- [ ] Run post-deployment authentication test

## 🔍 TESTING & VALIDATION

### Test Users (Development)

```bash
# Create test users
Use Convex dashboard to create test users

# Test credentials:
ADMIN: admin@plataforma-astral.com / admin123
PROFESOR: profesor@plataforma-astral.com / profesor123
PARENT: parent@plataforma-astral.com / parent123
```

### Authentication Tests

```bash
# Run authentication test suite
npm run test:e2e:auth

# Manual testing endpoints:
GET /api/auth/session     # Check session status
POST /api/auth/signin     # Login endpoint
POST /api/auth/signout    # Logout endpoint
```

### Health Checks

```bash
# Database connection
npm run verify-supabase

# Authentication system
curl -s https://school.aramac.dev/api/auth/session

# Route protection
curl -I https://school.aramac.dev/admin
# Should redirect to login if not authenticated
```

## 🚨 EMERGENCY PROCEDURES

### Emergency Admin Access

If authentication system fails completely:

1. **Locate Emergency Bypass** in `src/lib/auth-prisma.ts`:

   ```typescript
   // Lines 27-40 and 82-94
   if (email === "admin@plataforma-astral.com" && password === "admin123") {
     return emergency_admin_user;
   }
   ```

2. **Emergency Credentials**:
   - Email: `admin@plataforma-astral.com`
   - Password: `admin123`

3. **Emergency Access Process**:
   - Works even if database is down
   - Provides admin-level access
   - Bypasses normal authentication flow
   - Logs emergency usage for security audit

### Database Recovery

```bash
# Reset database connection
npx prisma generate
npx prisma db push

# Recreate admin user
Use Convex dashboard to create admin user

# Verify users exist
npm run verify-users
```

## 📊 MONITORING & LOGGING

### Authentication Logging

```typescript
// Logger configuration in src/lib/auth.ts
const logger = Logger.getInstance('Authentication');

// Log levels:
- INFO: Successful authentications
- WARN: Failed attempts, emergency access
- ERROR: System errors, database failures
```

### Key Metrics to Monitor

- Authentication success/failure rates
- Emergency bypass usage
- Database connection health
- Session creation/expiration rates
- OAuth provider response times

### Error Patterns

```bash
# Common error indicators:
"Invalid NEXTAUTH_URL" → Environment variable mismatch
"Database connection failed" → Prisma/PostgreSQL issues
"OAuth callback error" → Provider configuration issues
"CSRF token mismatch" → Session/cookie problems
```

## 🔄 MAINTENANCE PROCEDURES

### Regular Maintenance

1. **Weekly**: Review authentication logs for anomalies
2. **Monthly**: Update dependencies (NextAuth, Prisma)
3. **Quarterly**: Rotate NEXTAUTH_SECRET
4. **Annually**: Review and update OAuth provider settings

### Security Updates

1. **NextAuth.js**: Monitor for security updates
2. **Dependencies**: Regular `npm audit` checks
3. **Database**: Keep PostgreSQL updated
4. **Environment Variables**: Rotate secrets periodically

### Backup Procedures

1. **User Data**: Regular database backups via Supabase
2. **Configuration**: Version control all config files
3. **Environment Variables**: Secure backup of production values
4. **Emergency Access**: Maintain emergency bypass documentation

---

**Documentation Maintained By**: Development Team  
**Last Incident**: September 1, 2025 - NEXTAUTH_URL Mismatch (RESOLVED)  
**Next Review**: December 1, 2025
