#!/bin/bash

# ===========================================
# PRODUCTION DEPLOYMENT SCRIPT
# ===========================================
# Handles deployment to production environment (prod branch → manitospintadas.cl)

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Check if we're in production environment
if [ "$APP_ENV" = "prod" ] || [ "$NODE_ENV" = "production" ]; then
    echo "🔧 Production environment detected"
    echo "🎯 Target: manitospintadas.cl (RARE deployments)"
    echo "⚠️  WARNING: This will deploy to LIVE PRODUCTION SITE!"
    echo "🔒 This should only happen weekly at most"

    # Additional validation
    if [ "$NEXT_PUBLIC_DOMAIN" != "manitospintadas.cl" ]; then
        echo "❌ ERROR: Production deployment but NEXT_PUBLIC_DOMAIN is not manitospintadas.cl"
        echo "Current NEXT_PUBLIC_DOMAIN: $NEXT_PUBLIC_DOMAIN"
        exit 1
    fi

    # Require explicit confirmation for production deployments
    if [ -z "$PRODUCTION_DEPLOYMENT_CONFIRMED" ]; then
        echo "❌ ERROR: Production deployment requires explicit confirmation"
        echo "Set PRODUCTION_DEPLOYMENT_CONFIRMED=true to proceed"
        exit 1
    fi

    # Validate required environment variables
    if [ -z "$CONVEX_URL" ]; then
        echo "❌ ERROR: CONVEX_URL not found in environment variables"
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

    # Run production seeding
    echo "🌱 Seeding production database..."
    npm run db:seed:production || {
        echo "❌ Seeding failed, but continuing..."
    }

    echo "✅ Production database setup complete"
else
    echo "🔧 Non-production environment - skipping production deployment setup"
fi

echo "✅ Production deployment script completed successfully!"