# 📚 Plataforma Astral - Documentation Index

**Educational Management System**  
**Version**: 0.1.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅

---

## 🎯 AI-Oriented Documentation (PRIMARY)

### 🤖 **[AI Knowledge Base](./docs/AI_KNOWLEDGE_BASE.md)** - **RECOMMENDED STARTING POINT**

#### Complete consolidated documentation optimized for AI assistants and automated systems

- ✅ **Structured machine-readable format** with JSON/YAML sections
- ✅ **Comprehensive cross-references** between all system components
- ✅ **Current technology stack** (Clerk + Convex + Next.js 16)
- ✅ **Implementation patterns and constraints** for reliable development
- ✅ **Troubleshooting patterns** with diagnostic procedures
- ✅ **Migration guidance** for system evolution

**Use this document for all development, debugging, and system understanding tasks.**

---

## 🎯 Overview

Plataforma Astral is a comprehensive SaaS educational management platform built with Next.js 16, React 19, TypeScript, and Convex for real-time backend services. This platform provides complete school management functionality including user authentication, student management, voting systems, and administrative tools.

---

## 📖 Documentation Sections

### 🚀 Getting Started

- **[START_HERE.md](./START_HERE.md)** - First-time setup and development environment
- **[CLAUDE.md](./CLAUDE.md)** - AI Assistant development guidelines
- **[BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)** - Git workflow and branching strategy

### 🏗️ Architecture & Technical

- **[docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)** - **PRIMARY: Complete current system documentation**
- **[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)** - Environment configuration and deployment
- **[docs/ANIMATION_GUIDE.md](./docs/ANIMATION_GUIDE.md)** - UI animation patterns

### 🔐 Authentication & Security

- **[docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)** - **PRIMARY: Current Clerk + Convex auth system**
- **[docs/ROLE_SYSTEM.md](./docs/ROLE_SYSTEM.md)** - Role-based access control (RBAC) system
- **[docs/protected-paths.md](./docs/protected-paths.md)** - Protected routes and access control
- **[docs/EMERGENCY_ACCESS_PROCEDURES.md](./docs/EMERGENCY_ACCESS_PROCEDURES.md)** - Emergency access protocols
- **[docs/CLERK_SETUP.md](./docs/CLERK_SETUP.md)** - Clerk authentication setup guide

### 🚢 Deployment & Operations

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[scripts/deploy.js](./scripts/deploy.js)** - Automated deployment script
- **[scripts/verify-deployment.js](./scripts/verify-deployment.js)** - Deployment verification utilities

### 🎯 Features & Functionality

- **[docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md)** - **PRIMARY: Current feature implementations**
- **[docs/VOTING_SYSTEM.md](./docs/VOTING_SYSTEM.md)** - Centro Consejo voting system (AI-optimized guide)
- **[docs/LIBRO_DE_CLASES_GUIDE.md](./docs/LIBRO_DE_CLASES_GUIDE.md)** - Complete Libro de Clases system guide

### 🌐 Internationalization (i18n)

- **[docs/PAGE_I18N_GUIDE.md](./docs/PAGE_I18N_GUIDE.md)** - Complete internationalization implementation guide (client & server components, patterns, best practices)

### 📊 System Audits & Reviews

- **[docs/REVIEW_ANALYSIS.md](./docs/REVIEW_ANALYSIS.md)** - Review analysis of system refactoring and optimization decisions
- **[docs/ROLE_ACCESS_AUDIT.md](./docs/ROLE_ACCESS_AUDIT.md)** - Comprehensive role access control audit

### 🧪 Testing & Quality

- **[docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - Comprehensive testing guide and procedures

---

## 🛠️ Technology Stack

| Component          | Technology           | Version   |
| ------------------ | -------------------- | --------- |
| **Frontend**       | Next.js              | 16.0.1    |
| **Backend**        | Convex               | 1.27.4    |
| **Language**       | TypeScript           | 5.9.2     |
| **Styling**        | Tailwind CSS         | 4.x       |
| **UI Components**  | Radix UI + shadcn/ui | Latest    |
| **Authentication** | Clerk                | 6.34.0    |
| **Database**       | Convex               | Real-time |
| **Testing**        | Vitest               | Latest    |

---

## 📁 Project Structure

```text
/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── hooks/               # Custom React hooks
│   └── services/            # Business logic and API calls
├── convex/                  # Convex backend functions
├── docs/                    # Technical documentation
├── scripts/                 # Automation and utility scripts
├── tests/                   # Test suites
└── public/                  # Static assets
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Quality Assurance
npm run type-check      # TypeScript type checking
npm run lint           # ESLint code quality
npm run format         # Code formatting

# Deployment
npm run deploy         # Automated deployment
npm run verify-deployment  # Verify deployment readiness
```

---

## 🚨 Environment Variables Required

### Required

- `NEXT_PUBLIC_CONVEX_URL` - Convex backend URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Optional

- `CLOUDINARY_URL` - Cloudinary media storage
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret for auth callbacks

---

## 🐛 Troubleshooting

### Build Issues

- Ensure all environment variables are set
- Check Convex connection: `npx convex dev`
- Verify Node.js version: `node --version`

### Authentication Issues

- Check [docs/CLERK_SETUP.md](./docs/CLERK_SETUP.md) for Clerk configuration
- See [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) for authentication patterns and troubleshooting
- Verify Clerk and Convex integration

### Deployment Issues

- Run `npm run verify-deployment` before deploying
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed procedures
- Ensure all required environment variables are configured

---

## 📞 Support & Resources

### Primary Documentation

- **AI Knowledge Base**: [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) - **Complete system architecture**
- **Authentication**: [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) - Clerk + Convex auth system
- **Clerk Setup**: [docs/CLERK_SETUP.md](./docs/CLERK_SETUP.md) - Clerk configuration guide

### Development Resources

- **Setup Guide**: [START_HERE.md](./START_HERE.md)
- **AI Assistant**: [CLAUDE.md](./CLAUDE.md)
- **Branch Strategy**: [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)

### Emergency Procedures

- **Access Issues**: [docs/EMERGENCY_ACCESS_PROCEDURES.md](./docs/EMERGENCY_ACCESS_PROCEDURES.md)
- **Auth Issues**: See [docs/AI_KNOWLEDGE_BASE.md](./docs/AI_KNOWLEDGE_BASE.md) authentication section

---

## 📈 Recent Updates

- ✅ **January 2025**: Documentation consolidation and cleanup
  - **Archived deprecated auth docs**: Moved `AUTHENTICATION_COMPLETE_GUIDE.md` and `TROUBLESHOOTING_AUTH.md` to archive (outdated NextAuth.js docs, system uses Clerk)
  - **Consolidated i18n docs**: Merged `I18N_COMPLETION_PROMPT.md` into `PAGE_I18N_GUIDE.md` (archived task-specific prompt)
  - **Moved new docs**: `REVIEW_ANALYSIS.md` and `ROLE_ACCESS_AUDIT.md` to `docs/` directory
  - **Enhanced guides**: Added server component patterns, implementation checklist, and common pitfalls to `PAGE_I18N_GUIDE.md`
  - **Updated all references**: Fixed cross-references across all documentation to point to current Clerk-based auth system
  - **Organized structure**: Documentation now properly organized by functional area with deprecated docs archived
- ✅ **January 2025**: Major documentation consolidation and cleanup
  - **Deleted deprecated documentation**: ARCHITECTURE.md, API_DOCUMENTATION.md, FRONTEND.md, AUTHENTICATION_COMPLETE_GUIDE.md, TROUBLESHOOTING_AUTH.md, I18N_COMPLETION_PROMPT.md, FIX_TYPESCRIPT_ERRORS.md
  - All legacy docs completely superseded by AI_KNOWLEDGE_BASE.md with current Convex + Clerk stack
  - Updated all documentation cross-references
  - Simplified documentation index structure
  - Consolidated Libro de Clases documentation (GAP_ANALYSIS, STATUS, PDF_EXPORT maintained)
- ✅ **October 31, 2025**: Complete AI-oriented documentation consolidation
  - Created comprehensive [AI Knowledge Base](./docs/AI_KNOWLEDGE_BASE.md) with machine-readable structure
  - Consolidated all technical documentation into single AI-optimized reference
  - Updated documentation index to prioritize AI Knowledge Base
  - Added structured JSON/YAML sections for automated processing
  - Included complete cross-reference system for all components
- ✅ **January 2025**: Consolidated 4 voting system docs into single AI-oriented guide
- ✅ **January 2025**: Moved historical MIGRATION.md to `archive/` directory
- ✅ **October 2025**: Next.js 16 upgrade and system refactoring
- ✅ **Authentication**: Full Clerk integration with Convex
- ✅ **Real-time Features**: Convex-powered live updates and notifications
- ✅ **Role System**: Comprehensive RBAC implementation
- ✅ **Voting System**: Centro Consejo digital voting platform
- ✅ **Libro de Clases**: Complete MINEDUC-compliant digital class book system

---

## 🤝 Contributing

1. Follow [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) for branching
2. Review [CLAUDE.md](./CLAUDE.md) for development guidelines
3. Test thoroughly using available test suites
4. Update documentation for any new features

---

**For questions or issues, refer to the relevant documentation sections above or check the troubleshooting guides.**

### 📜 Historical Documentation

- **[archive/MIGRATION.md](./archive/MIGRATION.md)** - Historical reference: Prisma to Convex migration guide (migration complete)

---

**Maintained by**: Development Team  
**Last Documentation Review**: January 2025  
**Last Major Consolidation**: January 2025  
**Consolidation Status**: ✅ Complete - All documentation consolidated and cross-referenced
