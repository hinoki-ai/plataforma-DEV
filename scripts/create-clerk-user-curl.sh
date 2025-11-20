#!/bin/bash

# Create Master User in Clerk using REST API
# This script creates a master user in Clerk with the correct role metadata

echo "🔐 Creating master user in Clerk using REST API..."
echo ""

# Check if Clerk secret key is provided
if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ CLERK_SECRET_KEY environment variable not found!"
    echo ""
    echo "📋 To get your Clerk secret key:"
    echo "1. Go to https://dashboard.clerk.com"
    echo "2. Select your application: Plataforma Astral"
    echo "3. Go to API Keys section"
    echo "4. Copy the Secret Key"
    echo "5. Set it as environment variable:"
    echo "   export CLERK_SECRET_KEY=sk_live_..."
    echo ""
    echo "Or run this script with the key:"
    echo "   CLERK_SECRET_KEY=sk_live_... ./scripts/create-clerk-user-curl.sh"
    echo ""
    exit 1
fi

echo "📧 Creating user with email: agustin@astral.cl"
echo "🔑 Password: 59163476a"
echo "Role: MASTER"
echo ""

# Create user in Clerk
response=$(curl -s -w "\n%{http_code}" -X POST "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": ["agustin@astral.cl"],
    "password": "59163476a",
    "first_name": "Agustin",
    "public_metadata": {
      "role": "MASTER"
    },
    "skip_password_checks": true,
    "skip_password_requirement": false
  }')

# Split response and status code
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo "✅ Master user created successfully in Clerk!"
    echo "$response_body" | jq -r '.id, .email_addresses[0].email_address, .public_metadata.role' | while read -r id email role; do
        echo "🆔 User ID: $id"
        echo "📧 Email: $email"
        echo "Role: $role"
    done
    
    echo ""
    echo "🔄 The user will be automatically synced to Convex via webhooks."
    echo "⏳ Please wait a few moments for the sync to complete."
    
    echo ""
    echo "🎯 You can now login with:"
    echo "   Email: agustin@astral.cl"
    echo "   Password: 59163476a"
    echo "   Role: MASTER (full system access)"
    
elif echo "$response_body" | grep -q "already exists"; then
    echo "⚠️  User already exists in Clerk."
    echo "🔍 Checking existing user..."
    
    # Get existing user
    existing_response=$(curl -s -X GET "https://api.clerk.com/v1/users?email_address=agustin@astral.cl" \
      -H "Authorization: Bearer $CLERK_SECRET_KEY")
    
    user_id=$(echo "$existing_response" | jq -r '.data[0].id // empty')
    
    if [ -n "$user_id" ]; then
        echo "✅ Found existing user: $user_id"
        current_role=$(echo "$existing_response" | jq -r '.data[0].public_metadata.role // "Not set"')
        echo "Current Role: $current_role"
        
        # Update the role if it's not MASTER
        if [ "$current_role" != "MASTER" ]; then
            echo ""
            echo "🔄 Updating user role to MASTER..."
            
            update_response=$(curl -s -w "\n%{http_code}" -X PATCH "https://api.clerk.com/v1/users/$user_id" \
              -H "Authorization: Bearer $CLERK_SECRET_KEY" \
              -H "Content-Type: application/json" \
              -d '{
                "public_metadata": {
                  "role": "MASTER"
                }
              }')
            
            update_code=$(echo "$update_response" | tail -n1)
            
            if [ "$update_code" -eq 200 ]; then
                echo "✅ User role updated to MASTER!"
            else
                echo "❌ Error updating user role:"
                echo "$update_response" | head -n -1
            fi
        fi
        
        echo ""
        echo "🎯 You can login with:"
        echo "   Email: agustin@astral.cl"
        echo "   Password: 59163476a"
        echo "   Role: MASTER"
    else
        echo "❌ Could not find existing user"
    fi
    
else
    echo "❌ Error creating user in Clerk:"
    echo "HTTP Code: $http_code"
    echo "$response_body"
    exit 1
fi
