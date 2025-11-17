# Plataforma Astral - Educational Management SaaS

**Educational Management Platform for Chilean Institutions**  
**Built with Next.js 16 + React 19 + TypeScript + Convex**  
**Status**: Production Ready ✅ | **Site**: [plataforma.aramac.dev](https://plataforma.aramac.dev)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account (free at [convex.dev](https://convex.dev))

### Installation (5 minutes)

```bash
# Install dependencies
npm install

# Initialize Convex backend
npx convex dev

# Configure environment
cp .env.example .env
# Add CONVEX_URL from terminal output to .env

# Start development
npm run dev
```

### Test Credentials

| Role    | Email                            | Password    |
| ------- | -------------------------------- | ----------- |
| Admin   | `admin@plataforma-astral.com`    | admin123    |
| Teacher | `profesor@plataforma-astral.com` | profesor123 |
| Parent  | `parent@plataforma-astral.com`   | parent123   |

## 📖 Overview

Plataforma Astral is a comprehensive educational management platform that provides:

- 📚 **Teacher Planning**: Lesson planning and curriculum management
- 📅 **Parent-Teacher Meetings**: Scheduling and coordination system
- 📊 **School Calendar**: Institution-wide event management
- 👥 **Role-Based Access**: Secure multi-user system (Admin/Teacher/Parent)
- 🗳️ **Centro Consejo Voting**: Digital voting platform for school councils
- 📁 **Media Resources**: Photo and video management system

### Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Backend**: Convex (serverless real-time database)
- **Authentication**: Clerk with role-based access
- **UI**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel (frontend) + Convex (backend)

## 📚 Documentation

### Quick Navigation

| I want to...                     | Go to...                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| **Start developing**             | [START_HERE.md](./START_HERE.md)                                                        |
| **Deploy to production**         | [DEPLOYMENT.md](./DEPLOYMENT.md)                                                        |
| **Understand authentication**    | [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) (Clerk + Convex auth)          |
| **Learn system architecture**    | [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)                                |
| **Troubleshoot issues**          | [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) (see troubleshooting sections) |
| **Complete documentation index** | [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)                                      |

### Key Documentation Files

- **[START_HERE.md](./START_HERE.md)** - First-time setup and development guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment procedures
- **[docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)** - Complete system documentation including Clerk + Convex auth
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Full documentation catalog

## 🎯 Key Features

### For Administrators

- Complete user management and system configuration
- Team member oversight and calendar administration
- Meeting coordination and planning document review

### For Teachers

- Lesson planning and curriculum development
- Parent-teacher meeting scheduling
- Student progress tracking and communication

### For Parents

- Meeting requests with teachers
- Access to school calendar and announcements
- Communication with educational staff

### For Everyone

- Real-time updates powered by Convex
- Responsive mobile-friendly design
- Secure authentication and role-based access

---

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start Next.js development server
npx convex dev           # Start Convex backend (separate terminal)
npm run format           # Format code with Prettier
npm run lint            # Run ESLint (must pass 0 warnings)
npm run type-check      # TypeScript type checking

# Testing
npm run test:unit        # Unit tests with Vitest
npm run test:e2e         # E2E tests with Playwright
npm run test:all         # Complete test suite

# Deployment
npm run deploy           # Automated deployment with checks
npm run build           # Production build test
npx convex deploy       # Deploy Convex backend
```

## 📞 Support & Resources

- **📖 Documentation**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- **🚀 Setup Guide**: [START_HERE.md](./START_HERE.md)
- **🔐 Authentication**: [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) (Clerk + Convex auth system)
- **🚢 Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **🏗️ Architecture**: [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)

---

**Plataforma Astral** - Educational Management SaaS  
**Version**: 1.0.0 | **Last Updated**: January 2025  
**Status**: Production Ready ✅
