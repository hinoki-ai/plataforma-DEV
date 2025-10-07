# 🧪 Testing Guide - Lean & Focused

## 🎯 Quick Start

```bash
# Complete test suite
npm run test:all

# Individual test types
npm run test:unit           # Unit tests
npm run test:e2e           # E2E workflow tests
```

## 📁 Test Structure (Lean Approach)

```
tests/
├── unit/              # Core functionality tests
│   ├── api/          # API endpoint tests
│   ├── auth.test.ts  # Authentication tests
│   ├── calendar.test.ts
│   ├── planning.test.ts
│   ├── role-access.test.ts
│   ├── security.test.ts
│   └── dashboard/    # Dashboard feature tests
├── e2e/              # Critical workflow tests
│   ├── auth/         # Auth flow tests
│   ├── admin-workflow.spec.ts
│   ├── parent-workflow.spec.ts
│   └── teacher-workflow.spec.ts
├── integration/      # API integration tests
└── __mocks__/        # Mock implementations
```

## 🔧 Essential Commands

### Setup

```bash
npx playwright install      # Install browsers
npm run create-all-test-users # Create test users
```

### Development

```bash
npm run test:unit:watch     # Watch mode
npm run test:e2e:ui        # E2E UI mode
npm run test:e2e:debug     # Debug mode
```

## 🎯 Test Philosophy

We follow a **lean testing approach** focused on:
- ✅ Core business logic (auth, calendar, planning)
- ✅ Critical user workflows (admin, teacher, parent)
- ✅ API endpoints and integrations
- ✅ Security and role-based access
- ❌ No UI component testing (trust the framework)
- ❌ No performance/visual regression (manual when needed)
- ❌ No accessibility tests (use browser tools)

## 📊 Coverage

```bash
npm run test:unit:coverage  # Generate coverage report
open coverage/index.html    # View detailed report
```

## 🚀 Best Practices

- Focus tests on business logic, not implementation details
- Keep tests simple and maintainable
- Test user workflows, not individual components
- Use manual testing for UI/UX validation
