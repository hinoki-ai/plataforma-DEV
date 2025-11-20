# Role-Based Access Control System

## Overview

This application implements a comprehensive role-based access control (RBAC) system with 5 distinct user roles. The system includes special developer tools for testing different user experiences.

## User Roles

### 1. **MASTER** (Developer)

- **Purpose**: Full system access for development and testing
- **Permissions**: Complete access to all features
- **Special Features**: Can switch between all roles for testing
- **Display Name**: "Desarrollador"
- **Test Account**: `agustinaramac@gmail.com` / `madmin123`

### 2. **ADMIN** (Administrator)

- **Purpose**: School administration and management
- **Permissions**: User management, planning, calendar, documents
- **Display Name**: "Administrador"
- **Test Account**: `admin@test.com` / `admin123`

### 3. **PROFESOR** (Teacher)

- **Purpose**: Teaching and classroom management
- **Permissions**: Lesson planning, student management, calendar
- **Display Name**: "Profesor"
- **Test Account**: `profesor@test.com` / `teacher123`

### 4. **PARENT** (Guardian)

- **Purpose**: Parent/guardian access to student information
- **Permissions**: View student progress, communications, meetings
- **Display Name**: "Padre/Apoderado"
- **Test Account**: `parent@test.com` / `parent123`

### 5. **PUBLIC** (Anonymous)

- **Purpose**: Public visitors and unregistered users
- **Permissions**: View public information only
- **Display Name**: "Público"
- **Special**: No database entries required

## Role Switching Feature (MASTER Only)

### Purpose

Allows developers to test the application from different user perspectives without creating multiple accounts or logging in/out repeatedly.

### How to Use

1. **Login as MASTER**

   ```bash
   Email: agustinaramac@gmail.com
   Password: madmin123
   ```

2. **Access Role Switcher**
   - Located in the bottom-left user section of the sidebar
   - Shows current role with crown icon
   - Dropdown menu with all available roles

3. **Switch Roles**
   - Click "Cambiar" button
   - Select desired role from dropdown
   - Page will refresh automatically
   - Navigation and permissions update immediately

4. **Reset to MASTER**
   - "Volver a MASTER" button appears when switched
   - Returns to original MASTER role instantly

### Visual Indicators

- **Current Role**: Displayed in user section
- **Test Mode Badge**: Shows when role is switched
- **Original Role**: Shows previous role when switched
- **Role Icons**: Crown (MASTER), Shield (ADMIN), Graduation Cap (PROFESOR), Users (PARENT)

## Technical Implementation

### Core Components

#### 1. Database Schema (`prisma/schema.prisma`)

```prisma
enum UserRole {
  MASTER
  ADMIN
  PROFESOR
  PARENT
  PUBLIC
}
```

#### 2. Authorization System (`src/lib/authorization.ts`)

- Permission-based access control
- Role-specific permission sets
- Type-safe permission checking

#### 3. Proxy Protection (`src/proxy.ts`)

- Route-level access control
- Automatic redirects based on role
- Session validation

#### 4. Role Utilities (`src/lib/role-utils.ts`)

- Role access checking functions
- Permission helpers
- Navigation filtering

#### 5. Role Switcher Component (`src/components/auth/RoleSwitcher.tsx`)

- UI for role switching
- Real-time role updates
- Error handling and feedback

#### 6. Role Switching Hook (`src/hooks/useRoleSwitching.ts`)

- State management for role switching
- API integration
- Error handling

#### 7. API Endpoint (`src/app/api/role-switch/route.ts`)

- Secure role switching endpoint
- Audit logging
- Session management

### Security Features

1. **Authorization**: Only MASTER users can switch roles
2. **Validation**: Target roles must be valid
3. **Audit Logging**: All role switches are logged with timestamps and IP addresses
4. **Session Management**: Proper session updates after role switch
5. **Error Handling**: Comprehensive error handling and user feedback

### Route Protection

Routes are automatically protected based on user roles:

```
/admin/*       → MASTER, ADMIN only
/profesor/*    → MASTER, ADMIN, PROFESOR
/parent/*      → MASTER, ADMIN, PROFESOR, PARENT
/public/*      → All users (including anonymous)
```

## Testing

### Automated Tests

Run role switching tests:

```bash
npm run test:role-switching
```

### Manual Testing

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Test Role Switching**
   - Login as MASTER
   - Switch to different roles
   - Verify navigation changes
   - Test permissions
   - Reset to MASTER

3. **Test Accounts Creation**

   ```bash
   npm run create:test-users
   ```

## Best Practices

### For Developers

1. **Always use permission checks** instead of direct role comparisons
2. **Test with different roles** regularly
3. **Document role-specific features**
4. **Use the role utilities** for consistent behavior

### For Security

1. **Never expose role switching** to non-MASTER users
2. **Always validate permissions** on server-side
3. **Log all role changes** for audit purposes
4. **Use secure session management**

### For UX

1. **Show clear role indicators** in the UI
2. **Provide feedback** for role switches
3. **Handle errors gracefully**
4. **Maintain consistent navigation** across roles

## Troubleshooting

### Common Issues

1. **Role switch not working**
   - Check if user is MASTER
   - Verify API endpoint is accessible
   - Check browser console for errors

2. **Navigation not updating**
   - Page refresh may be required
   - Check session storage
   - Verify middleware configuration

3. **Permissions not applying**
   - Check authorization configuration
   - Verify database user role
   - Test with different accounts

### Debug Mode

Enable debug logging:

```typescript
const logger = Logger.getInstance("RoleSwitchAPI");
// Logs are available in server console
```

## Future Enhancements

- **Role-based themes**: Different UI themes per role
- **Permission overrides**: Temporary permission grants
- **Role expiration**: Time-limited role switches
- **Audit dashboard**: View all role switching activity
- **Bulk role management**: Admin tools for role assignment

---

**Last Updated**: December 2024
**Maintainer**: Agustin (MASTER)
