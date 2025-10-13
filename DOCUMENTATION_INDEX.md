# 📚 Documentation Index - Plataforma Astral

**Complete guide to all documentation in this SaaS platform project**

**Last Updated**: October 13, 2025  
**Status**: ✅ Production ready with full Convex integration

---

## 🚀 Getting Started

Start here if you're new to the project:

| Document | Purpose | Read Time |
| --- | --- | --- |
| **[START_HERE.md](./START_HERE.md)** | 👉 **START HERE** - First-time setup guide | 5 min |
| **[README.md](./README.md)** | Project overview and quick reference | 10 min |
| **[CLAUDE.md](./CLAUDE.md)** | AI Assistant guide for development | 15 min |

---

## 🤖 For AI Assistants & Developers

Essential documentation for working on the codebase:

| Document | Purpose | Audience |
| --- | --- | --- |
| **[CLAUDE.md](./CLAUDE.md)** | **AI Assistant Guide** - Complete development patterns, architecture, commands | AI Assistants |
| **[CONVEX_SETUP_GUIDE.md](./CONVEX_SETUP_GUIDE.md)** | Convex setup and configuration guide | Developers |
| **[MIGRATION.md](./MIGRATION.md)** | Completed Prisma→Convex migration (historical reference) | Developers |

---

## 🚀 Deployment & Operations

Guides for deploying and managing the application:

| Document | Purpose | Read Time |
| --- | --- | --- |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | **📋 Complete deployment guide with troubleshooting** | 20 min |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | **🚨 Quick deployment checklist & emergency commands** | 2 min |
| **[OPERATIONAL_STATUS.md](./OPERATIONAL_STATUS.md)** | Current operational status | 2 min |
| **[BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)** | Git branching strategy | 3 min |

---

## 📖 Technical Documentation (`docs/` Directory)

Detailed technical documentation organized by topic:

### Architecture & Design

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture overview
- **[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Complete API endpoint documentation
- **[docs/FRONTEND.md](./docs/FRONTEND.md)** - Frontend patterns and components

### Authentication & Security

- **[docs/AUTHENTICATION_SYSTEM_DOCS.md](./docs/AUTHENTICATION_SYSTEM_DOCS.md)** - Complete auth system documentation
- **[docs/ROLE_SYSTEM.md](./docs/ROLE_SYSTEM.md)** - Role-based access control (RBAC)
- **[docs/protected-paths.md](./docs/protected-paths.md)** - List of protected routes
- **[docs/EMERGENCY_ACCESS_PROCEDURES.md](./docs/EMERGENCY_ACCESS_PROCEDURES.md)** - Emergency access protocols

### Troubleshooting

- **[docs/TROUBLESHOOTING_AUTH.md](./docs/TROUBLESHOOTING_AUTH.md)** - Auth troubleshooting guide

### Environment & Configuration

- **[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)** - Environment configuration guide

### Features & Functionality

- **[docs/VOTING_SYSTEM.md](./docs/VOTING_SYSTEM.md)** - Centro Consejo voting system
- **[docs/ANIMATION_GUIDE.md](./docs/ANIMATION_GUIDE.md)** - UI animation patterns

---

## 🧪 Testing & Quality Assurance

Testing is configured in the project. See `package.json` scripts:

```bash
npm run test:unit        # Vitest unit tests
npm run test:e2e         # Playwright E2E tests
npm run test:a11y        # Accessibility tests
npm run test:all         # Complete test suite
```

Refer to `CLAUDE.md` for testing guidelines.

---

## 🔍 Finding Specific Information

### "I want to..."

| Goal | Document |
| --- | --- |
| Set up the project for the first time | START_HERE.md |
| Understand the architecture | docs/ARCHITECTURE.md |
| Deploy to production | DEPLOYMENT.md + DEPLOYMENT_CHECKLIST.md |
| Understand authentication | docs/AUTHENTICATION_SYSTEM_DOCS.md |
| Troubleshoot auth issues | docs/TROUBLESHOOTING_AUTH.md |
| Work on the codebase (AI) | CLAUDE.md |
| See migration status | MIGRATION.md |
| Understand the voting system | docs/VOTING_SYSTEM.md |
| Set up environment variables | docs/ENVIRONMENT.md |
| Understand API endpoints | docs/API_DOCUMENTATION.md |
| Learn about role-based access | docs/ROLE_SYSTEM.md |
| Emergency access | docs/EMERGENCY_ACCESS_PROCEDURES.md |

---

## 📂 File Structure

```
plataforma-astral/
├── START_HERE.md                          👈 Start here!
├── README.md                              👈 Project overview
├── CLAUDE.md                              👈 AI assistant guide
├── MIGRATION.md                           👈 Migration status (historical)
├── DOCUMENTATION_INDEX.md                 👈 You are here
│
├── DEPLOYMENT.md                          🚀 Complete deployment guide
├── DEPLOYMENT_CHECKLIST.md                🚨 Deployment checklist
├── BRANCH_STRATEGY.md                     📊 Git workflow
│
├── docs/                                  📚 Technical docs
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── AUTHENTICATION_SYSTEM_DOCS.md
│   ├── ROLE_SYSTEM.md
│   ├── TROUBLESHOOTING_AUTH.md
│   ├── ENVIRONMENT.md
│   ├── VOTING_SYSTEM.md
│   ├── ANIMATION_GUIDE.md
│   ├── EMERGENCY_ACCESS_PROCEDURES.md
│   └── protected-paths.md
│
├── archive/                               📦 Historical documents
│   ├── authentication-fixes-2024/
│   └── incidents/
│
├── tests/                                 🧪 Test files
├── src/                                   💻 Source code
└── convex/                                ⚡ Convex backend
```

---

## 📦 Archived Documents

Historical documents have been moved to the `archive/` directory:

### Authentication Fixes (2024-2025)

- `archive/authentication-fixes-2024/AUTHENTICATION_SUMMARY.md` - October 2024 fix
- `archive/authentication-fixes-2024/AUTHENTICATION_FIXED.md` - Fix details
- `archive/authentication-fixes-2024/AUTH_SYSTEM_ANALYSIS.md` - Analysis
- `archive/authentication-fixes-2024/PRODUCTION_DEPLOYMENT.md` - Deployment guide
- `archive/authentication-fixes-2024/AUTH_TEST_CREDENTIALS.md` - Test credentials

### Incident Reports

- `archive/incidents/INCIDENT_REPORT_AUTH_FIX_2025-09-01.md` - September 2025 incident

### Deprecated Technology Guides

- `archive/deprecated/PARENT_REGISTRATION_IMPLEMENTATION.md` - Old implementation
- `archive/deprecated/INSTITUTION_SUPPORT_UPDATE.md` - Old update

**Note**: These documents are kept for historical reference and context but are no longer actively maintained.

---

## 🎯 Documentation Standards

### When Creating New Documentation

1. **Location**: Place in appropriate directory (`docs/` for technical, root for guides)
2. **Naming**: Use `UPPERCASE_WITH_UNDERSCORES.md` format
3. **Index**: Add entry to this file
4. **Headers**: Include status, last updated date, and purpose
5. **Links**: Use relative links to other documentation

### When Updating Documentation

1. Update "Last Updated" timestamp
2. Add note about what changed
3. Update relevant cross-references
4. Check for broken links

### Archiving Documents

Move outdated documents to `archive/` with:
- Original filename preserved
- Organized by category
- Link from this index to archived location

---

## 📊 Documentation Health

| Category | Status | Notes |
| --- | --- | --- |
| Getting Started | ✅ Up to date | START_HERE.md, README.md current |
| Authentication | ✅ Up to date | Historical issues resolved and archived |
| Deployment | ✅ Up to date | Single source of truth (DEPLOYMENT.md) |
| Architecture | ✅ Up to date | Reflects Convex migration |
| API Documentation | ⚠️ In progress | Being updated for Convex |
| Testing | ⚠️ In progress | Being updated for Convex migration |

---

**Last Updated**: October 13, 2025  
**Status**: ✅ Documentation consolidated and up-to-date  
**Next Review**: December 2025  
**Maintained by**: Development team

For questions or updates, see START_HERE.md or CLAUDE.md
