#!/bin/bash

# 🔐 Clerk Authentication Setup Script
# This script helps you set up Clerk authentication with Google OAuth

set -e

echo "🔐 Setting up Clerk Authentication with Google OAuth..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"
echo ""

# Check if Clerk is installed
if ! npm list @clerk/nextjs > /dev/null 2>&1; then
    echo "❌ Error: @clerk/nextjs is not installed"
    echo "Please run: npm install @clerk/nextjs"
    exit 1
fi

echo "✅ Clerk is installed"
echo ""

# Check environment variables
echo "🔍 Checking environment variables..."

if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://different-jackal-611.convex.cloud

# Clerk Authentication (from Vercel)
CLERK_SECRET_KEY=sk_live_md0bpwbKQhw0WFK1UgDELDYIVv7VUqI0KcuzjJ4hht
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucGxhdGFmb3JtYS5hcmFtYWMuZGV2JA
CLERK_WEBHOOK_SECRET=whsec_aAAkO7Fa5AYqSYzs8EJkk7qN+gqs2M2q
EOF
    echo "✅ Created .env.local template"
else
    echo "✅ .env.local exists"
fi

echo ""

# Check Vercel environment variables
echo "🔍 Checking Vercel environment variables..."
if command -v vercel >/dev/null 2>&1; then
    echo "Vercel environment variables:"
    npx vercel env ls
    echo ""
else
    echo "⚠️  Vercel CLI not found. Please install it: npm install -g vercel"
fi

# Test TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
if npm run type-check; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo ""

# Test build
echo "🔍 Testing build..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps to enable Google OAuth:"
echo ""
echo "1. 🌐 Configure Google OAuth in Clerk Dashboard:"
echo "   - Go to https://clerk.com and sign in"
echo "   - Select your application: plataforma.aramac.dev"
echo "   - Navigate to 'User & Authentication' → 'Social Connections'"
echo "   - Enable Google OAuth"
echo ""
echo "2. 🔑 Set up Google Cloud Console:"
echo "   - Go to https://console.cloud.google.com"
echo "   - Create OAuth 2.0 Client ID"
echo "   - Add redirect URIs:"
echo "     - https://clerk.plataforma.aramac.dev/v1/oauth_callback"
echo "     - http://localhost:3000/v1/oauth_callback"
echo ""
echo "3. 🔗 Connect Google to Clerk:"
echo "   - Copy Client ID and Secret from Google"
echo "   - Paste them into Clerk's Google configuration"
echo ""
echo "4. 🚀 Test the setup:"
echo "   - Start dev server: npm run dev"
echo "   - Test Google login at: http://localhost:3000/login"
echo ""
echo "5. 📦 Deploy to production:"
echo "   - git add ."
echo "   - git commit -m 'feat: configure Clerk authentication'"
echo "   - git push origin main"
echo ""
echo "📚 For detailed instructions, see: CLERK_SETUP.md"
echo ""
echo "🔧 Useful commands:"
echo "   - Check Vercel env: npx vercel env ls"
echo "   - Deploy: git push origin main"
echo "   - Test health: curl https://plataforma.aramac.dev/api/health"
echo ""
echo "✨ Your authentication system is ready!"
