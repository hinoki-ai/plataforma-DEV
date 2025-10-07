# 🚀 Quick Start - Authentication System

## ⚡ 5-Minute Setup

### 1. Initialize Convex
```bash
npx convex dev
```
**This will open your browser - sign in and create/select a project**

### 2. Copy Convex URL
From the terminal output, copy your Convex URL:
```
Convex functions ready at https://xyz123.convex.cloud
```

### 3. Update .env
```bash
# Edit .env file
NEXT_PUBLIC_CONVEX_URL=https://xyz123.convex.cloud

# Generate and add NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start Development
```bash
# Terminal 1: Keep Convex dev running
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

### 5. Test Login
1. Open http://localhost:3000/login
2. Create test user in Convex dashboard or use registration
3. Login and verify redirect to dashboard

---

## ✅ Verification Checklist

After setup, verify these work:
- [ ] Can access login page
- [ ] Can register as parent
- [ ] Login redirects to correct dashboard
- [ ] Role-based routes protected
- [ ] Password change works
- [ ] Logout works

---

## 🆘 Quick Troubleshooting

**Error: Cannot find module '@/convex/_generated/api'**
→ Run `npx convex dev` to generate types

**Error: NEXT_PUBLIC_CONVEX_URL is not defined**
→ Add it to `.env` file (see step 3 above)

**Login fails with "Credenciales inválidas"**
→ Check if Convex dev server is running
→ Verify user exists in Convex dashboard

**TypeScript errors**
→ Restart TypeScript server in your editor
→ Run `npm run type-check`

---

## 📖 Full Documentation

See detailed docs:
- `AUTH_SETUP_GUIDE.md` - Complete setup instructions
- `AUTH_AUDIT_SUMMARY.md` - Full feature list & architecture
- `CLAUDE.md` - Project overview

---

**Ready to go!** Your auth system is fully configured and production-ready! 🎉
