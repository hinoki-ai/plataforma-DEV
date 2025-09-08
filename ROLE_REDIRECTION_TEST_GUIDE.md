# Role-Based Login Redirection Test Guide

## Overview
This guide tests the complete role-based authentication and redirection system for Manitos Pintadas.

## Test Credentials (Emergency Bypasses)

### MASTER User
- **Email**: `master@manitospintadas.cl`
- **Password**: `master123`
- **Expected Redirect**: `/master` (Master Dashboard)
- **Access Level**: Can access ALL routes (Supreme Authority)

### ADMIN User
- **Email**: `admin@manitospintadas.cl`
- **Password**: `admin123`
- **Expected Redirect**: `/admin` (Admin Dashboard)
- **Access Level**: Can access admin, profesor, and parent routes

### PROFESOR User
- **Email**: `profesor@manitospintadas.cl`
- **Password**: `profesor123`
- **Expected Redirect**: `/profesor` (Teacher Dashboard)
- **Access Level**: Can access profesor routes only

### PARENT User
- **Email**: `parent@manitospintadas.cl`
- **Password**: `parent123`
- **Expected Redirect**: `/parent` (Parent Dashboard)
- **Access Level**: Can access parent routes only

## Test Flow

### 1. Authentication Flow
```
Login Form → NextAuth → auth-success → Role-based Redirect → Dashboard
```

### 2. Middleware Protection
- **Public Routes**: `/`, `/equipo-multidisciplinario`, `/proyecto-educativo`, `/fotos-videos`, `/centro-consejo`, `/calendario-escolar`, `/settings`
- **Protected Routes**: `/admin/*`, `/profesor/*`, `/parent/*`, `/master/*`
- **Access Control**:
  - MASTER: ✅ All routes
  - ADMIN: ✅ Admin, Profesor, Parent routes | ❌ Master routes
  - PROFESOR: ✅ Profesor routes only | ❌ Admin, Parent, Master routes
  - PARENT: ✅ Parent routes only | ❌ Admin, Profesor, Master routes

### 3. Redirection Logic

#### From `/auth-success`
```javascript
switch (role) {
  case 'MASTER': router.replace('/master');
  case 'ADMIN': router.replace('/admin');
  case 'PROFESOR': router.replace('/profesor');
  case 'PARENT':
    if (needsRegistration) router.replace('/centro-consejo');
    else router.replace('/parent');
}
```

#### From Auth Pages (when already logged in)
```javascript
switch (role) {
  case 'MASTER': redirect('/master');
  case 'ADMIN': redirect('/admin');
  case 'PROFESOR': redirect('/profesor');
  case 'PARENT': redirect('/parent');
}
```

## Manual Testing Steps

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Each Role**:
   - Go to `http://localhost:3000/login`
   - Use each test credential
   - Verify correct redirection
   - Verify dashboard loads
   - Try accessing other role routes (should be blocked/redirected)

3. **Test Access Control**:
   - Login as PROFESOR
   - Try to access `/admin` → Should redirect to `/profesor`
   - Try to access `/parent` → Should redirect to `/profesor`
   - Try to access `/master` → Should redirect to `/profesor`

4. **Test Already Logged In**:
   - Login as any role
   - Go to `/login` → Should redirect to appropriate dashboard

## Expected Behaviors

### Successful Login Flow
1. User enters credentials
2. NextAuth authenticates
3. Redirects to `/auth-success`
4. Role detected from session
5. Redirects to appropriate dashboard
6. Dashboard loads with role-specific content

### Access Denied Flow
1. User tries to access unauthorized route
2. Middleware detects role mismatch
3. Redirects to appropriate allowed route
4. User lands on correct dashboard

### Already Logged In Flow
1. Authenticated user visits auth page
2. Middleware redirects to appropriate dashboard
3. User lands on correct dashboard

## Debugging

### Check Console Logs
- Middleware logs access decisions
- Authentication success/failure logs
- Redirection logs

### Common Issues
1. **Stuck on auth-success**: Check role detection
2. **Wrong dashboard**: Verify session role
3. **Access denied**: Check middleware logic
4. **No redirect**: Check auth-success logic

## Files Modified
- `src/lib/auth-prisma.ts` - Added emergency bypasses for all roles
- `src/middleware.ts` - Fixed ADMIN access control logic
- `src/app/auth-success/page.tsx` - Role-based redirection logic