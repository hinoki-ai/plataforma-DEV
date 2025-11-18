# 🚀 START HERE - Plataforma Astral SaaS Platform

**Project**: Plataforma Astral  
**Stack**: Next.js 16 + React 19 + TypeScript + Convex  
**Status**: Production Ready ✅

---

## 📍 Quick Navigation

| I want to...                              | Go to...                                           |
| ----------------------------------------- | -------------------------------------------------- |
| **Set up the project for the first time** | [First Time Setup](#-first-time-setup-10-minutes)  |
| **Understand the Convex migration**       | [archive/MIGRATION.md](./archive/MIGRATION.md)     |
| **See all documentation**                 | [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) |
| **Deploy to production**                  | [DEPLOYMENT.md](./DEPLOYMENT.md)                   |
| **Work on the codebase (AI)**             | [CLAUDE.md](./CLAUDE.md)                           |

---

## ⚡ First Time Setup (10 Minutes)

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- A Convex account (free at convex.dev)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Initialize Convex Backend

```bash
npx convex dev
```

This will:

- Open your browser for Convex authentication
- Let you create/select a Convex project
- Generate TypeScript types in `convex/_generated/`
- Display your deployment URL

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Add the Convex URL from Step 2
echo "NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud" >> .env
```

### Step 4: Start Development

```bash
# Terminal 1 - Keep Convex running
npx convex dev

# Terminal 2 - Start Next.js
npm run dev
```

### Step 5: Verify It Works

```bash
# Should return healthy status
curl http://localhost:3000/api/db/health
```

**🎉 You're ready to develop!**

---

## 🏗️ Project Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: Convex (Serverless, Real-time)
- **Authentication**: Clerk (with Convex integration)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript throughout

### Folder Structure

```text
plataforma-astral/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── (main)/            # Protected pages by role
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities & config
│   └── services/              # Business logic layer
├── convex/                    # Backend functions
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User operations
│   ├── meetings.ts           # Meeting operations
│   └── _generated/           # Auto-generated types
├── docs/                      # Documentation
└── tests/                     # Test suite
```

---

## 🔐 User Roles & Access

| Role         | Access                  | Default Email                    | Password    |
| ------------ | ----------------------- | -------------------------------- | ----------- |
| **ADMIN**    | Full system access      | <admin@plataforma-astral.com>    | admin123    |
| **PROFESOR** | Teaching tools          | <profesor@plataforma-astral.com> | profesor123 |
| **PARENT**   | Student info & meetings | <parent@plataforma-astral.com>   | parent123   |
| **PUBLIC**   | Limited public access   | -                                | -           |

---

## 📊 Current Status

### ✅ Complete

- **Convex backend**: Fully migrated and operational
- **Authentication**: Clerk integration complete
- **Real-time features**: Convex-powered live updates
- **Production ready**: System deployed and stable

**Historical reference**: See [archive/MIGRATION.md](./archive/MIGRATION.md) for migration details (migration complete).

---

## 🎯 Common Development Tasks

### Running the Application

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

### Testing

```bash
# Run all tests
npm run test:all

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e
```

### Convex Commands

```bash
# Start Convex dev server
npx convex dev

# Open Convex dashboard
npx convex dashboard

# Deploy to production
npx convex deploy
```

---

## 📚 Documentation Structure

### Essential Reading

- **[README.md](./README.md)** - Project overview and quick start
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation catalog
- **[CLAUDE.md](./CLAUDE.md)** - Guide for AI assistants working on this project
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment procedures & environments

### Technical Documentation

- **[docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)** - **PRIMARY**: Complete system documentation (AI-optimized) including Clerk + Convex authentication
- **All documentation**: See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for complete list

---

## 🛠️ Development Workflow

### Creating a Feature

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... code ...

# 3. Test locally
npm run test:all
npm run lint
npm run type-check

# 4. Commit & push
git commit -m "feat: your feature description"
git push origin feature/your-feature-name

# 5. Create pull request
```

### Working with Convex

```typescript
// Reading data (Query) - Client component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const meetings = useQuery(api.meetings.getMeetings, {});

// Writing data (Mutation) - Client component
import { useMutation } from "convex/react";

const createMeeting = useMutation(api.meetings.createMeeting);
await createMeeting({ title, date, userId });

// Server-side operations
import { getConvexClient } from "@/lib/convex";
const client = getConvexClient();
const meetings = await client.query(api.meetings.getMeetings, {});
```

---

## 🆘 Troubleshooting

### "Cannot find module '.../\_generated/...'"

**Solution**: Run `npx convex dev` to generate types

### "Convex client not initialized"

**Solution**: Check `.env` has `NEXT_PUBLIC_CONVEX_URL` and restart dev server

### Build Errors

**Solution**: Ensure Convex dev is running in background (`npx convex dev`)

### Authentication Issues

**Solution**: See [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) authentication section or [docs/CLERK_SETUP.md](./docs/CLERK_SETUP.md)

### Clerk Configuration Issues

**Solution**: Check [docs/CLERK_SETUP.md](./docs/CLERK_SETUP.md) for setup instructions

---

## 🎓 Learning Resources

### Convex

- [Convex Documentation](https://docs.convex.dev/)
- [Next.js + Convex Guide](https://docs.convex.dev/quickstart/nextjs)
- [Convex Dashboard](https://dashboard.convex.dev/)

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Project-Specific

- Read [CLAUDE.md](./CLAUDE.md) for development patterns
- Review [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) for complete system documentation
- Check existing code in `src/services/` for examples

---

## 💡 Key Features

### For Administrators

- Complete user management
- System configuration
- Team management
- Global calendar administration

### For Teachers (Profesores)

- Lesson planning
- Parent-teacher meetings
- Student activities
- Resource sharing

### For Parents

- Meeting requests
- Student progress tracking
- School calendar
- Communication with teachers

### For Everyone

- Real-time updates (thanks to Convex!)
- Responsive mobile design
- Secure authentication
- Multi-language support

---

## 🚀 Next Steps

1. **Complete Setup** - Follow [First Time Setup](#-first-time-setup-10-minutes) above
2. **Explore Codebase** - Read [CLAUDE.md](./CLAUDE.md) for development patterns
3. **Review Documentation** - Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for all available guides
4. **Start Developing** - Pick a task from the docs or create new features

---

## 📞 Getting Help

- **Documentation**: See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for complete catalog
- **System Overview**: Review [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) for comprehensive documentation
- **Convex Support**: Visit [Convex Discord](https://convex.dev/community)
- **Development Patterns**: Reference [CLAUDE.md](./CLAUDE.md)

---

**Ready to start?** Run `npx convex dev` and begin developing! 🎉
