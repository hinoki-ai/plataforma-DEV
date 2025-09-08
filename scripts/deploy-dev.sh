#!/bin/bash

# ===========================================
# DEVELOPMENT DEPLOYMENT SCRIPT
# ===========================================
# Handles deployment to development environment (dev branch)

set -e  # Exit on error

echo "🚀 Starting development deployment..."

# Check if we're deploying to dev environment
if [ "$APP_ENV" = "dev" ] || [ "$NODE_ENV" = "production" ]; then
    echo "🔧 Development deployment environment detected"
    echo "🎯 Target: school.aramac.dev (frequent deployments)"
    echo "⚠️  This should deploy to DEVELOPMENT environment only"

    # Additional validation
    if [ "$NEXT_PUBLIC_DOMAIN" != "school.aramac.dev" ]; then
        echo "❌ ERROR: Development deployment but NEXT_PUBLIC_DOMAIN is not school.aramac.dev"
        echo "Current NEXT_PUBLIC_DOMAIN: $NEXT_PUBLIC_DOMAIN"
        exit 1
    fi

    # Validate required environment variables
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ ERROR: DATABASE_URL not found in environment variables"
        exit 1
    fi

    if [ -z "$NEXTAUTH_SECRET" ]; then
        echo "❌ ERROR: NEXTAUTH_SECRET not found in environment variables"
        exit 1
    fi

    echo "✅ Environment variables validated"

    # Run database migrations
    echo "🗄️  Running database migrations..."
    npx prisma migrate deploy || {
        echo "❌ Migration failed, but continuing..."
    }

    # Run development seeding
    echo "🌱 Seeding development database..."
    npm run db:seed || {
        echo "❌ Seeding failed, but continuing..."
    }

    echo "✅ Development database setup complete"
else
    echo "🔧 Local environment - skipping development deployment setup"
fi

echo "✅ Development deployment script completed successfully!"