# Institution Support & User Creation Restrictions Update

**Date**: 2025-01-09  
**Status**: ✅ Completed

## Summary

This update implements two major improvements to the platform:

1. **Restricted Profesor User Creation**: Only MASTER and ADMIN users can now create PROFESOR users
2. **Multi-Institution Support**: Added support for multiple institutions with proper user association

## Changes Made

### 1. Authorization System Updates

**File**: `src/lib/authorization.ts`

- **Removed** `Permissions.USERS_CREATE_PARENT` from PROFESOR role permissions
- PROFESOR users can no longer create any other users (including PARENT users)
- Only MASTER and ADMIN roles can create PROFESOR users

**Impact**: Tightens security by ensuring only administrative roles can create teacher accounts.

---

### 2. Database Schema Updates

**File**: `convex/schema.ts`

#### Users Table

- **Added** `institutionId: v.optional(v.id("institutionInfo"))` field
- **Added** `.index("by_institutionId", ["institutionId"])` index

#### SchoolInfo Table

- **Added** `isActive: v.optional(v.boolean())` field for active/inactive institution management
- **Added** `.index("by_name", ["name"])` index
- **Added** `.index("by_isActive", ["isActive"])` index

**Impact**: Enables proper multi-institution support and efficient querying by institution.

---

### 3. Convex Backend Updates

**File**: `convex/institutionInfo.ts`

#### New Queries

- `getAllInstitutions()`: Fetches all active institutions
- `getInstitutionById(institutionId)`: Fetches a specific institution by ID

#### Updated Mutations

- `createOrUpdateSchoolInfo()`: Now sets `isActive: true` by default
- `createInstitution()`: New mutation for creating additional institutions

**File**: `convex/users.ts`

#### Updated Functions

- `createUser()`: Added `institutionId` parameter
- `createUserAction()`: Added `institutionId` parameter
- `updateUser()`: Added `institutionId` parameter
- `registerParentComplete()`: Added `institutionId` parameter

**Impact**: All user creation functions now support institution association.

---

### 4. API Endpoints

#### New Endpoint

**File**: `src/app/api/institutions/route.ts`

```
GET /api/institutions
```

- Returns all active institutions
- Used by frontend to populate institution dropdown

#### Updated Endpoints

**File**: `src/app/api/admin/users/route.ts`

- `POST /api/admin/users`: Now accepts `institutionId` in request body
- Updated validation schema to include `institutionId`

**File**: `src/app/api/parent/register/route.ts`

- `POST /api/parent/register`: Now requires `institutionId` field
- Added `institutionId` to required fields validation

---

### 5. Service Layer Updates

**File**: `src/services/actions/unified-registration.ts`

- `registerParentComplete()`: Added `institutionId` parameter
- Passes `institutionId` to Convex mutation for parent registration

---

### 6. Frontend Updates

**File**: `src/components/UnifiedSignupForm.tsx`

#### Changes

- **Added** `institutionId` field to FormData interface
- **Added** institution dropdown in Step 1 (Personal Information)
- **Added** institutions state to store fetched institutions
- **Added** useEffect to fetch institutions on component mount
- **Added** validation for required `institutionId` field

#### UI Enhancement

New field added to the first step of parent registration:

```tsx
<LabelInputContainer>
  <Label htmlFor="institutionId">Institución Educativa *</Label>
  <Select
    id="institutionId"
    name="institutionId"
    value={formData.institutionId}
    onChange={handleChange}
    error={errors.institutionId}
  >
    <option value="">Selecciona tu institución</option>
    {institutions.map((institution) => (
      <option key={institution._id} value={institution._id}>
        {institution.name}
      </option>
    ))}
  </Select>
</LabelInputContainer>
```

**Impact**: Parents must now select their institution during registration, ensuring proper association.

---

## Migration Notes

### For Existing Data

Existing users in the database will have `institutionId: undefined` until manually updated. Consider running a migration script to:

1. Assign all existing users to the default/primary institution
2. Or prompt admins to assign users to their respective institutions

### Creating Additional Institutions

MASTER or ADMIN users can create new institutions using the Convex dashboard or by calling:

```typescript
await client.mutation(api.schoolInfo.createInstitution, {
  name: "Institution Name",
  mission: "Mission statement",
  vision: "Vision statement",
  address: "Physical address",
  phone: "+1234567890",
  email: "info@institution.edu",
  website: "https://institution.edu",
  institutionType: "PRESCHOOL", // or BASIC_SCHOOL, HIGH_SCHOOL, COLLEGE
});
```

---

## Testing Checklist

- [x] TypeScript compilation passes (`npm run type-check`)
- [x] ESLint passes with zero warnings (`npm run lint`)
- [ ] Test PROFESOR user cannot create PARENT users
- [ ] Test PROFESOR user cannot create other PROFESOR users
- [ ] Test ADMIN can create PROFESOR users
- [ ] Test MASTER can create PROFESOR users
- [ ] Test parent registration with institution selection
- [ ] Test institution dropdown populates correctly
- [ ] Verify existing users can login without institutionId

---

## Security Improvements

1. **Tighter Role Permissions**: PROFESOR role can no longer create any users
2. **Audit Trail**: `createdByAdmin` field tracks which admin created each user
3. **Institution Isolation**: Users are now associated with specific institutions for better data segregation

---

## Future Enhancements

Consider implementing:

1. **Institution-based dashboards**: Show data only for users' assigned institution
2. **Institution-specific settings**: Custom grades, subjects, calendar per institution
3. **Cross-institution reporting**: For MASTER role to view data across all institutions
4. **Institution transfer**: Allow moving users between institutions
5. **Institution subdomain routing**: Route users to institution-specific subdomains

---

## Rollback Plan

If issues arise, revert the following files in this order:

1. `convex/schema.ts` (remove institutionId and new indexes)
2. `src/lib/authorization.ts` (restore USERS_CREATE_PARENT to PROFESOR)
3. `src/components/UnifiedSignupForm.tsx` (remove institution dropdown)
4. `src/app/api/institutions/route.ts` (delete file)
5. All other modified files in reverse order of changes

Run Convex deploy after schema changes: `npx convex deploy`

---

## Related Documentation

- [Authorization System](./docs/AUTHENTICATION_SYSTEM_DOCS.md)
- [Convex Setup Guide](./CONVEX_SETUP_GUIDE.md)
- [User Management](./docs/README.md)
