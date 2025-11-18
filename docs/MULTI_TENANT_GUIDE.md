# Multi-Tenant System Guide

## Overview

Plataforma Astral is a **multi-tenant** educational management platform. This means the system supports multiple institutions (schools) running on the same instance, with complete data isolation between institutions.

## Current Institutions

The platform currently supports **2 institutions**:

1. **Plataforma Astral**
   - Institution Type: PRESCHOOL

2. **Manitos Pintadas** - Escuela Especial de Lenguaje

## Architecture

### Core Concepts

#### 1. Institutions (`institutionInfo` table)

Each institution has its own:

- Name, mission, vision
- Contact information
- Institution type (PRESCHOOL, BASIC_SCHOOL, HIGH_SCHOOL, etc.)
- Billing and configuration settings
- Active/inactive status

#### 2. Institution Memberships (`institutionMemberships` table)

Users are linked to institutions through memberships:

- **Role**: ADMIN, PROFESOR, PARENT, STAFF, MENTOR
- **Status**: INVITED, ACTIVE, SUSPENDED, LEFT
- **Regular users belong to ONE institution only** - each user has a single active membership
- **MASTER users can access any institution** - they don't need memberships
- Each membership tracks when the user joined, last accessed, etc.

#### 3. User Current Institution (`users.currentInstitutionId`)

- Each user has a `currentInstitutionId` field
- This determines which institution context the user sees
- Regular users are locked to their single institution membership
- MASTER users can switch between any institution

#### 4. Data Isolation

All data tables include an `institutionId` field:

- `students`, `courses`, `meetings`, `calendarEvents`, `grades`, etc.
- All queries filter by `institutionId` to ensure data isolation
- The tenancy system enforces this automatically

### Tenancy System

The tenancy system (`convex/tenancy.ts`) provides:

#### `requireCurrentInstitution()` Function

- Automatically gets the user's current institution
- Validates membership and permissions
- Returns a `TenancyContext` with:
  - User info
  - Institution info
  - Membership info
  - User's role in the institution
  - Whether user is a MASTER (can access any institution)

#### `tenantQuery()` and `tenantMutation()`

- Wrappers that automatically handle tenancy
- Ensures all operations are scoped to the user's current institution
- Validates permissions based on membership roles

## Adding a New Institution

### Using the Script

To add "Manitos Pintadas":

```bash
npx tsx scripts/add-manitos-pintadas.ts
```

### Manually via Convex Dashboard

1. Go to Convex Dashboard → Functions
2. Run `institutionInfo.createInstitution` with:
   ```json
   {
     "name": "Manitos Pintadas",
     "mission": "...",
     "vision": "...",
     "address": "...",
     "phone": "...",
     "email": "contacto@manitospintadas.cl",
     "website": "...",
     "institutionType": "PRESCHOOL",
     "isActive": true
   }
   ```

### Adding Users to an Institution

After creating the institution, create memberships:

1. **Create the user** (if doesn't exist):
   - Use `users.createUser` with `institutionId` parameter
   - Or use Clerk for OAuth users

2. **Create membership**:
   - Insert into `institutionMemberships` table:
     ```json
     {
       "institutionId": "<institution-id>",
       "userId": "<user-id>",
       "role": "ADMIN" | "PROFESOR" | "PARENT",
       "status": "ACTIVE",
       "joinedAt": <timestamp>,
       "createdAt": <timestamp>,
       "updatedAt": <timestamp>
     }
     ```

3. **Set user's current institution**:
   - Use `users.updateUser` to set `currentInstitutionId`
   - Or use `institutionInfo.switchUserInstitution`

## Switching Between Institutions

### For Users with Multiple Memberships

Users can switch their current institution if they have active memberships in multiple institutions.

#### Using Convex Functions

```typescript
// Switch institution
await client.mutation(api.institutionInfo.switchUserInstitution, {
  userId: user._id,
  institutionId: targetInstitutionId,
});

// Get user's available institutions
const userInstitutions = await client.query(
  api.institutionInfo.getUserActiveInstitutions,
  { userId: user._id },
);
```

#### Validations

The `switchUserInstitution` mutation:

- ✅ Verifies user has an active membership in target institution
- ✅ Verifies institution is active
- ✅ Updates `lastAccessAt` in membership
- ✅ MASTER users can switch to any institution (bypass membership check)

## API Endpoints

### Institution Queries

- `institutionInfo.getAllInstitutions` - Get all institutions
- `institutionInfo.getInstitutionById` - Get specific institution
- `institutionInfo.getUserInstitutions` - Get all institutions user belongs to
- `institutionInfo.getUserActiveInstitutions` - Get user's active institutions only

### Institution Mutations

- `institutionInfo.createInstitution` - Create new institution
- `institutionInfo.updateInstitution` - Update institution details
- `institutionInfo.switchUserInstitution` - Switch user's current institution
- `institutionInfo.deleteInstitution` - Delete institution (use with caution!)

## Best Practices

### 1. Data Isolation

- Always use `tenantQuery` or `tenantMutation` for data operations
- Never query across institutions without explicit `institutionId` filter
- Use `requireCurrentInstitution()` to get the current context

### 2. User Management

- When creating users, always specify `institutionId`
- Create memberships immediately after user creation
- Set `currentInstitutionId` for new users

### 3. MASTER Role

- MASTER users can access any institution
- Use for platform administrators
- Should be kept to minimum (1-2 users max)

### 4. Membership Lifecycle

- **INVITED**: User has been invited but hasn't joined
- **ACTIVE**: User is an active member
- **SUSPENDED**: Temporarily suspended (access denied)
- **LEFT**: User left the institution (soft delete)

## Troubleshooting

### User Can't See Data

1. Check `users.currentInstitutionId` is set
2. Verify membership exists and status is "ACTIVE"
3. Check institution `isActive` is true

### User Can't Switch Institutions

1. Verify membership exists in target institution
2. Check membership status is "ACTIVE"
3. Verify institution is active

### Data Shows from Wrong Institution

- Check queries are using `institutionId` filter
- Ensure using `tenantQuery`/`tenantMutation`
- Verify `requireCurrentInstitution` is being used

## Scripts

- `scripts/add-manitos-pintadas.ts` - Add Manitos Pintadas institution
- `scripts/add-real-institution.ts` - Add Plataforma Astral institution

## Related Files

- `convex/tenancy.ts` - Core tenancy system
- `convex/institutionInfo.ts` - Institution management
- `convex/schema.ts` - Database schema (see `institutionInfo` and `institutionMemberships` tables)
- `convex/users.ts` - User management with institution support
