# 🔐 Clerk Authentication Setup Guide

## Current Status

✅ Clerk is already configured in Vercel with the following environment variables:

- `CLERK_SECRET_KEY` - Live secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Live publishable key
- `CLERK_WEBHOOK_SECRET` - Webhook secret
- `NEXT_PUBLIC_CONVEX_URL` - Production Convex URL

## Next Steps to Enable Google OAuth

### 1. Configure Google OAuth in Clerk Dashboard

1. **Access Clerk Dashboard**:
   - Go to [clerk.com](https://clerk.com) and sign in
   - Select your application: `plataforma.aramac.dev`

2. **Enable Google OAuth**:
   - Navigate to **"User & Authentication"** → **"Social Connections"**
   - Find **"Google"** and click **"Configure"**
   - Toggle **"Enable Google"** to ON

3. **Set up Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable **Google+ API** and **Google OAuth2 API**
   - Go to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
   - Application type: **"Web application"**
   - Authorized redirect URIs:
     ```
     https://clerk.plataforma.aramac.dev/v1/oauth_callback
     http://localhost:3000/v1/oauth_callback
     ```

4. **Configure in Clerk**:
   - Copy **Client ID** and **Client Secret** from Google
   - Paste them into Clerk's Google configuration
   - Save the configuration

### 2. Update Local Environment

Create/update your `.env.local` file:

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://different-jackal-611.convex.cloud

# Clerk Authentication (from Vercel)
CLERK_SECRET_KEY=sk_live_md0bpwbKQhw0WFK1UgDELDYIVv7VUqI0KcuzjJ4hht
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucGxhdGFmb3JtYS5hcmFtYWMuZGV2JA
CLERK_WEBHOOK_SECRET=whsec_aAAkO7Fa5AYqSYzs8EJkk7qN+gqs2M2q
```

### 3. Test the Setup

1. **Start Development Server**:

   ```bash
   npm run dev
   npx convex dev  # In separate terminal
   ```

2. **Test Google Login**:
   - Go to `http://localhost:3000/login`
   - Click "Continuar con Google"
   - Should redirect to Google OAuth flow

3. **Test Production**:
   - Deploy to Vercel: `git push origin main`
   - Test at `https://plataforma.aramac.dev/login`

## Current Implementation

The application is already set up with:

- ✅ ClerkProvider with proper configuration
- ✅ Google Sign-In button in login page
- ✅ Middleware protection for routes
- ✅ User session management with Convex integration
- ✅ Role-based access control

## Troubleshooting

### Google OAuth Not Working

1. Check Google Cloud Console redirect URIs
2. Verify Client ID/Secret in Clerk dashboard
3. Ensure domain is authorized in Google Console

### Environment Variables Issues

1. Restart development server after changing `.env.local`
2. Check Vercel environment variables: `npx vercel env ls`
3. Redeploy if production variables changed

### Clerk Configuration Issues

1. Check Clerk dashboard for application status
2. Verify publishable key matches environment
3. Check webhook endpoints if using user management

## Commands Reference

```bash
# Check Vercel environment variables
npx vercel env ls

# Pull environment variables locally
npx vercel env pull .env.vercel

# Deploy to production
git push origin main

# Check deployment status
npx vercel ls

# Test health endpoint
curl https://plataforma.aramac.dev/api/health
```

## Security Notes

- ✅ Clerk handles OAuth securely
- ✅ Environment variables are properly encrypted in Vercel
- ✅ Middleware protects all routes
- ✅ User sessions are validated server-side
- ✅ Role-based access control implemented

The authentication system is now properly configured with Clerk and ready for Google OAuth integration!
