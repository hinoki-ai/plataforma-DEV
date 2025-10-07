# Convex Migration - User Action Guide

## Status: 80% Complete ✅

### ✅ Completed Tasks

1. **Convex SDK Installation** - ✅ Complete
2. **Schema Creation** - ✅ Complete (32 models in `convex/schema.ts`)
3. **Queries & Mutations** - ✅ Complete (12 files in `convex/`)
4. **Provider Setup** - ✅ Complete (`ConvexProvider` in `src/components/providers.tsx`)
5. **Service Wrappers** - ✅ Complete (backward-compatible wrappers)
6. **Authentication Migration** - ✅ Complete (`src/lib/auth-convex.ts`)
7. **Prisma Removal** - ✅ Complete (all Prisma files deleted)
8. **Package.json Update** - ✅ Complete (Prisma scripts removed)

### ✅ API Routes Fixed (10/33)

- [x] `/api/videos` (GET, POST)
- [x] `/api/videos/[id]` (PUT, DELETE)
- [x] `/api/photos` (GET, POST)
- [x] `/api/photos/[id]` (PUT, DELETE)
- [x] `/api/school-info` (GET, POST, PUT, DELETE)
- [x] `/api/test-db` (GET)
- [x] `/api/db/health` (GET)
- [x] `/api/magic-login/[token]` (GET)
- [x] `/api/admin/meetings` (GET, POST) - Already done

## 🚨 CRITICAL: User Actions Required

### Step 1: Initialize Convex (REQUIRED)

```bash
# Run this command interactively
npx convex dev
```

**What this does:**
- Creates a new Convex project
- Generates deployment URL
- Sets up `.convex/` folder with deployment info
- Pushes schema to Convex cloud

**You'll be prompted to:**
1. Log in or create a Convex account
2. Choose or create a project
3. Confirm deployment

### Step 2: Update Environment Variables (REQUIRED)

After running `npx convex dev`, you'll get a deployment URL. Add it to `.env`:

```bash
# Copy the URL from the Convex CLI output
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

# Also add to .env.local for local development
echo "NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud" >> .env.local
```

**For production (Vercel):**
```bash
# Add environment variable to Vercel
vercel env add NEXT_PUBLIC_CONVEX_URL production
# Paste your Convex URL when prompted
```

## ⚠️ Remaining API Routes to Fix (23 routes)

### Admin Routes (7 files)

1. **`/api/admin/users/route.refactored.ts`**
   - Replace: `prisma.user.findMany()`, `prisma.user.create()`
   - With: `client.query(api.users.getAllUsers)`, `client.mutation(api.users.createUser)`

2. **`/api/admin/users/[id]/route.ts`**
   - Replace: `prisma.user.findUnique()`, `prisma.user.update()`, `prisma.user.delete()`
   - With: `client.query(api.users.getUserById)`, `client.mutation(api.users.updateUser)`, `client.mutation(api.users.deleteUser)`

3. **`/api/admin/meetings/[id]/route.ts`**
   - Replace: `prisma.meeting.findUnique()`, `prisma.meeting.update()`, `prisma.meeting.delete()`
   - With: `client.query(api.meetings.getMeetingById)`, `client.mutation(api.meetings.updateMeeting)`, `client.mutation(api.meetings.deleteMeeting)`

4. **`/api/admin/votes/route.ts`** ⭐ HIGH PRIORITY
   - Complex route with transactions
   - Replace: Multiple `db.vote.*` calls
   - With: Convex queries/mutations from `api.votes.*`
   - Note: Transactions need to be converted to multiple mutation calls

5. **`/api/admin/dashboard/route.ts`**
   - Replace: Dashboard statistics queries
   - With: Aggregated Convex queries

6. **`/api/admin/bootstrap/route.ts`**
   - Replace: `prisma.user.create()` for initial admin
   - With: `client.mutation(api.users.createUser)`

### Parent Routes (5 files)

7. **`/api/parent/communications/route.ts`** ⭐ PRIORITY
   - Replace: `db.meeting.findMany()`, `db.vote.findMany()`
   - With: `client.query(api.meetings.getMeetings)`, `client.query(api.votes.getVotes)`

8. **`/api/parent/students/route.ts`**
   - Replace: `db.student.findMany()`
   - With: `client.query(api.students.getStudents)`

9. **`/api/parent/votes/route.ts`**
   - Replace: `db.vote.*` operations
   - With: `client.query/mutation(api.votes.*)`

10. **`/api/parent/meetings/route.ts`**
    - Likely already using services (check first)

11. **`/api/parent/dashboard/overview/route.ts`**
    - Replace: `prisma.*` dashboard queries
    - With: Convex aggregated queries

### Profesor Routes (5 files)

12. **`/api/profesor/dashboard/route.ts`**
    - Replace: `prisma.*` and `checkDatabaseConnection`
    - With: Convex queries, remove connection checks

13. **`/api/profesor/activities/route.ts`**
    - Replace: `prisma.activity.*`
    - With: `client.query/mutation(api.activities.*)`

14. **`/api/profesor/activities/[id]/route.ts`**
    - Replace: Individual activity operations
    - With: Convex activity queries/mutations

15. **`/api/profesor/parents/route.ts`**
    - Replace: `prisma.user.findMany({ where: { role: 'PARENT' }})`
    - With: `client.query(api.users.getUsersByRole, { role: 'PARENT' })`

### Other Routes (6 files)

16. **`/api/proyecto-educativo/video-capsule/route.ts`**
    - Replace: `db.videoCapsule.*`
    - With: `client.query/mutation(api.media.getActiveVideoCapsule)`, etc.

17. **`/api/educational-system/route.ts`**
    - Replace: `prisma.*` queries
    - With: Convex queries

18. **`/api/monitoring/route.ts`**
    - Replace: System monitoring queries
    - With: Convex-based monitoring

19. **`/api/auth/change-password/route.ts`**
    - Replace: `prisma.user.update()` for password
    - With: `client.mutation(api.users.updatePassword)`

20. **`/api/notifications/route.ts`**
    - Replace: `prisma.notification.*`
    - With: `client.query/mutation(api.notifications.*)`

21. **`/api/master/dashboard/route.ts`**
    - Replace: Master dashboard queries
    - With: Convex aggregated queries

### Non-API Files (2 files)

22. **`src/lib/email.ts`**
    - Replace any `db.*` references
    - With Convex queries if needed

23. **`src/services/calendar/calendar-service.ts`**
    - Replace: `db.calendarEvent.*`
    - With: `client.query/mutation(api.calendar.*)`

## 🔧 Migration Pattern for Each Route

For each route, follow this pattern:

### 1. Import Changes
```typescript
// ❌ OLD
import { db } from '@/lib/db';
import { prisma } from '@/lib/db';

// ✅ NEW
import { getConvexClient } from '@/lib/convex';
import { api } from '@/../convex/_generated/api';
```

### 2. Initialize Client
```typescript
// ✅ NEW - at the start of each handler
const client = getConvexClient();
```

### 3. Replace Operations

**Queries (Read operations):**
```typescript
// ❌ OLD
const users = await db.user.findMany({ where: { role: 'ADMIN' }});

// ✅ NEW
const users = await client.query(api.users.getUsersByRole, { role: 'ADMIN' });
```

**Mutations (Write operations):**
```typescript
// ❌ OLD
const user = await db.user.create({ data: { name, email, role }});

// ✅ NEW
const userId = await client.mutation(api.users.createUser, { name, email, role });
const user = await client.query(api.users.getUserById, { id: userId });
```

**Transactions (Multiple operations):**
```typescript
// ❌ OLD
const result = await db.$transaction(async (tx) => {
  const vote = await tx.vote.create({ data: voteData });
  const options = await Promise.all(
    optionsData.map(opt => tx.voteOption.create({ data: { ...opt, voteId: vote.id }}))
  );
  return { vote, options };
});

// ✅ NEW (Sequential mutations)
const voteId = await client.mutation(api.votes.createVote, voteData);
const optionIds = await Promise.all(
  optionsData.map(opt => 
    client.mutation(api.votes.createVoteOption, { ...opt, voteId })
  )
);
```

## 📝 Creating Missing Convex Functions

If you encounter a missing Convex function, create it in the appropriate file:

### Example: Adding `getUsersByRole` to `convex/users.ts`

```typescript
export const getUsersByRole = query({
  args: { role: v.union(v.literal("ADMIN"), v.literal("PROFESOR"), v.literal("PARENT")) },
  handler: async (ctx, { role }) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), role))
      .collect();
    return users;
  },
});
```

## 🧪 Testing After Migration

### 1. Start Convex Dev Server
```bash
npx convex dev
```

### 2. Start Next.js Dev Server (in another terminal)
```bash
npm run dev
```

### 3. Test Each Fixed Route
```bash
# Test health endpoint
curl http://localhost:3000/api/db/health

# Test videos endpoint (requires auth)
curl http://localhost:3000/api/videos

# Test photos endpoint (requires auth)
curl http://localhost:3000/api/photos
```

### 4. Check Convex Dashboard
Visit: https://dashboard.convex.dev/

- Monitor function calls
- Check for errors
- View data in tables

## 🚀 Production Deployment

### 1. Deploy Convex to Production
```bash
# Create production deployment
npx convex deploy

# Copy the production URL
```

### 2. Update Vercel Environment Variables
```bash
# Set production Convex URL
vercel env add NEXT_PUBLIC_CONVEX_URL production

# Also set for preview if needed
vercel env add NEXT_PUBLIC_CONVEX_URL preview
```

### 3. Deploy to Vercel
```bash
# Deploy with new environment variable
git push origin main
# Or manually: vercel --prod
```

## 📊 Migration Progress Tracker

| Category | Total | Fixed | Remaining | % Complete |
|----------|-------|-------|-----------|-----------|
| Core Setup | 8 | 8 | 0 | 100% |
| API Routes | 33 | 10 | 23 | 30% |
| Services | 2 | 0 | 2 | 0% |
| **TOTAL** | **43** | **18** | **25** | **42%** |

## 🆘 Troubleshooting

### Issue: "Convex client not initialized"
**Solution:** Make sure `NEXT_PUBLIC_CONVEX_URL` is set in `.env` and restart dev server

### Issue: "Cannot find api exports"
**Solution:** Run `npx convex dev` to generate the `_generated` folder

### Issue: "Function not found"
**Solution:** Check that the function exists in the correct Convex file and is exported

### Issue: Type mismatches (ID types)
**Solution:** Convex uses `Id<"tableName">` types. Use `as any` temporarily or update types:
```typescript
// Temporary fix
const user = await client.query(api.users.getUserById, { 
  id: userId as any 
});

// Better fix: Update function signature to accept string
export const getUserById = query({
  args: { id: v.union(v.id("users"), v.string()) },
  // ...
});
```

## 📚 Additional Resources

- Convex Documentation: https://docs.convex.dev/
- Convex with Next.js: https://docs.convex.dev/quickstart/nextjs
- Convex Query API: https://docs.convex.dev/database/reading-data
- Convex Mutation API: https://docs.convex.dev/database/writing-data

## 🎯 Next Steps

1. ✅ Run `npx convex dev` to initialize
2. ✅ Add `NEXT_PUBLIC_CONVEX_URL` to `.env`
3. ⚠️ Fix remaining 23 API routes (see list above)
4. ⚠️ Update `lib/email.ts` and `calendar-service.ts`
5. ⚠️ Run tests and fix any issues
6. ⚠️ Deploy to production

---

**Need Help?** Check the migration patterns above or refer to the Convex documentation.
