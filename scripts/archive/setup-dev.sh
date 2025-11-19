#!/bin/bash

# Development setup script for Plataforma Astral
# This script sets up the development environment with SQLite

set -e

echo "🔧 Setting up development environment..."

# Check if Convex is configured
if [[ -n "$CONVEX_URL" ]]; then
    echo "🔗 Convex database configured"

    # Check Convex deployment status
    echo "🔍 Checking Convex deployment..."
    npx convex deploy --dry-run
    
    echo "✅ Development environment setup complete!"
    echo "📊 Database: SQLite"
    echo "🔗 Health endpoint: http://localhost:3000/api/health"
else
    echo "📁 Using SQLite database"
    
    # Generate Prisma client
    echo "🔨 Generating Prisma client..."
    npx prisma generate
    
    echo "✅ Environment setup complete!"
    echo "📊 Database: SQLite"
    echo "🔗 Health endpoint: http://localhost:3000/api/health"
fi

echo ""
echo "🚀 You can now run: npm run dev" 