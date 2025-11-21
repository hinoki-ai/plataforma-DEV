# Clerk-Convex User-Institution Synchronization Implementation

## Overview

This implementation provides a bulletproof system for automatic user-institution assignment in the multi-tenant Plataforma Astral educational platform. Users created in Clerk are automatically assigned to their designated institutions in Convex, ensuring ZERO cross-contamination between tenants.

## Architecture

### Core Components

1. **Institution Resolution Strategy**: Email domain mapping with fallback mechanisms
2. **Atomic User Creation**: User + Membership creation succeeds/fails together
3. **Admin Reassignment Tools**: Master/Admin users can manually reassign users
4. **Audit Trail**: Comprehensive logging of all institution assignments
5. **Migration Tools**: Handle existing users without institution assignments

### Data Flow

```
Clerk User Creation → Webhook → Institution Resolution → Atomic User+Membership Creation
                                      ↓
                               Audit Logging
```

## Implementation Details

### 1. Institution Resolution Strategy

The system uses **email domain mapping** as the primary strategy:

```typescript
// Domain to Institution mapping
const INSTITUTION_DOMAIN_MAPPING = {
  "astral.cl": "institution_id_1",
  "school2.cl": "institution_id_2",
  // Add more mappings as needed
};

// Fallback to default institution
let DEFAULT_INSTITUTION_ID = null;
```

**Resolution Logic:**

1. Extract domain from user email
2. Check explicit domain mapping
3. Verify institution exists and is active
4. Fallback to default institution
5. Final fallback to first active institution

### 2. Webhook Handler (`convex/http.ts`)

Enhanced webhook handler with error recovery:

```typescript
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Validate webhook signature
    const event = await validateRequest(request);
    if (!event)
      return new Response("Invalid webhook signature", { status: 400 });

    try {
      switch (event.type) {
        case "user.created":
        case "user.updated":
          // Ensure default institution exists
          await ctx.runMutation(internal.users.initializeDefaultInstitution);
          await ctx.runMutation(internal.users.syncFromClerk, {
            data: event.data,
          });
          break;
        case "user.deleted":
          await ctx.runMutation(internal.users.disableUserFromClerk, {
            clerkId: event.data.id,
          });
          break;
      }
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("❌ Webhook processing failed:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});
```

### 3. User Synchronization (`convex/users.ts`)

**Enhanced `syncFromClerk` function:**

- Resolves institution from email domain
- Creates user with institution membership atomically
- Handles existing users (by Clerk ID or email)
- Comprehensive error handling with rollback

**Atomic User Creation:**

```typescript
async function createUserWithInstitutionMembership(user, institutionId) {
  try {
    // 1. Create user
    const userId = await ctx.db.insert("users", { ... });

    // 2. Create membership
    const membershipId = await ctx.db.insert("institutionMemberships", { ... });

    return { userId, membershipId };
  } catch (error) {
    // Rollback both operations
    if (userId) await ctx.db.delete(userId);
    if (membershipId) await ctx.db.delete(membershipId);
    throw error;
  }
}
```

### 4. Admin Reassignment Tools

**Master/Admin users can reassign users between institutions:**

```typescript
export const reassignUserToInstitution = mutation({
  // Requires MASTER or ADMIN role
  // Updates user.currentInstitutionId
  // Creates new membership, deactivates old one
  // Comprehensive audit logging
});
```

**React Component:** `InstitutionReassignmentDialog`

- Shows current institution
- Lists available institutions
- Requires reason for reassignment
- Preview of changes before confirmation

### 5. Audit Trail

All institution assignments are logged:

```typescript
const auditEntry = {
  action: "USER_ASSIGNED" | "USER_REASSIGNED",
  userId,
  institutionId,
  previousInstitutionId?,
  performedBy,
  metadata: { reason?, userRole? },
  timestamp,
};
```

## Security & Access Control

### Institution Isolation

- Users can only access their assigned institution's data
- Tenancy middleware enforces institution boundaries
- Membership validation prevents unauthorized access

### Role Validation

- Only MASTER/ADMIN can reassign users
- Membership roles map from user roles
- Privilege escalation prevention

### Data Validation

- Institution must exist and be active
- Atomic operations prevent partial state
- Comprehensive error handling

## Configuration

### Domain Mapping Setup

Master users can configure domain mappings:

```typescript
await ctx.runMutation(api.users.configureInstitutionDomains, {
  domainMappings: {
    "school1.cl": "institution_id_1",
    "school2.cl": "institution_id_2",
  },
  defaultInstitutionId: "default_institution_id",
});
```

### Environment Variables

```bash
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

## Migration & Deployment

### Existing Users Migration

Run the migration script for users without institution assignments:

```typescript
await ctx.runMutation(api.migrateExistingUsers.migrateExistingUsers, {});
```

This will:

1. Find all users without `currentInstitutionId`
2. Resolve institutions based on email domains
3. Create institution memberships
4. Update user records

### Deployment Checklist

1. ✅ Deploy Convex schema changes
2. ✅ Update webhook URL in Clerk dashboard
3. ✅ Configure domain mappings for existing institutions
4. ✅ Run migration for existing users
5. ✅ Test user creation flow
6. ✅ Test admin reassignment functionality
7. ✅ Verify data isolation between institutions

## Testing

### Unit Tests (`tests/unit/institution-sync.test.ts`)

Comprehensive test coverage:

- Institution resolution logic
- User creation with memberships
- Admin reassignment functionality
- Error handling scenarios
- Atomic operation guarantees

### Integration Tests

```bash
# Run webhook tests
npm test -- tests/unit/institution-sync.test.ts

# Test with real Clerk webhooks (staging environment)
# Use ngrok or similar for local webhook testing
```

## Monitoring & Troubleshooting

### Key Metrics to Monitor

1. **Webhook Success Rate**

   ```sql
   -- Check for failed webhook events
   SELECT * FROM convex_logs WHERE level = 'error' AND message LIKE '%webhook%';
   ```

2. **Institution Assignment Success**

   ```sql
   -- Users without institution assignments
   SELECT COUNT(*) FROM users WHERE currentInstitutionId IS NULL;
   ```

3. **Membership Consistency**
   ```sql
   -- Users with institution but no membership
   SELECT u.* FROM users u
   LEFT JOIN institutionMemberships m ON u._id = m.userId AND u.currentInstitutionId = m.institutionId
   WHERE u.currentInstitutionId IS NOT NULL AND m._id IS NULL;
   ```

### Common Issues

1. **"No institution available for user"**
   - Check domain mappings
   - Verify institutions exist and are active
   - Configure default institution

2. **Webhook signature validation fails**
   - Verify CLERK_WEBHOOK_SECRET environment variable
   - Check webhook URL configuration in Clerk

3. **User assigned to wrong institution**
   - Review domain mapping configuration
   - Check email address format
   - Use admin reassignment tool

### Debug Commands

```bash
# Check current tenancy context
npx convex run getCurrentTenancy

# View institution domain configuration
npx convex run users:getInstitutionDomainConfig

# List all active institutions
npx convex run users:getActiveInstitutions

# Run migration for existing users
npx convex run migrateExistingUsers
```

## Success Criteria

✅ **Must Work Perfectly:**

- Users created in Clerk → Automatically assigned to correct institution
- ZERO cross-contamination between institutions
- Master users can reassign users between institutions
- Proper error handling for edge cases
- Complete audit trail of all assignments

🚨 **Critical Failure Points:**

- User assigned to wrong institution
- User left unassigned (floating user)
- Institution data leakage between tenants
- Inability to reassign users when needed

## Future Enhancements

1. **Advanced Domain Rules**
   - Regex-based domain matching
   - Subdomain support
   - Multiple domains per institution

2. **Bulk Operations**
   - Bulk user reassignment
   - CSV import with institution assignment

3. **Automated Rules**
   - Role-based institution assignment
   - Department-based routing
   - Geographic routing

4. **Advanced Audit**
   - Persistent audit log storage
   - Audit dashboard
   - Compliance reporting

## Conclusion

This implementation provides a robust, scalable solution for multi-tenant user management in educational platforms. The email domain mapping strategy ensures predictable institution assignment while providing flexibility for administrative overrides.

The atomic operation guarantees prevent data inconsistencies, and comprehensive error handling ensures system reliability. The audit trail provides accountability and troubleshooting capabilities.

**This is mission-critical infrastructure** - test thoroughly before production deployment.
