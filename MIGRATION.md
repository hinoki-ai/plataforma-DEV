# 🔄 Prisma to Convex Migration Guide

**Project**: Manitos Pintadas School Management System  
**Migration**: PostgreSQL/Prisma → Convex (Serverless Backend)  
**Status**: Infrastructure Complete - API Routes In Progress  
**Last Updated**: January 7, 2025

---

## 📊 Migration Status

### Overall Progress: ~40-50% Complete

| Component | Status | Details |
|-----------|--------|---------|
| **Infrastructure** | ✅ 100% | Convex SDK, schema, configuration complete |
| **Backend Functions** | ✅ 100% | 12 Convex function files created |
| **Service Layer** | ✅ 100% | 11 backward-compatible wrappers |
| **Authentication** | ✅ 100% | Convex auth integration complete |
| **API Routes** | 🟡 33% | 11/33 routes migrated |
| **Calendar Service** | ❌ 0% | Still uses Prisma |
| **Tests** | ❌ 0% | Need updating for Convex |
| **Documentation** | ✅ 100% | Complete migration guides |

---

## 🎯 Quick Start (Required First Steps)

### Step 1: Initialize Convex (5 minutes)

```bash
npx convex dev
```

This will:
- Open browser for Convex authentication
- Let you create/select a project
- Generate types in `convex/_generated/`
- Provide your deployment URL

### Step 2: Configure Environment (2 minutes)

Add the URL from Step 1 to your `.env` file:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

### Step 3: Verify Setup (1 minute)

```bash
# Start both services
npm run dev

# Test health endpoint
curl http://localhost:3000/api/db/health
# Should return: {"status":"healthy","backend":"convex",...}
```

---

## ✅ What's Been Completed

### 1. Core Infrastructure ✅

**Convex Schema** (`convex/schema.ts`):
- 32 complete models migrated from Prisma
- All relationships preserved
- Proper indexes and validators

**Key Models**:
- Users & Authentication
- Meetings & Calendar Events
- Planning Documents
- Students & Activities
- Photos & Videos
- Notifications & Votes
- Team Members & School Info

### 2. Backend Functions ✅

Created 12 comprehensive Convex function files:

```
convex/
├── users.ts              - User CRUD operations
├── meetings.ts           - Meeting management
├── planning.ts           - Planning documents
├── calendar.ts           - Calendar events
├── students.ts           - Student management
├── activities.ts         - Activity tracking
├── notifications.ts      - Notification system
├── votes.ts              - Voting functionality
├── media.ts              - Photos & videos
├── teamMembers.ts        - Team management
├── schoolInfo.ts         - School information
└── auth.ts               - OAuth & sessions
```

### 3. Service Layer Compatibility ✅

Created backward-compatible wrappers in `src/services/`:

**Queries** (Read Operations):
- `queries/meetings.ts`
- `queries/planning.ts`
- `queries/calendar.ts`
- `queries/team-members.ts`
- `queries/school-info.ts`

**Actions** (Write Operations):
- `actions/meetings.ts`
- `actions/planning.ts`
- `actions/calendar.ts`
- `actions/team-members.ts`
- `actions/auth.ts`
- `actions/unified-registration.ts`

### 4. Authentication System ✅

- Created `src/lib/auth-convex.ts`
- Updated `src/lib/auth.ts` to use Convex
- Created `src/lib/convex.ts` client configuration
- NextAuth.js v5 integration maintained

### 5. Cleanup ✅

- ✅ Removed all Prisma packages
- ✅ Deleted `prisma/` directory
- ✅ Deleted `src/lib/db.ts`
- ✅ Deleted `src/lib/auth-prisma.ts`
- ✅ Deleted generated Prisma files
- ✅ Updated `package.json` scripts

### 6. Migrated API Routes ✅

**Working Routes** (11 complete):
- `/api/videos` - GET, POST
- `/api/videos/[id]` - PUT, DELETE
- `/api/photos` - GET, POST
- `/api/photos/[id]` - PUT, DELETE
- `/api/school-info` - GET, POST, PUT
- `/api/proyecto-educativo/video-capsule` - GET, PUT, DELETE
- `/api/test-db` - GET
- `/api/db/health` - GET
- `/api/magic-login/[token]` - GET
- `/api/admin/meetings` - GET, POST

---

## 🚧 Remaining Work

### Priority 1: API Routes (22 routes) 🔴

#### Admin Routes (7 files)
```
src/app/api/admin/
├── users/route.ts                    # User management
├── users/[id]/route.ts              # Individual user operations
├── meetings/[id]/route.ts           # Update/delete meetings
├── votes/route.ts                   # Voting system
├── dashboard/route.ts               # Admin dashboard data
└── bootstrap/route.ts               # System bootstrap
```

#### Parent Routes (4 files)
```
src/app/api/parent/
├── communications/route.ts          # Parent communications
├── students/route.ts                # Student information
├── votes/route.ts                   # Parent voting
└── dashboard/overview/route.ts      # Parent dashboard
```

#### Profesor Routes (4 files)
```
src/app/api/profesor/
├── dashboard/route.ts               # Teacher dashboard
├── activities/route.ts              # Activity management
├── activities/[id]/route.ts         # Individual activities
└── parents/route.ts                 # Parent communications
```

#### Other Routes (7 files)
```
src/app/api/
├── educational-system/route.ts      # Educational system info
├── monitoring/route.ts              # System monitoring
├── auth/change-password/route.ts    # Password changes
├── notifications/route.ts           # Notifications
├── auth/register-parent/route.ts    # Parent registration
└── master/dashboard/route.ts        # Master dashboard
```

### Priority 2: Calendar Service (1 file) 🟡

**File**: `src/services/calendar/calendar-service.ts`

**Prisma Calls to Replace** (6 locations):
- Line 166: `prisma.calendarEvent.findMany()`
- Line 249: `prisma.calendarEvent.create()`
- Line 279: `prisma.recurrenceRule.create()`
- Line 296: `prisma.calendarEvent.update()`
- Line 326: `prisma.calendarEvent.update()`
- Line 381: `prisma.calendarEvent.delete()`

### Priority 3: Tests (38 files) ⚪

All test files need updating to mock Convex instead of Prisma.

---

## 🔄 Migration Patterns

### Pattern 1: Simple Query

**Before (Prisma)**:
```typescript
import { db } from '@/lib/db';

const users = await db.user.findMany({
  where: { role: 'ADMIN' }
});
```

**After (Convex)**:
```typescript
import { getConvexClient } from '@/lib/convex';
import { api } from '@/../convex/_generated/api';

const client = getConvexClient();
const users = await client.query(api.users.getUsersByRole, {
  role: 'ADMIN'
});
```

### Pattern 2: Create Operation

**Before (Prisma)**:
```typescript
const meeting = await db.meeting.create({
  data: {
    title,
    description,
    date,
    userId
  }
});
```

**After (Convex)**:
```typescript
const meetingId = await client.mutation(api.meetings.createMeeting, {
  title,
  description,
  date,
  userId: userId as any
});
```

### Pattern 3: Update Operation

**Before (Prisma)**:
```typescript
const updated = await db.meeting.update({
  where: { id },
  data: { status: 'APPROVED' }
});
```

**After (Convex)**:
```typescript
await client.mutation(api.meetings.updateMeeting, {
  id: id as any,
  status: 'APPROVED'
});
```

### Pattern 4: Delete Operation

**Before (Prisma)**:
```typescript
await db.meeting.delete({
  where: { id }
});
```

**After (Convex)**:
```typescript
await client.mutation(api.meetings.deleteMeeting, {
  id: id as any
});
```

### Pattern 5: Complex Query with Relations

**Before (Prisma)**:
```typescript
const meetings = await db.meeting.findMany({
  where: { userId },
  include: {
    user: true,
    parent: true
  }
});
```

**After (Convex)**:
```typescript
// Convex functions handle relationships internally
const meetings = await client.query(api.meetings.getMeetingsByUser, {
  userId: userId as any
});
// Returns meetings with user and parent data embedded
```

---

## 🛠️ Step-by-Step Migration Workflow

### For Each API Route:

1. **Open the file**:
   ```bash
   code src/app/api/[route]/route.ts
   ```

2. **Update imports**:
   ```typescript
   // Remove
   import { db } from '@/lib/db';
   
   // Add
   import { getConvexClient } from '@/lib/convex';
   import { api } from '@/../convex/_generated/api';
   ```

3. **Initialize client in handler**:
   ```typescript
   export async function GET(request: Request) {
     const client = getConvexClient();
     // ... rest of code
   ```

4. **Replace database calls**:
   Use the patterns above to replace each Prisma call

5. **Test the route**:
   ```bash
   curl http://localhost:3000/api/[route]
   ```

6. **Mark as complete** in tracking document

---

## 💡 Benefits of Convex

### Real-time Updates
Components automatically refresh when data changes:

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MeetingsList() {
  // Auto-updates when meetings change!
  const meetings = useQuery(api.meetings.getMeetings, {});
  
  return (
    <div>
      {meetings?.map(meeting => (
        <MeetingCard key={meeting._id} meeting={meeting} />
      ))}
    </div>
  );
}
```

### Type Safety
Full TypeScript support with auto-generated types:

```typescript
import { Doc, Id } from "@/convex/_generated/dataModel";

// Fully typed!
const meeting: Doc<"meetings"> = ...;
const userId: Id<"users"> = ...;
```

### Serverless Architecture
- No database connection management
- No migration scripts
- Auto-scaling included
- Built-in backups
- Real-time dashboard

### Better Developer Experience
- Hot reload for backend changes
- Live data inspector
- Query playground
- Function logs
- Type generation

---

## 🆘 Troubleshooting

### "Cannot find module '.../_generated/...'"

**Cause**: Convex types not generated  
**Fix**: Run `npx convex dev` to generate types

### "Convex client not initialized"

**Cause**: Missing environment variable  
**Fix**: 
```bash
# Check .env has NEXT_PUBLIC_CONVEX_URL
grep NEXT_PUBLIC_CONVEX_URL .env

# Restart dev server
npm run dev
```

### Build Fails

**Cause**: Convex dev not running  
**Fix**: Keep `npx convex dev` running in a terminal

### API Route Returns 500

**Cause**: Route still uses Prisma  
**Fix**: Check if route is in "Remaining Work" list and migrate it

### Type Errors in Convex Functions

**Cause**: Schema changed without regenerating types  
**Fix**: 
```bash
# Restart Convex dev to regenerate
npx convex dev
```

---

## 📊 Progress Tracking

Use this table to track your progress:

```
[ ] Admin Routes (0/7)
  [ ] users/route.ts
  [ ] users/[id]/route.ts
  [ ] meetings/[id]/route.ts
  [ ] votes/route.ts
  [ ] dashboard/route.ts
  [ ] bootstrap/route.ts

[ ] Parent Routes (0/4)
  [ ] communications/route.ts
  [ ] students/route.ts
  [ ] votes/route.ts
  [ ] dashboard/overview/route.ts

[ ] Profesor Routes (0/4)
  [ ] dashboard/route.ts
  [ ] activities/route.ts
  [ ] activities/[id]/route.ts
  [ ] parents/route.ts

[ ] Other Routes (0/7)
  [ ] educational-system/route.ts
  [ ] monitoring/route.ts
  [ ] auth/change-password/route.ts
  [ ] notifications/route.ts
  [ ] auth/register-parent/route.ts
  [ ] master/dashboard/route.ts

[ ] Calendar Service (0/1)
  [ ] calendar-service.ts

[ ] Tests (0/38)
  [ ] Update test files
```

---

## ⏱️ Time Estimates

| Task | Estimated Time |
|------|----------------|
| Setup (Steps 1-3) | 10 minutes |
| Admin Routes (7) | 1-2 hours |
| Parent Routes (4) | 45-60 minutes |
| Profesor Routes (4) | 45-60 minutes |
| Other Routes (7) | 1-1.5 hours |
| Calendar Service | 1 hour |
| Test Updates | 2-3 hours |
| **Total** | **6-9 hours** |

---

## 📚 Additional Resources

### Convex Documentation
- **Getting Started**: https://docs.convex.dev/
- **Next.js Integration**: https://docs.convex.dev/quickstart/nextjs
- **Database Queries**: https://docs.convex.dev/database/reading-data
- **Mutations**: https://docs.convex.dev/database/writing-data
- **React Hooks**: https://docs.convex.dev/client/react

### Project Documentation
- `START_HERE.md` - Getting started guide
- `DOCUMENTATION_INDEX.md` - All documentation links
- `docs/` directory - Detailed technical docs

### Convex Dashboard
```bash
# Open dashboard in browser
npx convex dashboard
```

---

## ✅ Migration Checklist

- [ ] Initialize Convex with `npx convex dev`
- [ ] Set `NEXT_PUBLIC_CONVEX_URL` in `.env`
- [ ] Verify health endpoint works
- [ ] Migrate admin API routes
- [ ] Migrate parent API routes
- [ ] Migrate profesor API routes
- [ ] Migrate remaining API routes
- [ ] Update calendar service
- [ ] Update test files
- [ ] Run full test suite
- [ ] Deploy to development
- [ ] Test in development environment
- [ ] Deploy to production

---

## 🎉 Success Criteria

The migration is complete when:

1. ✅ All 33 API routes use Convex
2. ✅ Calendar service uses Convex
3. ✅ All tests pass
4. ✅ No Prisma references in code
5. ✅ `npm run type-check` passes
6. ✅ `npm run build` succeeds
7. ✅ App runs without errors
8. ✅ Production deployment successful

---

## 🚀 After Migration

### Data Migration (If Needed)

If you have existing production data in PostgreSQL:

1. **Export data from PostgreSQL**
2. **Create seed scripts** using Convex mutations
3. **Import data** to Convex

Example seed script:
```typescript
// scripts/seed-convex.ts
import { getConvexClient } from '@/lib/convex';
import { api } from '../convex/_generated/api';

const client = getConvexClient();

// Seed users
await client.mutation(api.users.createUser, {
  email: "admin@school.com",
  role: "ADMIN",
  name: "Admin User"
});
```

### Production Deployment

```bash
# Deploy Convex to production
npx convex deploy

# Add production URL to Vercel
vercel env add NEXT_PUBLIC_CONVEX_URL production

# Deploy Next.js to production
vercel --prod
```

---

**Need Help?** Check the troubleshooting section or visit [Convex Discord](https://convex.dev/community)

**Questions?** See the [documentation index](DOCUMENTATION_INDEX.md) for all available guides
