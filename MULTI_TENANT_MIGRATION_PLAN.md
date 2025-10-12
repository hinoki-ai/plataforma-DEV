# Multi-Tenant SaaS Migration Plan

**Created:** 2025-01-08
**Status:** Planning Phase
**Estimated Effort:** 4-6 weeks of development
**Risk Level:** High (Major architectural change)

---

## Executive Summary

Transform the single-tenant "Manitos Pintadas" school management system into a multi-tenant SaaS platform where:

- **Each school/institution has their own domain** (subdomain or custom domain)
- **All schools share the same Convex database** with strict tenant isolation
- **Complete data segregation** - schools never see each other's data
- **Domain-based tenant detection** - automatic tenant identification from URL
- **Unified platform** - single codebase, single deployment, multiple schools

---

## Architecture Approaches

### Option 1: Subdomain-Based Multi-Tenancy ⭐ **RECOMMENDED**

**Structure:**
```
main.manitospintadas.cl        → Platform landing page
school1.manitospintadas.cl     → School 1 instance  
school2.manitospintadas.cl     → School 2 instance
admin.manitospintadas.cl       → Super admin dashboard
```

**Pros:**
- ✅ Easiest to implement and maintain
- ✅ Single wildcard SSL certificate (*.manitospintadas.cl)
- ✅ No DNS configuration per school
- ✅ Easy tenant extraction from hostname
- ✅ Vercel/Next.js native support for wildcard domains

**Cons:**
- ❌ Less professional than custom domains
- ❌ All schools share parent brand
- ❌ Harder to white-label

**Implementation:**
```typescript
// Extract tenant from subdomain
function getTenantFromRequest(req: NextRequest): string | null {
  const hostname = req.headers.get('host') || '';
  const parts = hostname.split('.');
  
  // school1.manitospintadas.cl → "school1"
  if (parts.length >= 3 && parts[1] === 'manitospintadas') {
    return parts[0];
  }
  return null;
}
```

---

### Option 2: Custom Domain Multi-Tenancy

**Structure:**
```
manitospintadas.cl                 → Platform landing page
www.escuelalosalamos.cl           → School 1 (custom domain)
www.colegiosanmiguel.cl           → School 2 (custom domain)
admin.manitospintadas.cl          → Super admin dashboard
```

**Pros:**
- ✅ Professional custom branding per school
- ✅ Full white-label capability
- ✅ Schools own their domain identity

**Cons:**
- ❌ Complex DNS management (CNAME per school)
- ❌ SSL certificate per domain (or managed by Vercel)
- ❌ Requires domain mapping table in database
- ❌ More complex tenant detection logic
- ❌ Higher infrastructure complexity

**Implementation:**
```typescript
// Map custom domain to tenant
function getTenantFromRequest(req: NextRequest): string | null {
  const hostname = req.headers.get('host') || '';
  
  // Query database for domain mapping
  const tenant = await db.tenants.findFirst({
    where: { 
      OR: [
        { customDomain: hostname },
        { subdomain: hostname.split('.')[0] }
      ]
    }
  });
  
  return tenant?.slug || null;
}
```

---

### Option 3: Hybrid Approach ⭐ **BEST LONG-TERM**

**Structure:**
```
# Default subdomains (immediate launch)
school1.manitospintadas.cl     → School 1 subdomain
school2.manitospintadas.cl     → School 2 subdomain

# Optional custom domains (premium feature)
www.escuelalosalamos.cl       → School 1 custom domain (maps to school1)
school2.manitospintadas.cl    → School 2 (still using subdomain)
```

**Pros:**
- ✅ Easy initial setup with subdomains
- ✅ Premium feature: custom domain upgrades
- ✅ Flexibility for schools
- ✅ Additional revenue stream (premium branding)

**Cons:**
- ❌ Most complex implementation
- ❌ Requires both routing systems

**Recommendation:** Start with **Option 1** (subdomain), implement **Option 3** (hybrid) in Phase 2

---

## Database Schema Changes

### Phase 1: Add Tenant Model & Relationships

#### New `tenants` Table (Core)

```typescript
// convex/schema.ts
tenants: defineTable({
  // Identity
  slug: v.string(),              // "school1", "colegiosanmiguel" 
  name: v.string(),              // "Colegio San Miguel"
  subdomain: v.string(),         // "school1" (unique)
  customDomain: v.optional(v.string()), // "www.colegiosanmiguel.cl" (unique)
  
  // Branding
  logoUrl: v.optional(v.string()),
  primaryColor: v.optional(v.string()),
  secondaryColor: v.optional(v.string()),
  
  // Configuration
  institutionType: v.union(
    v.literal("PRESCHOOL"),
    v.literal("BASIC_SCHOOL"),
    v.literal("HIGH_SCHOOL"),
    v.literal("COLLEGE"),
  ),
  timezone: v.string(),          // "America/Santiago"
  locale: v.string(),            // "es-CL"
  
  // Features & Limits
  maxUsers: v.number(),          // 100, 500, unlimited
  maxStudents: v.number(),
  enabledFeatures: v.array(v.string()), // ["meetings", "planning", "voting"]
  
  // Subscription & Billing
  plan: v.union(
    v.literal("FREE"),
    v.literal("BASIC"),
    v.literal("PROFESSIONAL"),
    v.literal("ENTERPRISE"),
  ),
  subscriptionStatus: v.union(
    v.literal("TRIAL"),
    v.literal("ACTIVE"),
    v.literal("SUSPENDED"),
    v.literal("CANCELLED"),
  ),
  trialEndsAt: v.optional(v.number()),
  billingEmail: v.string(),
  
  // Contact & Owner
  ownerUserId: v.id("users"),    // Primary admin
  contactEmail: v.string(),
  contactPhone: v.string(),
  
  // Status
  isActive: v.boolean(),
  onboardingCompleted: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_subdomain", ["subdomain"])
  .index("by_customDomain", ["customDomain"])
  .index("by_isActive", ["isActive"])
  .index("by_ownerUserId", ["ownerUserId"])
```

#### Update ALL Existing Tables with `tenantId`

Every data table needs tenant isolation:

```typescript
// Example: users table
users: defineTable({
  // ADD THIS FIELD TO EVERY TABLE
  tenantId: v.id("tenants"),     // 🔥 CRITICAL: Tenant isolation
  
  // ... existing fields ...
  name: v.optional(v.string()),
  email: v.string(),
  // etc.
})
  .index("by_email", ["email"])
  .index("by_tenantId", ["tenantId"])  // 🔥 CRITICAL: Tenant queries
  .index("by_tenant_email", ["tenantId", "email"]) // Compound index
  .index("by_tenant_role", ["tenantId", "role"])
```

**Tables Requiring `tenantId`:**
- ✅ `users` - Users belong to one school
- ✅ `students` - Students belong to one school
- ✅ `meetings` - Meetings within school
- ✅ `calendarEvents` - School-specific calendar
- ✅ `planningDocuments` - Teacher plans per school
- ✅ `teamMembers` - Staff per school
- ✅ `photos` - School photo galleries
- ✅ `videos` - School videos
- ✅ `votes` - School voting system
- ✅ `activities` - School activities
- ✅ `notifications` - User notifications (inherit from user's tenant)
- ❌ `accounts`, `sessions`, `verificationTokens` - NextAuth tables (global)

---

### Phase 2: Super Admin System

#### Super Admin Users (Platform Management)

```typescript
// Extend users table
users: defineTable({
  tenantId: v.optional(v.id("tenants")), // Optional for super admins
  
  role: v.union(
    v.literal("SUPER_ADMIN"),  // 🆕 Platform administrator
    v.literal("MASTER"),       // School master admin
    v.literal("ADMIN"),        // School admin
    v.literal("PROFESOR"),
    v.literal("PARENT"),
    v.literal("PUBLIC"),
  ),
  
  isSuperAdmin: v.boolean(),   // 🆕 Quick check
  managedTenants: v.optional(v.array(v.id("tenants"))), // Multi-tenant access
  
  // ... rest of fields
})
```

#### Audit Logs (Critical for Multi-Tenant)

```typescript
auditLogs: defineTable({
  tenantId: v.optional(v.id("tenants")), // Null for platform actions
  userId: v.id("users"),
  action: v.string(),              // "user.created", "tenant.updated"
  entityType: v.string(),          // "user", "tenant", "meeting"
  entityId: v.string(),
  changes: v.optional(v.any()),    // Before/after JSON
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_tenantId", ["tenantId"])
  .index("by_userId", ["userId"])
  .index("by_action", ["action"])
  .index("by_createdAt", ["createdAt"])
```

---

## Middleware Changes (Tenant Detection)

### Current Middleware
```typescript
// src/middleware.ts (current)
export default async function middleware(req: NextRequest) {
  const session = await getMiddlewareAuth(req);
  const userRole = session?.user?.role;
  
  // Check role-based access
  // ...
}
```

### New Multi-Tenant Middleware

```typescript
// src/middleware.ts (new)
export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  
  // 1. TENANT DETECTION
  const tenant = await getTenantFromHostname(hostname);
  
  if (!tenant) {
    // Unknown domain → redirect to platform landing
    return NextResponse.redirect(new URL('https://manitospintadas.cl'));
  }
  
  if (!tenant.isActive) {
    // Suspended/inactive tenant
    return NextResponse.rewrite(new URL('/suspended', req.url));
  }
  
  // 2. AUTHENTICATION (with tenant context)
  const session = await getMiddlewareAuth(req);
  
  // 3. VALIDATE USER BELONGS TO THIS TENANT
  if (session?.user && session.user.tenantId !== tenant.id) {
    // User logged in but wrong school
    return NextResponse.redirect(new URL('/login?error=wrong_school', req.url));
  }
  
  // 4. ROLE-BASED AUTHORIZATION (existing logic)
  // ... existing middleware logic
  
  // 5. INJECT TENANT INTO REQUEST HEADERS
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-slug', tenant.slug);
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  return addSecurityHeaders(response);
}

// Helper function
async function getTenantFromHostname(hostname: string): Promise<Tenant | null> {
  const parts = hostname.split('.');
  
  // Subdomain: school1.manitospintadas.cl
  if (parts.length >= 3 && parts[1] === 'manitospintadas') {
    const subdomain = parts[0];
    return await convex.query(api.tenants.getBySubdomain, { subdomain });
  }
  
  // Custom domain: www.escuelalosalamos.cl
  return await convex.query(api.tenants.getByCustomDomain, { domain: hostname });
}
```

---

## Service Layer Updates (Query/Mutation Changes)

### Current Pattern (Single-Tenant)
```typescript
// src/services/actions/meetings.ts (current)
export async function getMeetings() {
  const client = getConvexClient();
  return await client.query(api.meetings.list, {});
}
```

### New Pattern (Multi-Tenant)

```typescript
// src/services/actions/meetings.ts (new)
import { getTenantContext } from '@/lib/tenant-context';

export async function getMeetings() {
  const { tenantId } = getTenantContext(); // From request headers
  const client = getConvexClient();
  
  return await client.query(api.meetings.list, {
    tenantId, // 🔥 ALWAYS pass tenantId
  });
}
```

### Convex Query Updates

```typescript
// convex/meetings.ts (current)
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("meetings").collect();
  },
});

// convex/meetings.ts (new - multi-tenant)
export const list = query({
  args: {
    tenantId: v.id("tenants"), // 🔥 Required argument
  },
  handler: async (ctx, args) => {
    // Tenant isolation enforcement
    return await ctx.db
      .query("meetings")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});
```

**🚨 CRITICAL:** Every Convex query/mutation MUST filter by `tenantId` to prevent data leaks

---

## Authentication System Updates

### Current Authentication (Single-Tenant)
```typescript
// User logs in → gets role → redirect to dashboard
```

### New Authentication (Multi-Tenant)

```typescript
// src/lib/auth.ts updates
export const authOptions: NextAuthConfig = {
  callbacks: {
    async signIn({ user, account }) {
      const hostname = req.headers.get('host');
      const tenant = await getTenantFromHostname(hostname);
      
      if (!tenant) return false;
      
      // Check if user belongs to this tenant
      const dbUser = await findUserByEmail(user.email!);
      
      if (dbUser && dbUser.tenantId !== tenant.id) {
        // Wrong school
        return `/login?error=wrong_tenant`;
      }
      
      return true;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId; // 🔥 Add tenant to JWT
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      session.user.tenantId = token.tenantId; // 🔥 Add to session
      session.user.role = token.role;
      return session;
    },
  },
};
```

---

## Tenant Context System

### Create Tenant Context Provider

```typescript
// src/lib/tenant-context.ts
import { headers } from 'next/headers';

export function getTenantContext() {
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id');
  const tenantSlug = headersList.get('x-tenant-slug');
  
  if (!tenantId) {
    throw new Error('Tenant context not found - middleware may not be running');
  }
  
  return {
    tenantId,
    tenantSlug,
  };
}

// Client-side hook
export function useTenant() {
  const session = useSession();
  return {
    tenantId: session?.data?.user?.tenantId,
    // Fetch full tenant data if needed
  };
}
```

---

## Tenant Onboarding Flow

### Step 1: Landing Page (Public)
```
https://manitospintadas.cl
- Marketing site
- Features, pricing
- "Start Free Trial" CTA
```

### Step 2: Signup Form
```
https://manitospintadas.cl/signup

Form:
- School name: "Colegio San Miguel"
- Subdomain: "sanmiguel" (check availability)
  → Creates: sanmiguel.manitospintadas.cl
- Admin name: "Juan Pérez"
- Admin email: admin@colegiosanmiguel.cl
- Password
- Institution type: dropdown
- Phone number
```

### Step 3: Tenant Creation (Backend)
```typescript
// Server Action: createTenant
1. Validate subdomain availability
2. Create tenant record
3. Create owner user (ADMIN role)
4. Create default school info
5. Send welcome email
6. Redirect to: https://sanmiguel.manitospintadas.cl/onboarding
```

### Step 4: Onboarding Wizard (Tenant-Specific)
```
https://sanmiguel.manitospintadas.cl/onboarding

Steps:
1. School Information (address, phone, website)
2. Upload logo
3. Configure grades/levels
4. Invite staff (bulk email invites)
5. Tour of features
6. Complete setup → Dashboard
```

---

## Super Admin Dashboard

### Routes
```
https://admin.manitospintadas.cl
```

### Features
- **Tenant Management**
  - List all schools
  - Create/suspend/delete tenants
  - View usage statistics
  - Manage subscriptions
  
- **Analytics Dashboard**
  - Total users across platform
  - Active tenants
  - Revenue metrics
  - Feature usage

- **User Management**
  - Search users across all tenants
  - Impersonate users (for support)
  - Reset passwords
  
- **System Health**
  - Database stats
  - Error logs
  - Performance monitoring

---

## Migration Strategy (Existing Data)

### Current Situation
- Single tenant (Manitos Pintadas)
- Existing users, meetings, calendar, etc.

### Migration Steps

```typescript
// scripts/migrate-to-multi-tenant.ts

async function migrateToMultiTenant() {
  // 1. Create default tenant for existing school
  const defaultTenant = await createTenant({
    slug: 'manitos-pintadas',
    name: 'Manitos Pintadas',
    subdomain: 'main',
    // ... other fields
  });
  
  // 2. Update all existing records with tenantId
  await updateAllUsers({ tenantId: defaultTenant.id });
  await updateAllStudents({ tenantId: defaultTenant.id });
  await updateAllMeetings({ tenantId: defaultTenant.id });
  // ... for all tables
  
  // 3. Verify data integrity
  await verifyTenantIsolation();
}
```

---

## Implementation Phases (Recommended)

### 🏗️ Phase 1: Foundation (Week 1-2)
- [ ] Add `tenants` table to schema
- [ ] Create tenant detection middleware
- [ ] Add `tenantId` to `users` table only
- [ ] Implement tenant context system
- [ ] Create tenant onboarding flow
- [ ] Build super admin dashboard (basic)
- [ ] **Test with 2 test tenants**

### 🔒 Phase 2: Data Isolation (Week 3-4)
- [ ] Add `tenantId` to all remaining tables
- [ ] Update all Convex queries with tenant filters
- [ ] Update all Convex mutations with tenant checks
- [ ] Implement audit logging
- [ ] Add tenant-scoped authentication
- [ ] **Comprehensive isolation testing**

### 🎨 Phase 3: Customization (Week 5)
- [ ] Tenant branding (logo, colors)
- [ ] Tenant settings page
- [ ] Custom domain support (basic)
- [ ] Email templates with tenant branding

### 🚀 Phase 4: Platform Features (Week 6)
- [ ] Billing integration (Stripe?)
- [ ] Usage analytics per tenant
- [ ] Tenant invitation system
- [ ] Data export/backup per tenant
- [ ] **Load testing with 10+ tenants**

---

## Security Considerations

### Critical Security Rules

1. **NEVER trust client-side tenantId**
   ```typescript
   // ❌ WRONG
   const tenantId = searchParams.get('tenantId');
   
   // ✅ CORRECT
   const { tenantId } = getTenantContext(); // From middleware
   ```

2. **ALWAYS filter by tenantId in queries**
   ```typescript
   // ❌ WRONG
   const meetings = await db.query("meetings").collect();
   
   // ✅ CORRECT
   const meetings = await db.query("meetings")
     .withIndex("by_tenantId", q => q.eq("tenantId", tenantId))
     .collect();
   ```

3. **Validate tenant ownership on mutations**
   ```typescript
   export const updateMeeting = mutation({
     args: { meetingId: v.id("meetings"), tenantId: v.id("tenants") },
     handler: async (ctx, args) => {
       const meeting = await ctx.db.get(args.meetingId);
       
       if (meeting.tenantId !== args.tenantId) {
         throw new Error("Unauthorized: Tenant mismatch");
       }
       
       // ... update logic
     },
   });
   ```

4. **Row-Level Security in Convex**
   - Every query MUST have tenant filter
   - Use helper functions to enforce
   - Add automated tests for isolation

---

## Testing Strategy

### Tenant Isolation Tests
```typescript
describe('Tenant Isolation', () => {
  it('should not expose School A data to School B users', async () => {
    // Create 2 tenants
    const tenantA = await createTenant({ slug: 'school-a' });
    const tenantB = await createTenant({ slug: 'school-b' });
    
    // Create meeting in School A
    const meetingA = await createMeeting({ tenantId: tenantA.id });
    
    // Try to fetch from School B context
    const meetingsB = await getMeetings({ tenantId: tenantB.id });
    
    expect(meetingsB).not.toContainEqual(meetingA);
  });
  
  it('should prevent cross-tenant API access', async () => {
    // User from School A tries to access School B data
    const userA = await loginAs('school-a', 'admin@school-a.cl');
    
    await expect(
      updateMeeting({ id: schoolBMeetingId, tenantId: 'school-b' })
    ).rejects.toThrow('Unauthorized');
  });
});
```

---

## Infrastructure & Deployment

### Vercel Configuration

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/api/tenant-router"
    }
  ],
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "X-Tenant-Router",
          "value": "enabled"
        }
      ]
    }
  ]
}
```

### DNS Configuration (Subdomain Approach)

```
# Cloudflare/DNS Provider
*.manitospintadas.cl    A    76.76.21.21 (Vercel)
*.manitospintadas.cl    AAAA 2606:4700:... (Vercel IPv6)
admin.manitospintadas.cl A   76.76.21.21
```

### Environment Variables (Multi-Tenant)

```bash
# .env.production
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXTAUTH_URL=https://manitospintadas.cl
NEXTAUTH_SECRET=...

# Platform settings
PLATFORM_DOMAIN=manitospintadas.cl
ENABLE_CUSTOM_DOMAINS=false  # Phase 2
ENABLE_TENANT_SIGNUPS=true

# Super admin
SUPER_ADMIN_EMAIL=admin@manitospintadas.cl
```

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data leak between tenants | 🔴 Critical | Medium | Comprehensive isolation tests, code review, audit logs |
| Performance degradation | 🟡 High | Medium | Add tenant indexes, query optimization, caching |
| Migration data loss | 🔴 Critical | Low | Full backup, dry-run, rollback plan |
| Complex debugging | 🟡 High | High | Tenant context logging, admin impersonation |
| Schema migration issues | 🟡 High | Medium | Convex schema versioning, gradual rollout |

---

## Cost Analysis

### Development Costs
- **Phase 1-2:** 160-240 hours (foundation + isolation)
- **Phase 3-4:** 80-120 hours (features + polish)
- **Total:** 240-360 hours (~6-9 weeks full-time)

### Infrastructure Costs (Additional)
- **Vercel Pro:** $20/month (wildcard domains)
- **Convex:** May need higher tier for multiple tenants
- **Cloudinary:** Scales with tenant count
- **Monitoring:** ~$50/month (for multi-tenant analytics)

### Revenue Potential
- **Per School:** $50-200/month (depending on plan)
- **100 Schools:** $5,000-20,000/month
- **ROI:** 2-6 months to break even on development

---

## Next Steps & Decision Points

### Immediate Decisions Needed

1. **Architecture Choice:**
   - [ ] Option 1: Subdomain only (fastest)
   - [ ] Option 2: Custom domains only
   - [ ] Option 3: Hybrid (recommended)

2. **Pricing Strategy:**
   - [ ] Free tier limits
   - [ ] Paid tier pricing
   - [ ] Enterprise custom pricing

3. **Onboarding Flow:**
   - [ ] Self-service signup (open)
   - [ ] Approval required (curated)
   - [ ] Sales-led (enterprise)

4. **Migration Timing:**
   - [ ] Start immediately
   - [ ] Wait for current features to stabilize
   - [ ] Prototype first

### Questions to Answer

1. **Business Model:**
   - Who is the target customer? (K-12 schools, universities, both?)
   - What's the pricing model? (per school, per user, per feature?)
   - What's included in free vs paid tiers?

2. **Technical:**
   - Should we support custom domains from day 1?
   - What's the maximum number of expected tenants?
   - Do we need advanced features like data residency (EU vs US)?

3. **Support:**
   - How will customer support work across tenants?
   - Do we need tenant-specific documentation?
   - What's the onboarding assistance level?

---

## Recommended Path Forward

### 1. Validate Business Case (1-2 days)
- Interview potential customers
- Validate pricing model
- Calculate ROI projections

### 2. Prototype Key Flows (1 week)
- Build tenant detection POC
- Test Convex query isolation
- Create basic onboarding flow
- **DEMO to stakeholders**

### 3. If Approved → Full Implementation (6 weeks)
- Follow Phase 1-4 plan above
- Weekly progress reviews
- Continuous security testing

### 4. Beta Launch (2 weeks)
- Onboard 3-5 pilot schools
- Gather feedback
- Fix critical issues

### 5. Public Launch
- Marketing campaign
- Open signups
- Monitor and scale

---

## Conclusion

This is a **transformative change** that converts your school system into a scalable SaaS platform. The architecture is sound, Convex supports multi-tenancy well, and the implementation is feasible.

**Key Success Factors:**
- ✅ Start with subdomain approach (simpler)
- ✅ Comprehensive tenant isolation testing
- ✅ Gradual rollout (Phase 1 → 2 → 3 → 4)
- ✅ Strong authentication and security
- ✅ Clear business model and pricing

**Biggest Risks:**
- 🔴 Data isolation bugs (mitigate with extensive testing)
- 🟡 Performance at scale (mitigate with proper indexing)
- 🟡 Complex debugging (mitigate with good logging)

**Recommendation:** Proceed with **Option 1 (subdomain)** for Phase 1, prove the concept with 5-10 beta tenants, then expand to hybrid custom domains in Phase 2.

---

**Ready to proceed? Next action:**
1. **Decision:** Choose subdomain, custom domain, or hybrid
2. **Commitment:** Allocate 6-9 weeks of development time
3. **Start:** Begin with Phase 1 foundation
