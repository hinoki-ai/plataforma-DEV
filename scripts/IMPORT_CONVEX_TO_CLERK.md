# Import Convex Users to Clerk

This script migrates users from your Convex database to Clerk authentication service.

## Overview

The script performs the following steps:

1. **Exports** all users from Convex database
2. **Creates** a JSON export file (Clerk-compatible format) for backup/reference
3. **Imports** users into Clerk using Clerk Backend API
4. **Updates** Convex users with their new Clerk IDs

## Prerequisites

- Node.js and npm installed
- Convex project configured
- Clerk account and API keys set up
- Environment variables configured:
  - `NEXT_PUBLIC_CONVEX_URL` or `CONVEX_URL` - Your Convex deployment URL
  - `CLERK_SECRET_KEY` - Your Clerk secret key

## Usage

### Method 1: Using npm script (Recommended)

```bash
npm run import-convex-to-clerk
```

### Method 2: Direct execution

```bash
tsx scripts/import-convex-users-to-clerk.ts
```

## How It Works

1. **Export Phase**: Fetches all users from Convex that don't already have a `clerkId`
2. **Export File**: Creates a JSON file in `scripts/exports/` directory with all user data
3. **Import Phase**:
   - Checks if each user already exists in Clerk (by email)
   - If exists, links the existing Clerk user to Convex
   - If new, creates the user in Clerk with:
     - Email address
     - Name (split into firstName/lastName)
     - Role (stored in publicMetadata)
     - Phone number (if available)
     - Password (if available and not OAuth user)
   - Updates Convex user record with the Clerk ID

## Password Handling

- **OAuth users**: No password is set (users will authenticate via OAuth)
- **Users with hashed passwords**: If password is bcrypt-hashed (`$2...`), it's skipped and user must reset password
- **Users with plain text passwords**: Password is set directly (⚠️ not recommended for production)

## Rate Limiting

The script includes a 100ms delay between user imports to respect Clerk's API rate limits.

## Output

### Console Output

- Progress indicators for each user
- Summary statistics:
  - Successfully imported count
  - Skipped (already exist) count
  - Errors count
  - Failed import details

### Export File

A JSON file is created at: `scripts/exports/convex-users-export-YYYY-MM-DD.json`

This file contains all user data in Clerk-compatible format and can be used for:

- Backup purposes
- Manual review
- Re-running imports if needed
- Using with Clerk migration tools

## Error Handling

- The script continues processing even if individual users fail to import
- All errors are logged with user email and error message
- Failed imports are listed in the summary

## Notes

- Users that already have a `clerkId` in Convex are skipped
- Users that already exist in Clerk (by email) are linked to Convex instead of creating duplicates
- The script is idempotent - safe to run multiple times

## Troubleshooting

### "CONVEX_URL not set"

- Ensure `NEXT_PUBLIC_CONVEX_URL` or `CONVEX_URL` is set in your environment
- For local development, check `.env.local`
- For production, ensure environment variables are configured in your deployment platform

### "CLERK_SECRET_KEY not set"

- Get your Clerk secret key from the Clerk Dashboard
- Add it to your environment variables
- Never commit secret keys to version control

### "User already exists" errors

- This is normal if you've run the script before
- The script will link existing Clerk users to Convex users

### Password reset required

- Users with hashed passwords will need to reset their password in Clerk
- They can use the "Forgot Password" flow in your application

## Next Steps

After running the import:

1. Test authentication with a few imported users
2. Verify user roles are correctly set in Clerk metadata
3. Monitor for any authentication issues
4. Consider keeping Convex users as backup for rollback purposes
