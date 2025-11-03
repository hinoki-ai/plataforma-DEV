# Fix TypeScript Errors - Task Prompt

## Context

The deployment was successful but bypassed TypeScript type checking due to numerous errors. These errors need to be fixed for better type safety and to enable proper type checking in future deployments.

## Errors Summary

The TypeScript errors fall into two main categories:

### 1. Missing `institutionId` Property (Critical)

Multiple Convex database insert operations are missing the required `institutionId` field. The schema requires this field but many inserts don't include it.

**Affected Files:**

- `convex/media.ts` (3 errors)
- `convex/notifications.ts` (2 errors)
- `convex/observations.ts` (2 errors)
- `convex/parentMeetings.ts` (2 errors)
- `convex/teamMembers.ts` (1 error)
- `convex/users.ts` (2 errors)
- `convex/votes.ts` (2 errors)

### 2. Implicit `any` Types

Function parameters and variables have implicit `any` types, which violates TypeScript strict mode.

**Affected Files:**

- `convex/libroClasesExport.ts` (26 errors - many implicit `any` parameters)
- `convex/students.ts` (7 errors)
- Other files with implicit `any` in API routes and components

### 3. Type Mismatches

Some type definitions don't match the expected types.

**Affected Files:**

- `src/app/(main)/admin/equipo-multidisciplinario/page.tsx` - TeamMemberList props mismatch
- `src/app/api/libro-clases/export/route.ts` - LibroClasesData type issues
- Various component type issues

## Task

Fix all TypeScript errors systematically. Follow this approach:

### Step 1: Fix Missing `institutionId` Errors

For each file with missing `institutionId`:

1. Identify where `ctx.db.insert()` is called without `institutionId`
2. Determine the correct `institutionId` value (likely from context, user, or institution parameters)
3. Add `institutionId` to the insert object

**Example Pattern:**

```typescript
// Before
await ctx.db.insert("notifications", {
  title: args.title,
  message: args.message,
  // ... other fields
});

// After
await ctx.db.insert("notifications", {
  title: args.title,
  message: args.message,
  institutionId: args.institutionId || ctx.auth.getIdentity()?.institutionId,
  // ... other fields
});
```

**Files to fix:**

- `convex/media.ts` - lines 106, 136, 189
- `convex/notifications.ts` - lines 109, 128
- `convex/observations.ts` - line 251
- `convex/parentMeetings.ts` - lines 325, 398
- `convex/teamMembers.ts` - line 50
- `convex/users.ts` - lines 811, 855
- `convex/votes.ts` - lines 142, 187

### Step 2: Fix Implicit `any` Types

Add explicit type annotations to all function parameters and variables that have implicit `any` types.

**For `convex/libroClasesExport.ts`:**

- Add types to all filter/map callbacks: `(g: GradeType)`, `(o: ObservationType)`, etc.
- Import or define the proper types from the schema

**For `convex/students.ts`:**

- Type the query builder parameters: `(q: QueryBuilderType)`
- Type sort comparators: `(a: Student, b: Student)`

**For API routes:**

- Type all callback parameters in `map`, `filter`, `reduce`, etc.

### Step 3: Fix Type Mismatches

**File: `src/app/(main)/admin/equipo-multidisciplinario/page.tsx`**

- Check the `TeamMemberList` component props interface
- Fix the props being passed to match the expected interface

**File: `src/app/api/libro-clases/export/route.ts`**

- Fix the `LibroClasesData` type usage
- Ensure all data structures match the expected type

### Step 4: Fix Other Type Errors

**File: `src/app/api/libro-clases/export/route.ts`**

- Line 69: Fix Buffer type issue with Response constructor

**File: `convex/users.ts`**

- Lines 197, 801: Remove `institutionId` from user update objects if it doesn't belong to the schema

**Various component files:**

- Fix any remaining type mismatches in components

## Verification

After fixing all errors:

1. Run type check:

   ```bash
   npm run type-check
   ```

2. Ensure zero TypeScript errors

3. Test that Convex deployment works without `--typecheck=disable`:

   ```bash
   npx convex deploy --yes
   ```

4. Verify the build works:

   ```bash
   npm run build
   ```

## Notes

- **Do not skip type checking** - All errors must be fixed
- **Preserve functionality** - Ensure fixes don't break existing logic
- **Add proper types** - Use schema types from `convex/_generated/dataModel` where possible
- **Institution context** - Many inserts need `institutionId` which may come from:
  - Function arguments
  - User context (`ctx.auth.getIdentity()`)
  - Query parameters
  - Institution lookup

## Files Modified Recently

These files were recently modified and may need attention:

- `src/services/calendar/calendar-service.ts` - Already fixed
- `scripts/deploy.js` - Updated to use `--typecheck=disable` (remove this after fixing errors)
- `src/app/(main)/admin/equipo-multidisciplinario/page.tsx` - New file with type errors

## Priority Order

1. **Critical**: Missing `institutionId` errors (affects database operations)
2. **High**: Implicit `any` types in `convex/libroClasesExport.ts` (26 errors)
3. **Medium**: Other implicit `any` types
4. **Low**: Component prop mismatches

Start with the critical errors first, as they affect data integrity.
