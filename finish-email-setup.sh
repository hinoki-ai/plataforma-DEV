#!/bin/bash

echo "🎯 Final Email Setup for preuastral@gmail.com"
echo ""

# Check if API key is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your Resend API key as an argument"
    echo "Usage: ./finish-email-setup.sh your_api_key_here"
    echo ""
    echo "Get your API key from: https://resend.com → API Keys"
    exit 1
fi

API_KEY=$1

echo "🔑 Setting Resend API key..."
echo "$API_KEY" | npx vercel env add RESEND_API_KEY production

echo ""
echo "📧 Setting from email..."
echo "preuastral@gmail.com@resend.dev" | npx vercel env add EMAIL_FROM production

echo ""
echo "✅ Email system is now fully configured!"
echo ""
echo "🧪 Test it by submitting the contact form on your website"
echo "📬 Emails will be sent to: preuastral@gmail.com"
echo ""
echo "Need to verify your domain in Resend for better deliverability:"
echo "1. Go to resend.com → Domains"
echo "2. Add 'resend.dev' domain (already configured)"
echo "3. Or add your own domain for full branding"
