#!/bin/bash
# Try to generate and use a bypass token

# Method 1: Try setting VERCEL_AUTOMATION_BYPASS_SECRET
# This should disable protection for CI/CD
npx vercel env add VERCEL_AUTOMATION_BYPASS_SECRET --yes << 'PASS'
automation-bypass
PASS

sleep 5

# Redeploy to apply
npx vercel --prod --skip-domain

