# Authentication System Analysis & Fix

## Issue Summary

**Problem**: User `agustin@astral.cl` could not log in despite having correct credentials.

**Root Cause**: Password hash format mismatch between storage and verification.

**Solution**: Reset password with bcrypt hashing to match authentication verification method.

## Authentication Flow

### 1. Login Process

```
User enters credentials in /login
    ↓
Form calls authenticate() Server Action
    ↓
NextAuth Credentials Provider's authorize()
    ↓
Calls authenticateUser(email, password)
    ↓
Queries Convex: api.users.getUserByEmail
    ↓
Verifies password with bcryptjs.compare()
    ↓
Returns user object or null
    ↓
NextAuth creates session with JWT
    ↓
Redirects based on user role
```

### 2. Key Components

#### `/src/lib/auth.ts` - NextAuth Configuration

- Configures NextAuth with JWT sessions
- Sets up Credentials provider
- Defines callbacks for signIn, jwt, and session
- Handles role-based authentication

#### `/src/lib/auth-convex.ts` - Authentication Logic

- `authenticateUser()`: Verifies email/password against Convex
- Uses `bcryptjs.compare()` for password verification
- Returns user object with role information

#### `/src/services/actions/auth.ts` - Server Actions

- `authenticate()`: Form submission handler
- `loginAction()`: Programmatic login
- `logoutAction()`: Session cleanup

#### `/src/app/(auth)/login/page.tsx` - Login UI

- Client component with form validation
- Uses `useActionState` for form handling
- Provides user feedback and validation

## The Hash Format Problem

### What Happened

The system has TWO different password hashing methods in `/src/lib/crypto.ts`:

1. **PBKDF2 (Edge Runtime)**:
   - Used when `crypto.subtle` is available
   - Generates base64-encoded hash with salt
   - Format: `[base64 string]`

2. **bcrypt (Node.js Runtime)**:
   - Used in Node.js environment
   - Standard bcrypt hash
   - Format: `$2a$10$...` (bcrypt hash)

### The Mismatch

1. User `agustin@astral.cl` was created with a password hashed using **PBKDF2**
2. Authentication verification uses **bcryptjs.compare()** which only works with **bcrypt** hashes
3. Result: Login always fails because bcrypt can't verify PBKDF2 hashes

### Detection

```typescript
// Hash format check
const isBcryptHash = /^\$2[abyxz]\$/.test(user.password);
// PBKDF2 hash: +ySWeR8BlHCHUpPps1fF... (returns false)
// bcrypt hash: $2a$10$xxxxx... (returns true)
```

## The Fix

### Script Created: `scripts/verify-and-fix-login.ts`

This script:

1. ✅ Checks if user exists
2. ✅ Identifies hash format (bcrypt vs PBKDF2)
3. ✅ Attempts password verification
4. ✅ Resets password with correct bcrypt hash if verification fails
5. ✅ Provides clear feedback

### Running the Fix

```bash
npx tsx scripts/verify-and-fix-login.ts
```

Output:

```
✅ Password reset successfully!
📧 Email: agustin@astral.cl
🔑 Password: master123
```

## Current User Credentials

After running the fix script, these credentials work:

| Email               | Password  | Role     | Status     |
| ------------------- | --------- | -------- | ---------- |
| agustin@astral.cl   | master123 | MASTER   | ✅ Fixed   |
| admin@astral.cl     | demo123   | ADMIN    | ✅ Working |
| loreto@astral.cl    | demo123   | ADMIN    | ✅ Working |
| profesor@astral.cl  | demo123   | PROFESOR | ✅ Working |
| apoderado@astral.cl | demo123   | PARENT   | ✅ Working |

## Testing Login

### Manual Test

1. Navigate to: `http://localhost:3000/login`
2. Enter credentials:
   - Email: `agustin@astral.cl`
   - Password: `master123`
3. Click "Iniciar Sesión"
4. Should redirect to `/master` dashboard

### Programmatic Test

```bash
# Test authentication directly
npx tsx scripts/verify-master-login.ts
```

## Role-Based Redirects

After successful login, users are redirected based on their role:

```typescript
switch (role) {
  case "MASTER":
    return "/master";
  case "ADMIN":
    return "/admin";
  case "PROFESOR":
    return "/profesor";
  case "PARENT":
    return "/parent";
  case "PUBLIC":
    return needsRegistration ? "/centro-consejo" : "/centro-consejo/dashboard";
}
```

## Preventing This Issue

### Best Practice: Consistent Hashing

**Recommendation**: Always use bcrypt for password hashing in this codebase.

#### For User Creation Scripts

```typescript
import bcryptjs from "bcryptjs";

// ✅ CORRECT - Use bcryptjs directly
const hashedPassword = await bcryptjs.hash(password, 10);

// ❌ AVOID - Don't use crypto.ts hashPassword() for database users
const hashedPassword = await hashPassword(password); // May use PBKDF2
```

#### Updated Scripts

All user creation scripts now use bcryptjs:

- ✅ `scripts/create-demo-users.ts`
- ✅ `scripts/setup-master-account.ts`
- ✅ `scripts/verify-and-fix-login.ts`

### When to Use Each Method

**Use bcrypt (`bcryptjs`):**

- ✅ Creating users in database
- ✅ Server-side password hashing
- ✅ When using Convex authentication

**Use crypto.ts (`hashPassword`):**

- ✅ Edge Runtime environments
- ✅ Temporary/session tokens
- ❌ NOT for database user passwords

## Password Hash Migration

If you encounter users with PBKDF2 hashes:

```bash
# Fix all users at once
npx tsx scripts/migrate-password-hashes.ts

# Or fix specific user
npx tsx scripts/verify-and-fix-login.ts
```

## Security Notes

### Password Storage

- All passwords are hashed before storage
- bcrypt with 10 salt rounds (standard security)
- Passwords never stored in plaintext
- No password fields returned in queries (except for auth verification)

### Session Management

- JWT-based sessions (24 hour expiry)
- Session updates every hour
- Secure cookie configuration
- CSRF protection via NextAuth

### Rate Limiting

Login attempts are rate-limited via `/src/lib/rate-limiter.ts`:

- 5 attempts per 15 minutes
- Returns 429 status when exceeded
- Prevents brute force attacks

## Troubleshooting

### Login Still Fails

1. **Check user exists**:

   ```bash
   npx tsx scripts/check-users.ts
   ```

2. **Verify password format**:

   ```bash
   npx tsx scripts/verify-and-fix-login.ts
   ```

3. **Check environment variables**:

   ```bash
   # Must be set
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_CONVEX_URL=https://...
   ```

4. **Check Convex connection**:
   ```bash
   npx convex dev
   ```

### Common Errors

#### "CredentialsSignin" Error

- **Cause**: Invalid email/password or hash mismatch
- **Fix**: Run `verify-and-fix-login.ts`

#### "User not found" Error

- **Cause**: User doesn't exist in database
- **Fix**: Run `npx tsx scripts/create-demo-users.ts`

#### "Session expired" Error

- **Cause**: JWT expired (> 24 hours)
- **Fix**: Login again

## Future Improvements

### Recommendations

1. **Standardize Hashing**: Remove PBKDF2 option from crypto.ts for user passwords
2. **Hash Migration**: Create automatic migration for PBKDF2 → bcrypt
3. **Password Reset**: Implement email-based password reset
4. **2FA**: Add two-factor authentication for admin/master roles
5. **Audit Logging**: Log all authentication attempts
6. **Session Security**: Implement refresh tokens

### Code Changes Needed

```typescript
// src/lib/crypto.ts
// TODO: Deprecate PBKDF2 for user passwords
// Keep only for temporary tokens

// src/lib/auth-convex.ts
// TODO: Add migration check in authenticateUser()
export async function authenticateUser(email: string, password: string) {
  const user = await client.query(api.users.getUserByEmail, { email });
  if (!user || !user.password) return null;

  // Check if migration needed
  const isBcrypt = /^\$2[abyxz]\$/.test(user.password);
  if (!isBcrypt) {
    // Auto-migrate to bcrypt on successful login
    await migratePasswordHash(user, password);
  }

  // ... rest of verification
}
```

## Summary

✅ **Issue Identified**: PBKDF2/bcrypt hash format mismatch  
✅ **Issue Fixed**: Password reset with bcrypt hashing  
✅ **Script Created**: `verify-and-fix-login.ts` for future use  
✅ **Documentation**: Complete auth system analysis  
✅ **Testing**: Login verified working

**Current Status**: Authentication system fully operational ✨

**Login Credentials**:

- Email: `agustin@astral.cl`
- Password: `master123`
- Role: MASTER
- Dashboard: `/master`
