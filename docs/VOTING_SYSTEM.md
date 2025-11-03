# Voting System - Complete Guide for AI Assistants

**Plataforma Astral - Centro Consejo Voting Platform**  
**Status**: Production Ready ✅  
**Last Updated**: January 2025

---

## 🎯 System Overview

The Voting System is a comprehensive platform for democratic decision-making in the Parent Center. It allows administrators to create, manage, and monitor votes, while parents participate securely and transparently.

### Key Features

**For Administrators:**

- Complete vote management (create, edit, delete, monitor)
- Advanced categorization (10 predefined categories)
- Real-time analytics and statistics
- Flexible configuration options

**For Parents:**

- Secure voting with authentication required
- Real-time result visualization
- Mobile-responsive interface
- One vote per user enforcement (configurable)

---

## 🏗️ Architecture

### Database Schema (Convex)

```typescript
// Convex schema models
votes: {
  _id: Id<"votes">
  title: string
  description?: string
  category: VoteCategory
  endDate: number  // Unix timestamp
  isActive: boolean
  isPublic: boolean
  allowMultipleVotes: boolean
  maxVotesPerUser?: number
  requireAuthentication: boolean
  createdBy: Id<"users">
  createdAt: number
  updatedAt: number
}

voteOptions: {
  _id: Id<"voteOptions">
  voteId: Id<"votes">
  text: string
  createdAt: number
}

voteResponses: {
  _id: Id<"voteResponses">
  voteId: Id<"votes">
  optionId: Id<"voteOptions">
  userId: Id<"users">
  createdAt: number
}
```

### Convex Functions (`convex/votes.ts`)

**Key Functions:**

- `createVote` - Create new vote with options
- `getVotes` - List votes with optional filters
- `getVoteById` - Get vote with options and vote counts
- `castVote` - Record a vote response (enforces constraints)
- `deleteVote` - Delete vote and all related data
- `getUserVoteResponse` - Check if user has voted
- `getVoteResults` - Calculate vote statistics

### API Routes

**Admin Routes** (`src/app/api/admin/votes/`):

- `GET /api/admin/votes` - List all votes (query: `?isActive=true&category=GENERAL`)
- `POST /api/admin/votes` - Create new vote
- `DELETE /api/admin/votes/[id]` - Delete vote

**Parent Routes** (`src/app/api/parent/votes/`):

- `GET /api/parent/votes` - List public active votes with user voting status
- `POST /api/parent/votes` - Cast a vote (body: `{ voteId, optionId }`)

**Critical Implementation Pattern:**

```typescript
// ✅ CORRECT: Initialize Convex client per-request
export async function GET(request: NextRequest) {
  const convex = getConvexClient(); // Per-request initialization
  // ... handler logic
}

export const runtime = "nodejs"; // Required for API routes
```

### Security & Authorization

- **Authentication**: NextAuth.js with Clerk integration
- **Authorization**: Role-based (ADMIN for admin routes, PARENT for parent routes)
- **Validation**: Zod schemas for all inputs
- **Constraints**: Enforced at both Convex and API layers

---

## 🔒 Voting Constraints

### Constraint Enforcement

1. **Duplicate Prevention** (`allowMultipleVotes: false`)
   - First vote succeeds
   - Second vote returns `409 Conflict`: "You have already voted in this poll"

2. **Multiple Votes** (`allowMultipleVotes: true`)
   - User can vote multiple times
   - Combined with `maxVotesPerUser` if set

3. **Max Votes Limit** (`maxVotesPerUser: number`)
   - Enforces maximum votes per user
   - Returns `409 Conflict`: "Maximum votes per user limit reached (X)"

4. **Expiration** (`endDate`)
   - Checked at API layer (not Convex)
   - Expired votes show status: `"closed"`
   - Voting on expired vote returns `403 Forbidden`

5. **Public/Private** (`isPublic: boolean`)
   - Private votes hidden from `GET /api/parent/votes`
   - Attempting to vote on private vote returns `403 Forbidden`

6. **Active/Inactive** (`isActive: boolean`)
   - Inactive votes hidden from `GET /api/parent/votes`
   - Attempting to vote on inactive vote returns `403 Forbidden`

### Error Handling

**HTTP Status Codes:**

- `401 Unauthorized` - No authentication
- `403 Forbidden` - Wrong role or forbidden vote (expired, inactive, private)
- `404 Not Found` - Invalid vote/option IDs
- `409 Conflict` - Already voted or max votes reached
- `400 Bad Request` - Missing/invalid fields

---

## 📊 Vote Categories

```typescript
enum VoteCategory {
  GENERAL = "GENERAL", // Gray
  ACADEMIC = "ACADEMIC", // Blue
  ADMINISTRATIVE = "ADMINISTRATIVE", // Purple
  SOCIAL = "SOCIAL", // Green
  FINANCIAL = "FINANCIAL", // Yellow
  INFRASTRUCTURE = "INFRASTRUCTURE", // Orange
  CURRICULUM = "CURRICULUM", // Indigo
  EVENTS = "EVENTS", // Pink
  POLICIES = "POLICIES", // Red
  OTHER = "OTHER", // Gray
}
```

---

## 🔧 Development Patterns

### Creating a Vote (Admin)

```typescript
// API Request
POST /api/admin/votes
{
  "title": "New School Policy",
  "description": "Description here",
  "category": "POLICIES",
  "endDate": 1735689600000, // Unix timestamp
  "isActive": true,
  "isPublic": true,
  "allowMultipleVotes": false,
  "requireAuthentication": true,
  "options": [
    { "text": "Option 1" },
    { "text": "Option 2" }
  ]
}

// Response
{
  "success": true,
  "data": { "id": "vote-id-123" }
}
```

### Casting a Vote (Parent)

```typescript
// API Request
POST /api/parent/votes
{
  "voteId": "vote-id-123",
  "optionId": "option-id-456"
}

// Response
{
  "success": true,
  "message": "Vote cast successfully",
  "data": { "id": "response-id-789" }
}
```

### Querying Votes

```typescript
// Get all active votes for admin
GET /api/admin/votes?isActive=true

// Get votes by category
GET /api/admin/votes?category=FINANCIAL

// Get public active votes for parent
GET /api/parent/votes
// Returns votes with user voting status included
```

---

## 🧪 Testing

### Test Scripts

**Convex Function Tests:**

```bash
npx tsx scripts/test-voting-system.ts
```

Tests:

- Vote creation and retrieval
- Constraint enforcement (duplicate, maxVotes)
- Vote deletion
- Result calculations

**API Endpoint Tests:**

```bash
# Requires dev server running
npm run dev

# In another terminal
npx tsx scripts/test-voting-api-comprehensive.ts
```

Tests:

- Authentication/authorization
- All HTTP status codes (401, 403, 404, 409, 400)
- Query filters
- Constraint validation

### Test Coverage Checklist

- ✅ Vote creation (admin)
- ✅ Vote retrieval with filters
- ✅ Vote casting (parent)
- ✅ Duplicate prevention
- ✅ Max votes constraint
- ✅ Expiration handling
- ✅ Public/private filtering
- ✅ Active/inactive filtering
- ✅ Error handling (all status codes)

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found: @/convex/\_generated/api"

**Solution**: Initialize Convex client per-request, not at module level:

```typescript
// ❌ WRONG
const convex = getConvexClient(); // At module level

// ✅ CORRECT
export async function GET(request: NextRequest) {
  const convex = getConvexClient(); // Inside handler
}
```

Also add: `export const runtime = "nodejs";`

### Issue: Type errors with Convex Id types

**Solution**: Import and cast properly:

```typescript
import type { Id } from "@/convex/_generated/dataModel";

await convex.mutation(api.votes.deleteVote, {
  id: voteId as Id<"votes">,
});
```

### Issue: Vote constraints not enforced

**Solution**: Constraints are enforced at both layers:

- Convex layer: `castVote` function checks `allowMultipleVotes` and `maxVotesPerUser`
- API layer: Checks expiration, `isPublic`, `isActive`

### Issue: 500 errors on API routes

**Solution:**

1. Ensure `NEXT_PUBLIC_CONVEX_URL` is set
2. Check Convex backend is running/deployed
3. Verify Convex functions are deployed: `npx convex deploy`
4. Ensure runtime is specified: `export const runtime = "nodejs";`

---

## 📁 File Locations

**Backend:**

- `convex/votes.ts` - Convex functions
- `convex/schema.ts` - Database schema

**API Routes:**

- `src/app/api/admin/votes/route.ts` - Admin endpoints
- `src/app/api/admin/votes/[id]/route.ts` - Admin vote operations
- `src/app/api/parent/votes/route.ts` - Parent endpoints

**Frontend Components:**

- `src/components/admin/voting/` - Admin voting UI
- `src/components/parent/voting/` - Parent voting UI

**Utilities:**

- `src/lib/voting-utils.ts` - Vote calculation helpers

---

## 🚀 Deployment

### Prerequisites

```bash
# Environment variables required
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

### Deployment Steps

```bash
# Deploy Convex backend
npx convex deploy

# Deploy Next.js frontend
vercel --prod
```

### Verification

1. Test admin vote creation: `POST /api/admin/votes`
2. Test parent vote retrieval: `GET /api/parent/votes`
3. Test vote casting: `POST /api/parent/votes`
4. Verify constraints work correctly

---

## 📚 Related Documentation

- **System Architecture**: `docs/AI_KNOWLEDGE_BASE.md` - **PRIMARY**: Complete system documentation
- **Authentication**: `docs/AUTHENTICATION_COMPLETE_GUIDE.md`
- **Testing**: `docs/TESTING_GUIDE.md`
- **Environment Setup**: `docs/ENVIRONMENT.md`

---

## 🎯 Key Takeaways for AI Assistants

1. **Always initialize Convex client per-request** in API routes
2. **Constraints are enforced at both Convex and API layers** - API layer checks expiration/public/active, Convex checks multiple votes and max votes
3. **Error handling** uses specific HTTP status codes (401, 403, 404, 409, 400)
4. **Type safety** requires proper `Id<"votes">` casting for Convex operations
5. **Test coverage** includes both Convex functions and API endpoints separately
6. **Production deployment** requires both Convex and Next.js deployment

---

**Maintained by**: Development Team  
**For questions**: Refer to API documentation or troubleshooting guides
