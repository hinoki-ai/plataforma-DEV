#!/bin/bash

# Script to list all files that still need updating for Convex migration

echo "================================================"
echo "FILES REQUIRING CONVEX MIGRATION"
echo "================================================"
echo ""

echo "📁 API Routes with Prisma imports (34 files):"
echo "----------------------------------------------"
grep -r "from '@/lib/db'" src/app/api --files-with-matches 2>/dev/null | sort
grep -r "from '@/lib/auth-prisma'" src/app/api --files-with-matches 2>/dev/null | sort
echo ""

echo "📁 Other files with Prisma imports:"
echo "----------------------------------------------"
grep -r "from '@/lib/db'" src/lib --files-with-matches 2>/dev/null | sort
grep -r "from '@/lib/db'" src/services --files-with-matches 2>/dev/null | sort
echo ""

echo "================================================"
echo "REPLACEMENT PATTERN"
echo "================================================"
echo ""
echo "❌ OLD (Prisma):"
echo "  import { db as prisma } from '@/lib/db';"
echo "  const users = await prisma.user.findMany();"
echo ""
echo "✅ NEW (Convex):"
echo "  import { getConvexClient } from '@/lib/convex';"
echo "  import { api } from '@/convex/_generated/api';"
echo "  const client = getConvexClient();"
echo "  const users = await client.query(api.users.getUsers, {});"
echo ""

echo "================================================"
echo "QUICK FIX COMMAND"
echo "================================================"
echo ""
echo "To find and list all imports:"
echo "  grep -r \"from '@/lib/db'\" src/ --files-with-matches"
echo ""
echo "To see usage in a specific file:"
echo "  grep -n 'prisma\\.' src/app/api/admin/users/route.ts"
echo ""

echo "================================================"
echo "PRIORITY ORDER"
echo "================================================"
echo ""
echo "1. HIGH PRIORITY (Authentication & Core):"
echo "   - src/app/api/admin/users/route.ts"
echo "   - src/app/api/admin/dashboard/route.ts"
echo "   - src/app/api/auth/register-parent/route.ts"
echo "   - src/lib/email.ts"
echo ""
echo "2. MEDIUM PRIORITY (Features):"
echo "   - src/app/api/parent/meetings/route.ts"
echo "   - src/app/api/parent/students/route.ts"
echo "   - src/app/api/profesor/activities/route.ts"
echo "   - src/app/api/notifications/route.ts"
echo ""
echo "3. LOW PRIORITY (Optional/Admin tools):"
echo "   - src/app/api/test-db/route.ts"
echo "   - src/app/api/health/route.ts"
echo "   - src/app/api/monitoring/route.ts"
echo ""

echo "================================================"
echo "Run this script anytime to check progress!"
echo "================================================"
