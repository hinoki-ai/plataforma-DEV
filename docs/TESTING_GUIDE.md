# Voting System Testing Guide

## Quick Start

This guide will help you complete comprehensive testing of the voting system.

## Prerequisites Checklist

- [ ] Convex backend deployed (`npx convex deploy`)
- [ ] `NEXT_PUBLIC_CONVEX_URL` environment variable set
- [ ] Dev server can run (`npm run dev`)
- [ ] Test accounts available:
  - [ ] Admin account
  - [ ] Parent account
- [ ] Test user IDs identified (for Convex direct tests)

## Test Scripts

### 1. Convex Function Tests

**File:** `scripts/test-voting-system.ts`

**Run:**

```bash
# Set environment variable first
export NEXT_PUBLIC_CONVEX_URL="your-convex-url"
# Or add to .env.local

# Run tests
npx tsx scripts/test-voting-system.ts
```

**What it tests:**

- ✅ Vote creation
- ✅ Vote retrieval
- ✅ Vote listing with filters
- ✅ Cast vote
- ✅ Duplicate vote prevention (allowMultipleVotes: false)
- ✅ Multiple votes allowed (allowMultipleVotes: true)
- ✅ maxVotesPerUser constraint (limit of 3 votes)
- ✅ Vote deletion
- ✅ Vote results calculation

**Expected output:**

- All tests pass with ✅ indicators
- Test votes cleaned up automatically

**If tests fail:**

1. Check `NEXT_PUBLIC_CONVEX_URL` is set correctly
2. Verify test user IDs in script match your database
3. Ensure Convex backend is deployed and accessible

### 2. API Endpoint Tests

**File:** `scripts/test-voting-api-comprehensive.ts`

**Run:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run API tests
npx tsx scripts/test-voting-api-comprehensive.ts
```

**Before running:**

1. **Get authentication tokens:**
   - Log in as admin in browser
   - Open DevTools > Application > Cookies
   - Copy `next-auth.session-token` value
   - Replace `YOUR_ADMIN_SESSION_TOKEN_HERE` in the script
2. **Repeat for parent account:**
   - Log in as parent in browser
   - Copy session token
   - Replace `YOUR_PARENT_SESSION_TOKEN_HERE` in the script

**What it tests:**

- ✅ GET /api/admin/votes
- ✅ POST /api/admin/votes (create)
- ✅ DELETE /api/admin/votes/[id]
- ✅ GET /api/parent/votes
- ✅ POST /api/parent/votes (cast vote)
- ✅ Query filters (?isActive, ?category)
- ✅ Error handling (401, 403, 404, 409, 400)

**Expected output:**

- Summary showing passed/failed tests
- Note: Some may fail if auth tokens not set correctly

### 3. Manual Constraint Testing

Use the UI or API directly to test these constraints:

#### Multiple Votes Constraint

1. **Create vote** with `allowMultipleVotes: false`
2. **Cast vote** as parent (should succeed)
3. **Try to vote again** (should return 409: "You have already voted in this poll")

#### Expiration Constraint

1. **Create vote** with `endDate` in the past
2. **Check status** via GET /api/parent/votes (should show status: "closed")
3. **Try to vote** (should return 403: "Voting is not available for this poll")

#### Public/Private Constraint

1. **Create vote** with `isPublic: false`
2. **Check parent endpoint** GET /api/parent/votes (vote should NOT appear)
3. **Try to vote directly** with vote ID (should return 403)

#### Active/Inactive Constraint

1. **Create vote** with `isActive: false`
2. **Check parent endpoint** GET /api/parent/votes (vote should NOT appear)
3. **Try to vote directly** with vote ID (should return 403)

#### Max Votes Constraint

1. **Create vote** with:
   - `allowMultipleVotes: true`
   - `maxVotesPerUser: 3`
2. **Cast 3 votes** (should all succeed)
3. **Try 4th vote** (should return 409: "Maximum votes per user limit reached (3)")

### 4. Frontend Integration Testing

#### Admin UI (`/admin/votaciones`)

**Test checklist:**

- [ ] Page loads without errors
- [ ] Create vote form displays correctly
- [ ] Creating a vote succeeds and appears in list
- [ ] Vote list shows all votes (active and inactive)
- [ ] Filters work:
  - [ ] Filter by `isActive=true`
  - [ ] Filter by `category=FINANCIAL`
- [ ] Delete vote works
- [ ] Error messages display correctly (if any)

**Steps:**

1. Navigate to `/admin/votaciones` as admin
2. Create a test vote with various settings
3. Verify it appears in the list
4. Try filtering and deleting

#### Parent UI (`/parent/votaciones`)

**Test checklist:**

- [ ] Page loads without errors
- [ ] Only public, active votes are visible
- [ ] Expired votes show as "closed"
- [ ] Casting a vote works
- [ ] Vote counts update after voting
- [ ] "Already voted" state displays correctly
- [ ] Error messages display for:
  - [ ] Duplicate votes (409)
  - [ ] Expired votes (403)
  - [ ] Invalid options (400/404)

**Steps:**

1. Navigate to `/parent/votaciones` as parent
2. Verify only active public votes are shown
3. Cast a vote on an active vote
4. Try to vote again (should show error)
5. Check vote counts update correctly

## Testing Checklist

### Core Functionality

- [ ] Vote creation works
- [ ] Vote retrieval works
- [ ] Vote deletion works
- [ ] Vote casting works
- [ ] Vote results calculate correctly

### Constraints

- [ ] Multiple votes constraint (allowMultipleVotes: false)
- [ ] Expiration constraint (past endDate)
- [ ] Public/Private constraint (isPublic: false)
- [ ] Active/Inactive constraint (isActive: false)
- [ ] Max votes constraint (maxVotesPerUser)

### Error Handling

- [ ] 401 Unauthenticated responses
- [ ] 403 Forbidden responses (wrong role, expired, inactive, private)
- [ ] 404 Not Found responses (invalid IDs)
- [ ] 409 Conflict responses (duplicate, max votes)
- [ ] 400 Bad Request responses (missing/invalid fields)

### Frontend

- [ ] Admin UI creates/displays/deletes votes
- [ ] Parent UI shows only active public votes
- [ ] Parent UI allows voting
- [ ] Error messages display correctly
- [ ] Vote counts update in real-time

## Troubleshooting

### Convex Tests Fail

- Check `NEXT_PUBLIC_CONVEX_URL` is set
- Verify Convex backend is deployed
- Update user IDs in test script to match your database
- Check Convex dashboard for errors

### API Tests Fail with 401

- Session tokens need to be updated in test script
- Make sure you're logged in and copied the correct cookie value
- Check that auth middleware is working correctly

### API Tests Fail with 403

- Verify user roles are set correctly in database
- Check that admin/parent roles match expectations
- Review API route auth checks

### Frontend Errors

- Check browser console for errors
- Verify API endpoints are accessible
- Check network tab for failed requests
- Ensure authentication is working

## Test Results Template

After running tests, document results:

```
## Test Run: [DATE]

### Convex Tests
- [ ] All tests passed
- [ ] Issues found: [list]

### API Tests
- [ ] All tests passed
- [ ] Issues found: [list]

### Constraint Tests
- [ ] Multiple votes: Working
- [ ] Expiration: Working
- [ ] Public/Private: Working
- [ ] Active/Inactive: Working
- [ ] Max votes: Working

### Frontend Tests
- [ ] Admin UI: Working
- [ ] Parent UI: Working
- [ ] Error handling: Working

### Bugs Found
1. [Bug description]
2. [Bug description]

### Status
- ✅ Ready for production
- ⚠️ Needs fixes: [list]
```

## Next Steps

1. Run Convex function tests
2. Run API endpoint tests (with auth)
3. Test constraints manually
4. Test frontend integration
5. Document any bugs found
6. Fix bugs and re-test
7. See [VOTING_SYSTEM.md](./VOTING_SYSTEM.md) for testing details and results documentation
