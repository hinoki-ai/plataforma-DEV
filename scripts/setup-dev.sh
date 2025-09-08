#!/bin/bash

# Development setup script for ManitosPintadas
# This script sets up the development environment with SQLite

set -e

echo "🔧 Setting up development environment..."

# Check if we're in development mode
if [[ "$DATABASE_URL" == file:* ]]; then
    echo "📁 Using SQLite database"
    
    # Generate Prisma client
    echo "🔨 Generating Prisma client..."
    npx prisma generate
    
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