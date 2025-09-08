# 🎯 COMPREHENSIVE TESTING STRATEGY - MANITOS PINTADAS

> **Enterprise-grade testing strategy for Next.js 15 educational platform with complex role-based access control**

## 🏗️ TESTING ARCHITECTURE OVERVIEW

### Current State Analysis ✅

- **Unit Tests**: Vitest + React Testing Library (basic coverage)
- **E2E Tests**: Playwright (multi-browser support)
- **Coverage**: 70-80% thresholds configured
- **Security**: Basic auth testing
- **Performance**: Lighthouse CI configured

### Target State 🎯

- **100% critical path coverage**
- **Zero security vulnerabilities**
- **Sub-3-second load times**
- **WCAG 2.1 AA compliance**
- **Visual regression protection**

## 📊 TESTING PYRAMID STRATEGY

```
🎯 E2E Tests (Playwright)
   ├─ Critical user journeys
   ├─ Multi-role flows
   ├─ Security scenarios
   └─ Performance validation

🔌 Integration Tests (Vitest + Prisma)
   ├─ Server Actions
   ├─ Database operations
   ├─ API endpoints
   └─ Authentication flows

🔬 Unit Tests (Vitest)
   ├─ Business logic
   ├─ Utility functions
   ├─ React components
   └─ Validation schemas
```

## 🧪 COMPREHENSIVE TEST SUITE

### 1. UNIT TESTS - Core Business Logic

#### Server Actions Testing

```typescript
// tests/unit/services/actions/planning.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPlanningDocument } from '@/services/actions/planning';
import { getServerSession } from 'next-auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    planningDocument: {
      create: vi.fn(),
    },
  },
}));

describe('createPlanningDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create planning document for authorized teacher', async () => {
    const mockSession = {
      user: { id: 'teacher-123', role: 'PROFESOR' },
    };
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const result = await createPlanningDocument({
      title: 'Test Planning',
      grade: '1st',
      subject: 'Math',
      content: 'Test content',
    });

    expect(result).toHaveProperty('id');
    expect(result.authorId).toBe('teacher-123');
  });

  it('should reject unauthorized users', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    await expect(createPlanningDocument({})).rejects.toThrow('Unauthorized');
  });
});
```

#### Component Testing

```typescript
// tests/unit/components/PlanningDocumentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanningDocumentForm } from '@/components/planning/PlanningDocumentForm';

describe('PlanningDocumentForm', () => {
  it('should validate required fields', async () => {
    render(<PlanningDocumentForm />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
});
```

### 2. INTEGRATION TESTS - Database Operations

#### Prisma Database Testing

```typescript
// tests/integration/services/planning.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createPlanningDocument } from '@/services/actions/planning';
import { getPlanningDocuments } from '@/services/queries/planning';
import { prisma } from '@/lib/db';

describe('Planning Integration', () => {
  beforeEach(async () => {
    await prisma.planningDocument.deleteMany();
  });

  it('should create and retrieve planning documents', async () => {
    const document = await createPlanningDocument({
      title: 'Integration Test',
      grade: '2nd',
      subject: 'Science',
      content: 'Integration test content',
    });

    const documents = await getPlanningDocuments();
    expect(documents).toHaveLength(1);
    expect(documents[0].title).toBe('Integration Test');
  });
});
```

#### API Endpoint Testing

```typescript
// tests/integration/api/planning.api.test.ts
import { describe, it, expect } from 'vitest';
import { GET, POST } from '@/app/api/planning/route';

describe('/api/planning', () => {
  it('should handle GET requests', async () => {
    const request = new Request('http://localhost:3000/api/planning');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

### 3. E2E TESTS - Critical User Journeys

#### Teacher Workflow

```typescript
// tests/e2e/teacher-workflow.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsTeacher } from './fixtures/auth.fixture';

test.describe('Teacher Planning Workflow', () => {
  test('complete planning document lifecycle', async ({ page }) => {
    await loginAsTeacher(page);

    // Navigate to planning
    await page.goto('/profesor/planificaciones');
    await page.click('text=Crear Nueva Planificación');

    // Fill form
    await page.fill('[name="title"]', 'Matemáticas - Suma y Resta');
    await page.selectOption('[name="grade"]', '1st');
    await page.selectOption('[name="subject"]', 'Math');
    await page.fill('[name="content"]', 'Contenido de la planificación...');

    // Upload attachment
    await page.setInputFiles('[name="attachments"]', 'test-files/sample.pdf');

    // Submit
    await page.click('button[type="submit"]');

    // Verify creation
    await expect(page.locator('text=Matemáticas - Suma y Resta')).toBeVisible();
  });
});
```

#### Multi-Role Security Testing

```typescript
// tests/e2e/security/role-isolation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control', () => {
  test('OAuth users cannot access teacher routes', async ({ page }) => {
    // Login as Centro Consejo member
    await page.goto('/login');
    await page.click('button:has-text("Continuar con Google")');

    // Attempt to access teacher route
    await page.goto('/profesor/planificaciones');
    expect(page.url()).toContain('/centro-consejo');
  });

  test('teachers cannot access admin routes', async ({ page }) => {
    await loginAsTeacher(page);

    await page.goto('/admin/usuarios');
    expect(page.url()).toContain('/profesor');
  });
});
```

### 4. SECURITY TESTING

#### Authentication Flow Testing

```typescript
// tests/e2e/security/auth-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Security', () => {
  test('should prevent CSRF attacks on file uploads', async ({ page }) => {
    await loginAsTeacher(page);

    // Attempt upload without CSRF token
    const response = await page.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('test content'),
        },
      },
    });

    expect(response.status()).toBe(403);
  });

  test('should sanitize file uploads', async ({ page }) => {
    await loginAsTeacher(page);

    // Upload malicious file
    await page.setInputFiles('[name="attachments"]', {
      name: '../../../etc/passwd',
      mimeType: 'text/plain',
      buffer: Buffer.from('malicious content'),
    });

    await expect(page.locator('text=Invalid file name')).toBeVisible();
  });
});
```

#### SQL Injection Testing

```typescript
// tests/security/sql-injection.test.ts
import { describe, it, expect } from 'vitest';
import { getPlanningDocuments } from '@/services/queries/planning';

describe('SQL Injection Prevention', () => {
  it('should sanitize malicious input', async () => {
    const maliciousInput = "'; DROP TABLE PlanningDocument; --";

    const result = await getPlanningDocuments({
      search: maliciousInput,
    });

    expect(result).toEqual([]); // Safe empty result
  });
});
```

### 5. PERFORMANCE TESTING

#### Lighthouse CI Configuration

```typescript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/profesor/planificaciones',
        'http://localhost:3000/centro-consejo',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
      },
    },
  },
};
```

#### Performance Monitoring Tests

```typescript
// tests/e2e/performance/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('planning page load time', async ({ page }) => {
    await loginAsTeacher(page);

    const startTime = Date.now();
    await page.goto('/profesor/planificaciones');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('file upload performance', async ({ page }) => {
    await loginAsTeacher(page);

    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB

    await page.setInputFiles('[name="attachments"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeFile,
    });

    // Upload should complete within 30 seconds
    await expect(page.locator('text=Upload complete')).toBeVisible({
      timeout: 30000,
    });
  });
});
```

### 6. PERFORMANCE TESTING ✅ COMPLETED

#### Lighthouse Performance Testing

```typescript
// tests/performance/lighthouse.spec.ts
test('Homepage performance audit', async () => {
  const result = await runLighthouse('http://localhost:3000/');

  expect(result.categories.performance.score).toBeGreaterThanOrEqual(0.9);
  expect(
    result.audits['first-contentful-paint'].numericValue
  ).toBeLessThanOrEqual(1500);
  expect(
    result.audits['largest-contentful-paint'].numericValue
  ).toBeLessThanOrEqual(2500);
});
```

#### Load Testing Suite

```typescript
// tests/performance/load-testing.spec.ts
test('Homepage load test - 10 concurrent users', async () => {
  const metrics = await runLoadTest('http://localhost:3000/', 10, 5);

  expect(metrics.averageResponseTime).toBeLessThan(3000);
  expect(metrics.successRate).toBeGreaterThanOrEqual(95);
  expect(metrics.requestsPerSecond).toBeGreaterThan(1);
});
```

#### Database Performance Testing

```typescript
// tests/performance/database-performance.spec.ts
test('CRUD operations performance', async () => {
  const createResult = await measureQueryPerformance('Create User', () =>
    prisma.user.create({ data: testUserData })
  );

  expect(createResult.executionTime).toBeLessThan(500);
  expect(createResult.success).toBe(true);
});
```

#### Performance Configuration

- **Lighthouse CI**: Enhanced configuration with Core Web Vitals thresholds
- **Load Testing**: Concurrent user simulation with realistic scenarios
- **Database Performance**: Query optimization and connection pool testing
- **Memory Monitoring**: Memory usage tracking during sustained operations

### 7. ACCESSIBILITY TESTING

#### Automated Accessibility Testing

```typescript
// tests/e2e/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance', () => {
  test('planning form should be accessible', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/profesor/planificaciones/crear');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/profesor/planificaciones');

    // Tab through navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();
  });
});
```

### 7. VISUAL REGRESSION TESTING

#### Chromatic Configuration

```typescript
// .storybook/main.ts
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
};

// Example story for PlanningDocumentCard
// src/components/planning/PlanningDocumentCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PlanningDocumentCard } from './PlanningDocumentCard';

const meta: Meta<typeof PlanningDocumentCard> = {
  title: 'Components/PlanningDocumentCard',
  component: PlanningDocumentCard,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    document: {
      id: '1',
      title: 'Matemáticas - Suma',
      grade: '1st',
      subject: 'Math',
      createdAt: new Date(),
      author: { name: 'Prof. García' },
    },
  },
};
```

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)

- [ ] Enhance existing Vitest configuration
- [ ] Set up Prisma test database
- [ ] Create test fixtures and factories
- [ ] Implement basic unit tests

### Phase 2: Integration (Week 3-4)

- [ ] Database integration tests
- [ ] API endpoint testing
- [ ] Server Actions testing
- [ ] Authentication flow testing

### Phase 3: E2E & Security (Week 5-6)

- [ ] Critical user journey E2E tests
- [ ] Security vulnerability testing
- [ ] Performance testing setup
- [ ] Accessibility automation

### Phase 4: Advanced (Week 7-8)

- [ ] Visual regression testing
- [ ] CI/CD pipeline integration
- [ ] Load testing
- [ ] Monitoring and alerting

## 📋 TESTING COMMANDS SUITE

```bash
# Complete testing workflow
npm run test:all                         # Run all test suites
npm run test:unit:coverage              # Unit tests with coverage
npm run test:e2e                        # E2E tests across browsers
npm run test:a11y                       # Accessibility testing
npm run test:performance                # Lighthouse performance
npm run test:security                   # Security vulnerability scans
npm run test:visual                     # Visual regression tests

# Development workflow
npm run test:watch                      # Watch mode for unit tests
npm run test:e2e:ui                     # Playwright UI mode
npm run test:e2e:debug                  # Debug E2E tests

# CI/CD pipeline
npm run test:ci                         # CI optimized testing
npm run test:report                     # Generate comprehensive reports
```

## 🔍 TEST DATA & FIXTURES

### Test Data Factory

```typescript
// tests/fixtures/test-data.factory.ts
export const createTestTeacher = () => ({
  email: 'test.teacher@school.edu',
  name: 'Test Teacher',
  role: 'PROFESOR',
  grade: '1st',
  subject: 'Math',
});

export const createTestPlanning = (overrides = {}) => ({
  title: 'Test Planning Document',
  grade: '2nd',
  subject: 'Science',
  content: 'Test content for planning',
  attachments: [],
  ...overrides,
});
```

### Database Seeding for Tests

```typescript
// tests/setup/test-database.ts
export async function setupTestDatabase() {
  // Create test teacher
  const teacher = await prisma.user.create({
    data: createTestTeacher(),
  });

  // Create test planning documents
  await prisma.planningDocument.createMany({
    data: [
      createTestPlanning({ authorId: teacher.id }),
      createTestPlanning({
        title: 'Advanced Planning',
        authorId: teacher.id,
      }),
    ],
  });

  return { teacher };
}
```

## 🎯 SUCCESS METRICS

### Coverage Targets

- **Unit Tests**: 90%+ coverage on critical paths
- **Integration Tests**: 100% API endpoint coverage
- **E2E Tests**: All critical user journeys
- **Security**: Zero known vulnerabilities
- **Performance**: <3s load time, 90+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliance

### Quality Gates

- All tests must pass before merge
- Security scans must pass
- Performance regressions blocked
- Accessibility violations blocked
- Visual changes must be approved

## 🛠️ TOOLS & TECHNOLOGIES

### Testing Framework

- **Unit/Integration**: Vitest (faster than Jest)
- **E2E**: Playwright (multi-browser)
- **Component**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Database**: SQLite with Prisma

### Security & Performance

- **Security**: OWASP ZAP, Snyk
- **Performance**: Lighthouse CI, WebPageTest
- **Accessibility**: axe-core, Pa11y
- **Visual**: Chromatic, Percy

### CI/CD Integration

- **GitHub Actions**: Automated testing pipeline
- **Coverage**: Codecov integration
- **Reports**: Allure, Jest HTML Reporter
- **Monitoring**: Sentry, LogRocket

## 📊 IMPLEMENTATION STATUS

| Component         | Current    | Target           | Priority |
| ----------------- | ---------- | ---------------- | -------- |
| Unit Tests        | 🟡 Basic   | 🟢 Advanced      | High     |
| Integration Tests | 🟡 Limited | 🟢 Comprehensive | High     |
| E2E Tests         | 🟡 Basic   | 🟢 Complete      | High     |
| Security Tests    | 🔴 None    | 🟢 Advanced      | Critical |
| Performance       | 🟡 Basic   | 🟢 Comprehensive | High     |
| Accessibility     | 🟡 Manual  | 🟢 Automated     | Medium   |
| Visual Testing    | 🔴 None    | 🟢 Automated     | Medium   |

This strategy transforms your existing testing setup into an enterprise-grade testing suite specifically designed for educational platforms with complex role-based access control and security requirements.
