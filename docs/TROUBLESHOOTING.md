# Troubleshooting Guide - Plataforma Astral

**Educational Management SaaS Platform**  
**Common Issues and Solutions**  
**Last Updated**: November 20, 2025  
**Status**: Production Ready ✅

---

## 📋 Quick Reference

| Issue Category     | Common Symptoms                   | Quick Fix                                                   |
| ------------------ | --------------------------------- | ----------------------------------------------------------- |
| **Authentication** | Login failures, redirects         | [Check Clerk Setup](#🔐-authentication-issues)              |
| **Database**       | Data not loading, mutations fail  | [Verify Convex Connection](#💾-database-issues)             |
| **Build/Deploy**   | Build failures, deployment errors | [Check Environment](#🏗️-build-and-deployment-issues)        |
| **Development**    | Dev server won't start            | [Fix Development Setup](#💻-development-environment-issues) |
| **Performance**    | Slow loading, timeouts            | [Optimize Performance](#⚡-performance-issues)              |

---

## 🔐 Authentication Issues

### "Sign in with Clerk" not working

**Symptoms:**

- Login page doesn't load
- Redirect loops
- "Invalid redirect URL" errors

**Solutions:**

1. **Check Clerk Configuration:**

   ```bash
   # Verify environment variables
   echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   echo $CLERK_SECRET_KEY
   ```

2. **Verify Clerk Application Settings:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Check "Redirect URLs" include your domain
   - Ensure "Allowed Origins" includes `http://localhost:3000` for development

3. **Check Domain Settings:**

   ```javascript
   // In clerk-config.ts, verify:
   export const clerkConfig = {
     publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
     secretKey: process.env.CLERK_SECRET_KEY!,
     domain: process.env.NODE_ENV === 'production'
       ? 'plataforma.aramac.dev'
       : undefined
   };
   ```

### Users can't access role-specific pages

**Symptoms:**

- Redirected to home page
- "Access denied" messages
- Wrong role permissions

**Solutions:**

1. **Check Role Assignment in Clerk:**
   - User must have `publicMetadata.role` set
   - Valid roles: `MASTER`, `ADMIN`, `PROFESOR`, `PARENT`

2. **Verify Route Protection:**

   ```typescript
   // Check src/proxy.ts for route rules
   const roleRoutes = {
     "/admin/**": ["ADMIN", "MASTER"],
     "/profesor/**": ["PROFESOR", "ADMIN", "MASTER"],
     "/parent/**": ["PARENT", "ADMIN", "MASTER"],
   };
   ```

3. **Update User Role:**

   ```bash
   # Use Clerk dashboard or API to update user metadata
   # publicMetadata: { role: "PROFESOR" }
   ```

### Session expires immediately

**Symptoms:**

- Constant logouts
- Session not persisting

**Solutions:**

1. **Check Cookie Settings:**

   ```typescript
   // In clerk-config.ts
   <ClerkProvider
     publishableKey={publishableKey}
     appearance={{ /* styles */ }}
   >
   ```

2. **Verify Domain Configuration:**
   - Development: No domain needed
   - Production: Set domain in Clerk dashboard

---

## 💾 Database Issues

### "Cannot find module '.../\_generated/...'""

**Symptoms:**

- Build fails with missing generated types
- Convex functions not found
- TypeScript errors

**Solutions:**

1. **Generate Convex Types:**

   ```bash
   # Ensure Convex dev server is running
   npm run convex:dev

   # Or regenerate types manually
   npx convex typegen
   ```

2. **Check Convex Configuration:**

   ```javascript
   // convex/convex.config.ts should exist
   export default defineApp({
     generated: {
       dataModel: "./dataModel.ts",
       schema: "./schema.ts",
     },
   });
   ```

3. **Verify Environment:**

   ```bash
   # Check Convex URL
   echo $NEXT_PUBLIC_CONVEX_URL
   ```

### Data mutations fail silently

**Symptoms:**

- UI updates but data doesn't persist
- No error messages in console
- Queries return stale data

**Solutions:**

1. **Check Mutation Permissions:**

   ```typescript
   // Convex functions must have proper role checks
   export const createMeeting = tenantMutation({
     args: {
       /* args */
     },
     roles: ["PROFESOR", "ADMIN", "MASTER"], // Check roles
     handler: async (ctx, args, tenancy) => {
       // Implementation
     },
   });
   ```

2. **Verify Database Connection:**

   ```bash
   # Test Convex connection
   curl https://your-project.convex.cloud/version
   ```

3. **Check Network Tab:**
   - Open DevTools → Network
   - Look for failed Convex requests
   - Check CORS headers

### Real-time updates not working

**Symptoms:**

- Data changes not reflected immediately
- Subscriptions not firing
- UI shows stale data

**Solutions:**

1. **Check Subscription Setup:**

   ```typescript
   // Correct usage
   import { useQuery } from "convex/react";

   const data = useQuery(api.functionName, args);
   // Automatic real-time updates included
   ```

2. **Verify Convex Client:**

   ```typescript
   // src/lib/convex.ts
   import { ConvexReactClient } from "convex/react";

   const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
   ```

3. **Check Network Connection:**
   - WebSocket connections must be allowed
   - No corporate firewalls blocking real-time connections

---

## 🏗️ Build and Deployment Issues

### Build fails with type errors

**Symptoms:**

- `npm run build` fails
- TypeScript compilation errors
- Import/export issues

**Solutions:**

1. **Run Type Check:**

   ```bash
   npm run type-check
   # Fix all TypeScript errors
   ```

2. **Check Dependencies:**

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify Environment Variables:**

   ```bash
   # All required env vars must be set
   npm run verify-deployment
   ```

4. **Check Node.js Version:**

   ```bash
   node --version  # Should be 18+
   ```

### Deployment succeeds but site doesn't work

**Symptoms:**

- Build passes, deploy succeeds
- Site loads but features don't work
- Console shows missing environment variables

**Solutions:**

1. **Verify Environment Variables:**
   - Check Vercel/Netlify dashboard
   - Ensure all required variables are set
   - No extra spaces or quotes

2. **Check Build Configuration:**

   ```javascript
   // next.config.ts
   const config = {
     env: {
       NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
       NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
         process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
     },
   };
   ```

3. **Deploy Convex Backend First:**

   ```bash
   npm run convex:deploy
   # Then deploy frontend
   ```

### Vercel deployment stuck or failing

**Symptoms:**

- Deployment queued indefinitely
- Build timeout errors
- Memory limit exceeded

**Solutions:**

1. **Check Build Settings:**
   - Node.js version: 18.x or 20.x
   - Build command: `npm run build`
   - Install command: `npm install`

2. **Optimize Build:**

   ```javascript
   // next.config.ts - Add build optimizations
   const config = {
     swcMinify: true,
     experimental: {
       webpackBuildWorker: true,
     },
   };
   ```

3. **Increase Memory Limit:**

   ```bash
   # Already configured in package.json
   "build": "NODE_OPTIONS=\"--max-old-space-size=8192\" next build --webpack"
   ```

---

## 💻 Development Environment Issues

### "npm install" fails

**Symptoms:**

- Installation hangs or fails
- Permission errors
- Network timeouts

**Solutions:**

1. **Clear Cache:**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   ```

2. **Use Correct Node Version:**

   ```bash
   # Check version
   node --version  # Should be 18+

   # If using nvm
   nvm use 18
   ```

3. **Check Network:**

   ```bash
   # Try with different registry
   npm config set registry https://registry.npmjs.org/
   ```

### Development server won't start

**Symptoms:**

- `npm run dev` fails
- Port 3000 already in use
- Module resolution errors

**Solutions:**

1. **Kill Existing Process:**

   ```bash
   # Find and kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Clear Next.js Cache:**

   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check Dependencies:**

   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

### Hot reload not working

**Symptoms:**

- Changes not reflected in browser
- Manual refresh required

**Solutions:**

1. **Check File Watching:**

   ```bash
   # Some systems have file watching limits
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Disable Antivirus:**
   - Some antivirus software interferes with file watching

3. **Check Development Mode:**

   ```bash
   # Ensure running in development mode
   npm run dev  # Not npm start
   ```

---

## ⚡ Performance Issues

### Slow initial page loads

**Symptoms:**

- Slow first load times
- Large bundle sizes
- Poor Lighthouse scores

**Solutions:**

1. **Enable Code Splitting:**

   ```typescript
   // Dynamic imports for large components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <div>Loading...</div>
   });
   ```

2. **Optimize Images:**

   ```typescript
   // Use Next.js Image component
   import Image from 'next/image';
   <Image src="/hero.jpg" alt="Hero" width={800} height={600} priority />
   ```

3. **Bundle Analysis:**

   ```bash
   # Analyze bundle size
   npm install --save-dev @next/bundle-analyzer
   npm run build:analyze
   ```

### Database queries are slow

**Symptoms:**

- API calls taking >2 seconds
- UI freezing during data loads
- Timeout errors

**Solutions:**

1. **Add Database Indexes:**

   ```typescript
   // convex/schema.ts
   meetings: defineTable({
     // Add indexes for frequently queried fields
   })
     .index("by_user", ["userId"])
     .index("by_date", ["scheduledAt"]);
   ```

2. **Optimize Queries:**

   ```typescript
   // Use specific field selection
   const meetings = useQuery(api.meetings.getMeetings, {
     status: "pending",
     limit: 10,
   });
   ```

3. **Implement Caching:**

   ```typescript
   // Use Convex's built-in caching
   // Queries automatically cache results
   ```

### Memory leaks in development

**Symptoms:**

- Increasing memory usage over time
- Dev server slowdown
- Browser tab crashes

**Solutions:**

1. **Restart Dev Server Regularly:**

   ```bash
   # Kill and restart
   Ctrl+C
   npm run dev
   ```

2. **Check for Component Leaks:**

   ```typescript
   // Clean up event listeners
   useEffect(() => {
     const handler = () => setState(newState);
     window.addEventListener("event", handler);
     return () => window.removeEventListener("event", handler);
   }, []);
   ```

---

## 🔧 Advanced Troubleshooting

### Debug Authentication Flow

```typescript
// Add to component for debugging
import { useAuth } from "@clerk/nextjs";

function DebugAuth() {
  const { userId, sessionId } = useAuth();
  console.log("Auth Debug:", { userId, sessionId });

  return null;
}
```

### Inspect Convex Requests

```typescript
// Add Convex request logging
import { ConvexProvider } from "convex/react";

function App() {
  return (
    <ConvexProvider client={convex}>
      <Component />
    </ConvexProvider>
  );
}
```

### Network Debugging

1. **Check Network Tab:**
   - Open DevTools → Network
   - Filter by "convex"
   - Look for failed requests

2. **Test API Endpoints:**

   ```bash
   # Test Convex health
   curl https://your-project.convex.cloud/version
   ```

3. **WebSocket Connections:**
   - Convex uses WebSockets for real-time
   - Ensure no firewall blocking

---

## 🚨 Emergency Procedures

### Complete System Reset

**When nothing else works:**

1. **Clear All Caches:**

   ```bash
   rm -rf node_modules .next .convex
   npm install
   ```

2. **Reset Environment:**

   ```bash
   cp .env.example .env
   # Reconfigure all variables
   ```

3. **Redeploy Everything:**

   ```bash
   npm run convex:deploy
   npm run deploy
   ```

### Contact Support

**For urgent issues:**

- Check [EMERGENCY_ACCESS_PROCEDURES.md](./EMERGENCY_ACCESS_PROCEDURES.md)
- Email: [support@plataforma-astral.com](mailto:support@plataforma-astral.com)
- Response time: <4 hours for critical issues

---

## 📚 Additional Resources

- **[AI Knowledge Base](./AI_KNOWLEDGE_BASE.md)** - Complete system documentation
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Deployment procedures
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Development guidelines

---

**Can't find your issue?** Check the [AI Knowledge Base](./AI_KNOWLEDGE_BASE.md) troubleshooting section or create an issue on GitHub.
