#!/bin/bash

# Quick fix script to replace simple Prisma imports with Convex in API routes
# Use with caution - review changes before committing!

echo "🔧 Fixing Prisma imports in API routes..."
echo ""

# Find all API route files with Prisma imports
FILES=$(grep -r "from '@/lib/db'" src/app/api --files-with-matches 2>/dev/null)

echo "Found $(echo "$FILES" | wc -l) files to potentially update"
echo ""
echo "Note: This script only shows what would be changed."
echo "Manual review and updates are still required for complex logic."
echo ""

for file in $FILES; do
  echo "📄 $file"
  
  # Check if file has simple patterns
  if grep -q "prisma.user" "$file" || grep -q "prisma.meeting" "$file"; then
    echo "  ⚠️  Contains Prisma calls - needs manual update"
  fi
  
  echo ""
done

echo "✅ Analysis complete!"
echo ""
echo "Next steps:"
echo "1. Update each file manually using the pattern:"
echo "   - Replace: import { prisma } from '@/lib/db';"
echo "   - With: import { getConvexClient } from '@/lib/convex';"
echo "           import { api } from '@/convex/_generated/api';"
echo ""
echo "2. Replace Prisma calls with Convex queries/mutations"
echo "3. Test each endpoint"
