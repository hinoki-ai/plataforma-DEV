#!/bin/bash

echo "🚀 Setting up Resend email for Plataforma Astral..."

# Remove old Gmail environment variables
echo "Removing old Gmail SMTP variables..."
npx vercel env rm EMAIL_SERVER_HOST production --yes
npx vercel env rm EMAIL_SERVER_PORT production --yes
npx vercel env rm EMAIL_SERVER_USER production --yes
npx vercel env rm EMAIL_SERVER_PASSWORD production --yes

echo ""
echo "📋 NEXT STEPS (you need to do these manually):"
echo ""
echo "1. Go to https://resend.com and sign up with preuastral@gmail.com"
echo "2. Verify your email"
echo "3. Go to API Keys → Create API Key → Name it 'Plataforma Astral'"
echo "4. Copy the API key (starts with 're_')"
echo ""
echo "5. Run this command and paste the API key:"
echo "npx vercel env add RESEND_API_KEY production"
echo ""
echo "6. In Resend dashboard → Domains → Add domain"
echo "   Add: resend.dev (use their shared domain for now)"
echo ""
echo "7. Set from email:"
echo "npx vercel env add EMAIL_FROM production"
echo "Enter: preuastral@gmail.com@resend.dev"
echo ""
echo "8. Test by submitting contact form on your site"
echo ""
echo "✅ Email system code is ready - just needs API key!"
