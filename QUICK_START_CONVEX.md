# ⚡ Quick Start with Convex

## 🚀 3-Minute Setup

### 1. Initialize Convex
\`\`\`bash
npx convex dev
\`\`\`

**What happens:**
- Opens browser for Convex login
- Creates/links project
- Generates types in `convex/_generated/`
- Gives you `NEXT_PUBLIC_CONVEX_URL`

### 2. Update .env
\`\`\`bash
# Copy the URL from the convex dev output
echo "NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud" >> .env
\`\`\`

### 3. Start Development
\`\`\`bash
# Terminal 1 - Convex (watches for changes)
npx convex dev

# Terminal 2 - Next.js
npm run dev
\`\`\`

**OR use the combined command:**
\`\`\`bash
npm run dev  # Runs both Convex and Next.js
\`\`\`

---

## 🔧 If You Already Have a Convex Project

\`\`\`bash
# Get your deployment URL
npx convex dev --configure=existing

# Select your project
# Copy the URL to .env
\`\`\`

---

## ✅ Verify It's Working

1. **Check types generated:**
   \`\`\`bash
   ls convex/_generated/
   # Should see: api.d.ts, dataModel.d.ts, server.d.ts
   \`\`\`

2. **Type check passes:**
   \`\`\`bash
   npm run type-check
   # Should complete with 0 errors
   \`\`\`

3. **Open Convex dashboard:**
   \`\`\`bash
   npx convex dashboard
   \`\`\`

---

## 🎯 First Steps After Setup

### Create Your First User
\`\`\`bash
npm run create-admin
\`\`\`

This will create an admin user you can log in with.

### Explore Your Data
Open the Convex dashboard:
\`\`\`bash
npx convex dashboard
\`\`\`

View your tables, run queries, and see real-time updates!

---

## 🐛 Common Issues

### Port 3000 already in use
\`\`\`bash
# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
\`\`\`

### Convex dev not finding project
\`\`\`bash
# Manually configure
npx convex dev --configure
\`\`\`

### NEXT_PUBLIC_CONVEX_URL not set
**Error**: "Convex client not initialized"  
**Fix**: Check `.env` file has the URL

---

## 📖 Next: Update API Routes

See `MIGRATION_STATUS.md` for the full list of files that need updating.

**Quick pattern to follow:**
\`\`\`typescript
// ❌ OLD (Prisma)
import { db } from '@/lib/db';
const meetings = await db.meeting.findMany();

// ✅ NEW (Convex)
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
const client = getConvexClient();
const meetings = await client.query(api.meetings.getMeetings, {});
\`\`\`

---

## 🎉 That's It!

Your Convex backend is ready. Check `MIGRATION_STATUS.md` for remaining tasks.

**Happy coding! 🚀**
