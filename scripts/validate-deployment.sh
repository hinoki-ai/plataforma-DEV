#!/bin/bash

# ===========================================
# DEPLOYMENT VALIDATION SCRIPT
# ===========================================
# Validates deployment configuration and environment setup

set -e  # Exit on error

echo "🔍 Starting deployment validation..."

# Function to validate environment variables
validate_env_var() {
    local var_name="$1"
    local expected_value="$2"
    local current_value="${!var_name}"

    if [ -z "$current_value" ]; then
        echo "❌ ERROR: $var_name is not set"
        return 1
    fi

    if [ -n "$expected_value" ] && [ "$current_value" != "$expected_value" ]; then
        echo "❌ ERROR: $var_name is '$current_value', expected '$expected_value'"
        return 1
    fi

    echo "✅ $var_name: $current_value"
    return 0
}

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

echo "📋 Current Configuration:"
echo "Branch: $CURRENT_BRANCH"
echo "APP_ENV: $APP_ENV"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_DOMAIN: $NEXT_PUBLIC_DOMAIN"
echo ""

# Validate configuration based on environment
case "$APP_ENV" in
    "dev")
        echo "🔧 Validating DEVELOPMENT environment configuration..."
        validate_env_var "APP_ENV" "dev"
        validate_env_var "NEXT_PUBLIC_DOMAIN" "dev.plataforma-astral.com"
        validate_env_var "CONVEX_URL"
        validate_env_var "NEXTAUTH_SECRET"
        echo "🎯 Target: dev.plataforma-astral.com (frequent deployments)"
        echo "✅ Development configuration validated"
        ;;

    "main")
        echo "🔧 Validating PRODUCTION environment configuration..."
        echo "⚠️  WARNING: This is a PRODUCTION deployment!"
        validate_env_var "APP_ENV" "main"
        validate_env_var "NEXT_PUBLIC_DOMAIN" "plataforma-astral.com"
        validate_env_var "CONVEX_URL"
        validate_env_var "NEXTAUTH_SECRET"

        if [ -z "$PRODUCTION_DEPLOYMENT_CONFIRMED" ]; then
            echo "❌ ERROR: Production deployment requires explicit confirmation"
            echo "Set PRODUCTION_DEPLOYMENT_CONFIRMED=true to proceed"
            exit 1
        fi

        echo "🎯 Target: plataforma-astral.com (protected deployments)"
        echo "✅ Production configuration validated"
        ;;

    *)
        echo "❌ ERROR: Unknown APP_ENV: $APP_ENV"
        echo "Valid values: dev, main"
        exit 1
        ;;
esac

# Validate branch matches environment
if [ "$CURRENT_BRANCH" = "dev" ] && [ "$APP_ENV" != "dev" ]; then
    echo "❌ ERROR: dev branch should use APP_ENV=dev"
    exit 1
fi

if [ "$CURRENT_BRANCH" = "main" ] && [ "$APP_ENV" != "main" ]; then
    echo "❌ ERROR: main branch should use APP_ENV=main"
    exit 1
fi

echo ""
echo "🎉 Deployment validation completed successfully!"
echo "🚀 Ready to deploy to $NEXT_PUBLIC_DOMAIN"