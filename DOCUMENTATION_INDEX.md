# 📚 Documentation Index - Plataforma Astral

**Complete guide to all documentation in this SaaS platform project**

---

## 🚀 Getting Started

Start here if you're new to the project:

| Document                             | Purpose                                    | Read Time |
| ------------------------------------ | ------------------------------------------ | --------- |
| **[START_HERE.md](./START_HERE.md)** | 👉 **START HERE** - First-time setup guide | 5 min     |
| **[README.md](./README.md)**         | Project overview and quick reference       | 10 min    |
| **[.env.example](./.env.example)**   | Environment variables template             | 2 min     |

---

## 🔄 Migration Status (Completed)

Historical information about the completed Prisma to Convex migration:

| Document                           | Purpose                                             | Read Time |
| ---------------------------------- | --------------------------------------------------- | --------- |
| **[MIGRATION.md](./MIGRATION.md)** | ✅ Completed migration guide (historical reference) | 15 min    |

---

## 🤖 For AI Assistants & Developers

Essential documentation for working on the codebase:

| Document                                             | Purpose                                                                        | Audience      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | ------------- |
| **[CLAUDE.md](./CLAUDE.md)**                         | **AI Assistant Guide** - Complete development patterns, architecture, commands | AI Assistants |
| **[CONVEX_SETUP_GUIDE.md](./CONVEX_SETUP_GUIDE.md)** | Convex setup and configuration guide                                           | Developers    |
| **[MIGRATION.md](./MIGRATION.md)**                   | Completed migration documentation (historical reference)                       | Developers    |

---

## 🚀 Deployment & Operations

Guides for deploying and managing the application:

| Document                                                   | Purpose                                     | Read Time |
| ---------------------------------------------------------- | ------------------------------------------- | --------- |
| **[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** | Complete deployment guide (Vercel + Convex) | 15 min    |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)**                       | Quick deployment reference                  | 5 min     |
| **[OPERATIONAL_STATUS.md](./OPERATIONAL_STATUS.md)**       | Current operational status                  | 2 min     |
| **[BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)**             | Git branching strategy                      | 3 min     |

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

### Troubleshooting & Incidents

- **[docs/TROUBLESHOOTING_AUTH.md](./docs/TROUBLESHOOTING_AUTH.md)** - Auth troubleshooting guide
- **[docs/INCIDENT_REPORT_AUTH_FIX_2025-09-01.md](./docs/INCIDENT_REPORT_AUTH_FIX_2025-09-01.md)** - Auth incident report (Sept 2025)

### Deployment & Environment

- **[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** - Complete deployment guide (Vercel + Convex)
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

| Goal                                  | Document                            |
| ------------------------------------- | ----------------------------------- |
| Set up the project for the first time | START_HERE.md                       |
| Understand the architecture           | docs/ARCHITECTURE.md                |
| Deploy to production                  | DEPLOYMENT.md                       |
| Understand authentication             | docs/AUTHENTICATION_SYSTEM_DOCS.md  |
| Troubleshoot auth issues              | docs/TROUBLESHOOTING_AUTH.md        |
| Work on the codebase (AI)             | CLAUDE.md                           |
| See migration status                  | MIGRATION.md                        |
| Understand the voting system          | docs/VOTING_SYSTEM.md               |
| Set up environment variables          | docs/ENVIRONMENT.md                 |
| Run tests                             | MASTER-TEST-GUIDE.md                |
| Understand API endpoints              | docs/API_DOCUMENTATION.md           |
| Learn about role-based access         | docs/ROLE_SYSTEM.md                 |
| Deploy to production                  | docs/DEPLOYMENT_GUIDE.md            |
| Emergency access                      | docs/EMERGENCY_ACCESS_PROCEDURES.md |

---

## 📂 File Structure

```
plataforma-astral/
├── START_HERE.md                          👈 Start here!
├── README.md                              👈 Project overview
├── CLAUDE.md                              👈 AI assistant guide
├── MIGRATION.md                           👈 Migration status
├── DOCUMENTATION_INDEX.md                 👈 You are here
│
├── DEPLOYMENT.md                          🚀 Deployment guide
├── BRANCH_STRATEGY.md                     📊 Git workflow
│
├── docs/                                  📚 Technical docs
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── AUTHENTICATION_SYSTEM_DOCS.md
│   ├── ROLE_SYSTEM.md
│   └── [... more technical docs]
│
├── tests/                                 🧪 Test files
├── src/                                   💻 Source code
└── convex/                                ⚡ Convex backend
```

---

## ⚠️ Removed/Deprecated Documents

The following documents have been removed or consolidated:

### Removed (Outdated/Redundant)

- `CONVEX_INTEGRATION_REPORT.md` - Report file (migration complete)
- `AUTH_SYSTEM_EXTRACTION.md` - Redundant with AUTHENTICATION_SYSTEM_DOCS.md
- `MULTI_TENANT_MIGRATION_PLAN.md` - Planning doc (not currently implemented)
- `MULTI_TENANT_ARCHITECTURE_DIAGRAM.md` - Planning doc (not currently implemented)
- `docs/AUTH.md` - Consolidated into AUTHENTICATION_SYSTEM_DOCS.md
- `docs/VERCEL_DEPLOYMENT_GUIDE.md` - Merged into DEPLOYMENT_GUIDE.md
- `docs/ENVIRONMENT-SETUP.md` - Merged into ENVIRONMENT.md

### Use These Instead

- For auth → `docs/AUTHENTICATION_SYSTEM_DOCS.md`
- For deployment → `docs/DEPLOYMENT_GUIDE.md`
- For environment → `docs/ENVIRONMENT.md`
- For migration info → `MIGRATION.md` (historical reference)

---

**Last Updated**: January 2025  
**Status**: ✅ Documentation consolidated and up-to-date  
**Questions?**: See START_HERE.md or CLAUDE.md
