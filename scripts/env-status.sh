#!/bin/bash

# ===========================================
# ENVIRONMENT STATUS SCRIPT
# ===========================================
# Shows the current environment configuration and branch status

echo "==========================================="
echo "🏗️  PLATAFORMA ASTRAL - ENVIRONMENT STATUS"
echo "==========================================="

# Check current git branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "📋 Git Branch Information:"
echo "  Current Branch: $CURRENT_BRANCH"

case $CURRENT_BRANCH in
    "main")
        echo "  🎯 Target: plataforma-astral.com (production)"
        echo "  🔒 Protected branch - requires approval for deployment"
        ;;
    "dev")
        echo "  🎯 Target: dev.plataforma-astral.com (development)"
        echo "  🚧 Development environment - testing & integration"
        ;;
    *)
        echo "  ⚠️  Feature branch - no deployment target"
        ;;
esac

echo ""
echo "📁 Environment Configuration Files:"
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local (local development)"
else
    echo "  ❌ .env.local (missing)"
fi

if [ -f ".env.dev.example" ]; then
    echo "  ✅ .env.dev.example (development template)"
else
    echo "  ❌ .env.dev.example (missing)"
fi

if [ -f ".env.prod.example" ]; then
    echo "  ✅ .env.prod.example (production template)"
else
    echo "  ❌ .env.prod.example (missing)"
fi

if [ -f ".env.example" ]; then
    echo "  ✅ .env.example (general template)"
else
    echo "  ❌ .env.example (missing)"
fi

echo ""
echo "🔧 Deployment Configuration:"
if [ -f "vercel.json" ]; then
    echo "  ✅ vercel.json (main configuration)"
else
    echo "  ❌ vercel.json (missing)"
fi

if [ -f "vercel.dev.json" ]; then
    echo "  ✅ vercel.dev.json (development config)"
else
    echo "  ❌ vercel.dev.json (missing)"
fi

if [ -f "vercel.main.json" ]; then
    echo "  ✅ vercel.main.json (production config)"
else
    echo "  ❌ vercel.main.json (missing)"
fi

echo ""
echo "🔧 Current Environment Variables:"
echo "  NODE_ENV: ${NODE_ENV:-'not set'}"
echo "  APP_ENV: ${APP_ENV:-'not set'}"
echo "  NEXT_PUBLIC_APP_ENV: ${NEXT_PUBLIC_APP_ENV:-'not set'}"
echo "  NEXT_PUBLIC_DOMAIN: ${NEXT_PUBLIC_DOMAIN:-'not set'}"
echo "  NEXTAUTH_URL: ${NEXTAUTH_URL:-'not set'}"

echo ""
echo "📋 Available Deployment Commands:"
echo "  npm run deploy:local    # Start local development server"
echo "  npm run deploy:dev      # Deploy to development (dev branch)"
echo "  npm run deploy:prod     # Deploy to production (main branch)"

echo ""
echo "🌐 Deployment Targets:"
echo "  Development: https://dev.plataforma-astral.com"
echo "  Production:  https://plataforma-astral.com"
echo "  Local Dev:   http://localhost:3000"

echo ""
echo "🚀 Branch Deployment Strategy:"
echo "  main → plataforma-astral.com (protected, requires approval)"
echo "  dev  → dev.plataforma-astral.com (development environment)"

echo ""
echo "==========================================="
