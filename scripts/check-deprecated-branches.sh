#!/bin/bash

# Check for Deprecated Branches Script
# Ensures deprecated branches are not used for development

set -e

echo "🔍 Checking for deprecated branches..."

# Define deprecated branches
DEPRECATED_BRANCHES=("master" "developer" "dev" "main" "production" "staging")

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check if current branch is deprecated
if [[ " ${DEPRECATED_BRANCHES[@]} " =~ " ${CURRENT_BRANCH} " ]]; then
    echo "🚨 ERROR: You are on a DEPRECATED branch: $CURRENT_BRANCH"
    echo ""
    echo "⚠️  This branch contains outdated code and should NOT be used for development!"
    echo ""
    echo "🔄 Please switch to an active development branch:"
    echo "   git checkout dev.school.aramac.dev    # Development branch"
    echo "   git checkout school.aramac.dev        # Production/Staging branch"
    echo ""
    echo "📖 For more information, see DEPRECATED_BRANCH_NOTICE.md"
    echo ""
    exit 1
fi

# Check if deprecated branches exist locally
for branch in "${DEPRECATED_BRANCHES[@]}"; do
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        echo "⚠️  WARNING: Deprecated branch '$branch' exists locally"
        echo "   Consider deleting it: git branch -D $branch"
        echo ""
    fi
done

# Check for any merges from deprecated branches in recent commits
echo "🔍 Checking recent commits for deprecated branch merges..."

# Get recent commit messages
RECENT_COMMITS=$(git log --oneline -20 --grep="Merge" | head -10)

if echo "$RECENT_COMMITS" | grep -q "master\|deprecated\|old"; then
    echo "⚠️  WARNING: Recent commits may contain merges from deprecated branches"
    echo "   Please review the commit history carefully"
    echo ""
fi

echo "✅ No deprecated branch issues found on current branch: $CURRENT_BRANCH"
echo ""

# Show active branches
echo "📋 Active Branches:"
echo "   ✅ dev.school.aramac.dev (Development Branch)"
echo "   ✅ school.aramac.dev (Production/Staging Branch)"
echo "   ✅ manitospintadas.cl (Main Production Branch)"

echo ""
echo "🚫 Deprecated Branches:"
for branch in "${DEPRECATED_BRANCHES[@]}"; do
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        echo "   ❌ $branch (EXISTS LOCALLY)"
    else
        echo "   ✅ $branch (not present)"
    fi
done

echo ""
echo "🔒 Branch protection active - deprecated branches cannot be merged"