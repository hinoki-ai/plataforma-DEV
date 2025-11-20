# Contributing to Plataforma Astral

**Educational Management SaaS Platform**  
**Built with Next.js 16 + React 19 + TypeScript + Convex**  
**Status**: Production Ready ✅

---

## 🎯 Quick Start for Contributors

| I want to...           | Go to...                                   |
| ---------------------- | ------------------------------------------ |
| **Start contributing** | [Getting Started](#🚀-getting-started)     |
| **Report a bug**       | [Bug Reports](#🐛-bug-reports)             |
| **Request a feature**  | [Feature Requests](#✨-feature-requests)   |
| **Set up development** | [Development Setup](#🏗️-development-setup) |
| **Code standards**     | [Code Standards](#📝-code-standards)       |
| **Testing**            | [Testing](#🧪-testing)                     |
| **Deployment**         | [Deployment](#🚀-deployment)               |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18+ (20+ recommended)
- **npm**: Latest stable version
- **Git**: Latest version
- **Convex Account**: [convex.dev](https://convex.dev) (free tier available)
- **Clerk Account**: [clerk.com](https://clerk.com) (free tier available)

### Quick Setup (5 minutes)

````bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/plataforma-astral.git
cd plataforma-astral

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Convex and Clerk credentials

# 4. Initialize Convex backend
npx convex dev

# 5. Start development
```bash
npm run dev
````

### First Contribution

1. **Choose an issue** from [GitHub Issues](../../issues)
2. **Create a branch** following our [branching strategy](./BRANCH_STRATEGY.md)
3. **Make your changes** following our [code standards](#📝-code-standards)
4. **Write tests** for your changes
5. **Test locally** and ensure everything works
6. **Submit a pull request**

---

## 🏗️ Development Setup

### Environment Configuration

Create a `.env.local` file with:

```env
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Optional: Media Storage
CLOUDINARY_URL=cloudinary://...
```

bash

### Development Commands

```bash
# Development
npm run dev              # Start Next.js development server
npx convex dev          # Start Convex backend (separate terminal)
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Quality Assurance
npm run lint            # ESLint code quality (must pass 0 warnings)
npm run build           # Production build test
npm run test:all        # Complete test suite

# Deployment
npm run deploy          # Automated deployment
npm run verify-deployment # Pre-deployment checks
```

### Project Structure

```bash
plataforma-astral/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (main)/            # Protected role-based pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utilities and configurations
│   ├── hooks/                 # Custom React hooks
│   └── services/              # Business logic layer
├── convex/                    # Convex backend functions
│   ├── schema.ts              # Database schema
│   └── [feature].ts           # Feature-specific functions
├── docs/                      # Documentation
├── tests/                     # Test suites
└── scripts/                   # Automation scripts
```

---

## 📝 Code Standards

### TypeScript

- **Strict mode**: All TypeScript strict checks must pass
- **Type safety**: No `any` types except in migration/legacy code
- **Interfaces**: Use interfaces over types for object definitions
- **Naming**: PascalCase for types/interfaces, camelCase for variables

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const userProfile: UserProfile = {
  id: "123",
  name: "John Doe",
  email: "john@example.com",
};

// ❌ Avoid
type user_profile = {
  id: string;
  name: string;
  email: string;
};
```

typescript

### React Components

- **Functional components**: Use function components with hooks
- **Naming**: PascalCase for component names
- **Props**: Use TypeScript interfaces for props
- **Hooks**: Custom hooks for reusable logic

```tsx
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick: () => void;
}

export function Button({
  children,
  variant = "primary",
  onClick,
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ❌ Avoid
export const button = ({ children, variant, onClick }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

tsx

### Convex Backend

- **Validation**: Use `v` validators for all inputs
- **Security**: Implement proper role-based access control
- **Error handling**: Provide meaningful error messages
- **Documentation**: Document all functions with JSDoc

```typescript
/**
 * Get user profile by ID
 * @param userId - The user ID to fetch
 * @returns User profile object
 */
export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
});
```

### File Organization

- **Components**: Group by feature in `src/components/[feature]/`
- **Pages**: Use App Router structure in `src/app/`
- **Utilities**: Place in `src/lib/` with clear naming
- **Tests**: Mirror source structure in `tests/`

### Commit Messages

Follow conventional commit format:

```bash
type(scope): description

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

**Examples**:

```bash
feat(auth): add password reset functionality
fix(voting): resolve duplicate vote prevention bug
docs(api): update voting system documentation
```

---

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and Convex function testing
- **E2E Tests**: Full user workflow testing with Playwright

### Running Tests

```bash
# All tests
npm run test:all

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e

# With coverage
npm run test:unit:coverage
```

bash

### Writing Tests

**Unit Tests** (`tests/unit/`):

```typescript
import { describe, it, expect } from "vitest";
import { calculateGradeAverage } from "@/lib/grades";

describe("calculateGradeAverage", () => {
  it("calculates correct average", () => {
    const grades = [6.0, 7.0, 5.5];
    const result = calculateGradeAverage(grades);
    expect(result).toBe(6.17);
  });
});
```

**E2E Tests** (`tests/e2e/`):

```typescript
import { test, expect } from "@playwright/test";

test("user can create meeting request", async ({ page }) => {
  await page.goto("/parent/meetings");
  await page.click("text=Request Meeting");
  await page.fill("[name=title]", "Progress Review");
  await page.click("text=Submit");

  await expect(page.locator("text=Meeting requested")).toBeVisible();
});
```

### Test Coverage

- **Minimum Coverage**: 80% for new code
- **Critical Paths**: 95%+ coverage for authentication and voting
- **API Functions**: Full coverage for all Convex mutations

---

## 🚀 Deployment

### Branching Strategy

We use a simplified single-branch deployment strategy:

- **Main Branch**: `main` - Production-ready code
- **Development**: Local development only
- **No Feature Branches**: All work done locally, merged to main

### Deployment Process

```bash
# 1. Ensure quality checks pass
npm run lint
npm run type-check
npm run build
npm run test:all

# 2. Commit changes
git add .
git commit -m "feat: your feature description"

# 3. Deploy Convex backend first
npx convex deploy

# 4. Deploy frontend
git push origin main
```

bash

### Pre-deployment Checklist

- [ ] All tests pass (`npm run test:all`)
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] ESLint passes with 0 warnings (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated for new features
- [ ] Migration scripts tested (if database changes)

---

## 🐛 Bug Reports

### How to Report a Bug

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide complete information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Screenshots if applicable
   - Error messages/logs

### Bug Report Template

```markdown
## Bug Description

Brief description of the issue

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- Browser: Chrome 119
- OS: Ubuntu 22.04
- Node.js: 20.10.0

## Additional Context

Any other relevant information
```

---

## ✨ Feature Requests

### How to Request a Feature

1. **Check existing issues** for similar requests
2. **Use the feature request template**
3. **Provide detailed requirements**:
   - User story format
   - Acceptance criteria
   - Mockups/wireframes if applicable
   - Business value justification

### Feature Request Template

```markdown
## Feature Summary

Brief description of the requested feature

## User Story

As a [user type], I want [functionality] so that [benefit]

## Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## Technical Considerations

Any technical requirements or constraints

## Additional Context

Screenshots, mockups, or additional information
```

---

## 📚 Documentation

### Documentation Standards

- **AI-First**: Write documentation for AI assistants and automated systems
- **Comprehensive**: Include examples, error cases, and edge cases
- **Up-to-date**: Update documentation with code changes
- **Cross-referenced**: Link related documentation sections

### Updating Documentation

When making changes that affect users or developers:

1. Update relevant documentation files
2. Update API reference if backend functions change
3. Update README examples if needed
4. Test documentation links and examples

---

## 🤝 Code Review Process

### Pull Request Guidelines

- **Title**: Use conventional commit format
- **Description**: Explain what and why, not how
- **Tests**: Include tests for new functionality
- **Documentation**: Update docs for user-facing changes
- **Breaking Changes**: Clearly mark breaking changes

### Review Checklist

**For Reviewers**:

- [ ] Code follows established patterns
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] TypeScript types correct
- [ ] ESLint passes
      **For Contributors**:
- [ ] Self-review completed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide included (if applicable)

---

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, email security concerns to: [security@plataforma-astral.com](mailto:security@plataforma-astral.com)

### Security Best Practices

- **Authentication**: Always use Clerk for user authentication
- **Authorization**: Implement role-based access control
- **Input Validation**: Validate all user inputs
- **Data Sanitization**: Sanitize user-generated content
- **Secrets**: Never commit secrets or credentials

---

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) first

### Response Times

- **Bug Reports**: Acknowledged within 24 hours
- **Feature Requests**: Initial response within 3 business days
- **Pull Request Reviews**: Within 2 business days

---

## 🎉 Recognition

Contributors are recognized through:

- **GitHub Contributors**: Listed in repository contributors
- **Changelog**: Mentioned in release notes
- **Documentation**: Acknowledged in relevant docs
- **Community**: Featured in community updates

Thank you for contributing to Plataforma Astral! 🎓
