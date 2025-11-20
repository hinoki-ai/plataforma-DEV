#!/bin/bash

# Verify Master User Creation
# This script checks if the master user was created successfully

echo "🔍 VERIFYING MASTER USER CREATION"
echo "================================="
echo ""

# Check if Clerk secret key is provided
if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "⚠️  CLERK_SECRET_KEY not provided - checking Convex database only"
    echo ""
    
    # Check Convex database
    echo "📊 Checking Convex database for master user..."
    echo "Run this command to check:"
    echo "npx convex dashboard"
    echo ""
    echo "Then look for a user with:"
    echo "- Email: agustin@astral.cl"
    echo "- Role: MASTER"
    echo "- Clerk ID: (should be present)"
    echo ""
    echo "If the user exists in Convex, the sync worked!"
    echo ""
    exit 0
fi

echo "🔍 Checking Clerk for master user..."

# Check if user exists in Clerk
response=$(curl -s -X GET "https://api.clerk.com/v1/users?email_address=agustin@astral.cl" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY")

user_count=$(echo "$response" | jq -r '.data | length')

if [ "$user_count" -gt 0 ]; then
    echo "✅ User found in Clerk!"
    
    user_id=$(echo "$response" | jq -r '.data[0].id')
    email=$(echo "$response" | jq -r '.data[0].email_addresses[0].email_address')
    role=$(echo "$response" | jq -r '.data[0].public_metadata.role // "Not set"')
    verified=$(echo "$response" | jq -r '.data[0].email_addresses[0].verification.status')
    
    echo "🆔 User ID: $user_id"
    echo "📧 Email: $email"
    echo "Role: $role"
    echo "✅ Email Verified: $verified"
    
    if [ "$role" = "MASTER" ]; then
        echo ""
        echo "🎯 PERFECT! Master user is correctly configured!"
        echo ""
        echo "🔄 Next steps:"
        echo "1. Wait 1-2 minutes for webhook sync to Convex"
        echo "2. Try logging in with:"
        echo "   Email: agustin@astral.cl"
        echo "   Password: 59163476a"
        echo "3. You should be redirected to the master dashboard"
    else
        echo ""
        echo "⚠️  WARNING: User role is not set to MASTER!"
        echo "Current role: $role"
        echo ""
        echo "🔧 To fix this:"
        echo "1. Go to Clerk dashboard"
        echo "2. Find user: agustin@astral.cl"
        echo "3. Edit user metadata"
        echo "4. Set public metadata role to 'MASTER'"
    fi
    
else
    echo "❌ User not found in Clerk!"
    echo ""
    echo "🔧 To create the user:"
    echo "1. Go to https://dashboard.clerk.com"
    echo "2. Select your application: Plataforma Astral"
    echo "3. Navigate to 'Users' section"
    echo "4. Click 'Add user'"
    echo "5. Use email: agustin@astral.cl"
    echo "6. Use password: 59163476a"
    echo "7. Set role metadata to 'MASTER'"
fi

echo ""
echo "📊 Additional Verification:"
echo "---------------------------"
echo "You can also check the Convex database:"
echo "1. Run: npx convex dashboard"
echo "2. Go to 'Data' tab"
echo "3. Look at 'users' table"
echo "4. Find user with email: agustin@astral.cl"
echo "5. Verify role is 'MASTER' and clerkId is present"
