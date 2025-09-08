/**
 * Performance Testing Configuration
 * Central configuration for all performance testing utilities
 */

export const PERFORMANCE_THRESHOLDS = {
  // Page Load Thresholds (milliseconds)
  pageLoad: {
    homepage: 2000,
    login: 1500,
    dashboard: 3000,
    api: 500,
  },

  // Core Web Vitals
  coreWebVitals: {
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1,
    totalBlockingTime: 200,
    speedIndex: 3000,
  },

  // Mobile Thresholds (more lenient)
  mobile: {
    firstContentfulPaint: 3000,
    largestContentfulPaint: 4000,
    speedIndex: 4000,
    cumulativeLayoutShift: 0.1,
  },

  // Database Performance
  database: {
    simpleQuery: 300, // Simple SELECT queries
    complexQuery: 1000, // Complex JOINs and aggregations
    create: 500, // INSERT operations
    update: 500, // UPDATE operations
    delete: 300, // DELETE operations
    transaction: 2000, // Transaction operations
  },

  // Load Testing
  loadTesting: {
    successRate: 95, // Minimum success rate (%)
    averageResponseTime: 3000, // Maximum average response time (ms)
    p95ResponseTime: 5000, // 95th percentile response time (ms)
    p99ResponseTime: 8000, // 99th percentile response time (ms)
    requestsPerSecond: 1, // Minimum RPS
  },

  // Resource Limits
  resources: {
    memoryUsage: 200 * 1024 * 1024, // 200MB max memory usage
    bundleSize: {
      javascript: 100 * 1024, // 100KB max unused JS
      css: 15 * 1024, // 15KB max unused CSS
    },
    imageOptimization: 50 * 1024, // 50KB max potential savings
  },

  // Lighthouse Scores
  lighthouse: {
    performance: 0.9,
    accessibility: 0.9,
    bestPractices: 0.9,
    seo: 0.9,
    // Mobile scores are slightly lower
    mobile: {
      performance: 0.8,
      accessibility: 0.9,
      bestPractices: 0.9,
      seo: 0.8,
    },
  },
} as const;

export const PERFORMANCE_URLS = {
  local: 'http://localhost:3000',
  staging: process.env.STAGING_URL || 'https://staging.manitospintadas.cl',
  production: process.env.PRODUCTION_URL || 'https://manitospintadas.cl',
} as const;

export const TEST_ROUTES = [
  '/',
  '/login',
  '/admin',
  '/profesor',
  '/profesor/planificaciones',
  '/profesor/reuniones',
  '/parent',
  '/parent/reuniones',
  '/centro-consejo',
  '/api/health',
] as const;

export const CRITICAL_USER_JOURNEYS = [
  {
    name: 'Teacher Login and Planning Creation',
    steps: [
      '/login',
      '/profesor',
      '/profesor/planificaciones',
      '/profesor/planificaciones/crear',
    ],
  },
  {
    name: 'Parent Login and Meeting Booking',
    steps: ['/login', '/parent', '/parent/reuniones'],
  },
  {
    name: 'Centro Consejo Registration and Voting',
    steps: [
      '/centro-consejo',
      '/centro-consejo/profile',
      '/centro-consejo/votes',
    ],
  },
  {
    name: 'Admin User Management',
    steps: ['/login', '/admin', '/admin/usuarios'],
  },
] as const;

export const LOAD_TEST_SCENARIOS = [
  {
    name: 'Light Load',
    concurrentUsers: 5,
    requestsPerUser: 3,
    description: 'Normal school day traffic',
  },
  {
    name: 'Moderate Load',
    concurrentUsers: 20,
    requestsPerUser: 5,
    description: 'Peak usage during planning period',
  },
  {
    name: 'Heavy Load',
    concurrentUsers: 50,
    requestsPerUser: 3,
    description: 'Start of semester rush',
  },
  {
    name: 'Stress Test',
    concurrentUsers: 100,
    requestsPerUser: 2,
    description: 'System breaking point test',
  },
] as const;

export const DATABASE_TEST_DATA_SIZES = [
  {
    name: 'Small Dataset',
    users: 50,
    planningDocs: 200,
    meetings: 100,
    description: 'Small school simulation',
  },
  {
    name: 'Medium Dataset',
    users: 200,
    planningDocs: 1000,
    meetings: 500,
    description: 'Medium school simulation',
  },
  {
    name: 'Large Dataset',
    users: 500,
    planningDocs: 5000,
    meetings: 2000,
    description: 'Large school district simulation',
  },
] as const;

export function getEnvironmentUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return PERFORMANCE_URLS.production;
  }
  if (process.env.NODE_ENV === 'staging') {
    return PERFORMANCE_URLS.staging;
  }
  return PERFORMANCE_URLS.local;
}

export function isThresholdMet(
  category: keyof typeof PERFORMANCE_THRESHOLDS,
  metric: string,
  value: number
): boolean {
  const thresholds = PERFORMANCE_THRESHOLDS[category] as Record<string, number>;
  const threshold = thresholds[metric];

  if (threshold === undefined) {
    console.warn(`No threshold defined for ${category}.${metric}`);
    return true;
  }

  return value <= threshold;
}

export function formatPerformanceReport(results: {
  category: string;
  metrics: Array<{
    name: string;
    value: number;
    threshold: number;
    passed: boolean;
  }>;
}): string {
  const passed = results.metrics.filter(m => m.passed).length;
  const total = results.metrics.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  let report = `\n=== ${results.category} Performance Report ===\n`;
  report += `Pass Rate: ${passed}/${total} (${passRate}%)\n\n`;

  results.metrics.forEach(metric => {
    const status = metric.passed ? '✅' : '❌';
    const unit = metric.name.includes('Rate') ? '%' : 'ms';
    report += `${status} ${metric.name}: ${metric.value}${unit} (threshold: ${metric.threshold}${unit})\n`;
  });

  return report;
}

export const PERFORMANCE_MONITORING = {
  // Enable performance monitoring in different environments
  enabled: {
    development: true,
    staging: true,
    production: false, // Disable in production to avoid performance impact
  },

  // Sampling rates for different metrics
  sampling: {
    lighthouse: 1.0, // 100% of lighthouse tests
    loadTesting: 0.1, // 10% of load tests in staging
    database: 1.0, // 100% of database tests
  },

  // Alerting thresholds (when to alert about performance degradation)
  alerts: {
    performanceScoreDropThreshold: 0.1, // Alert if score drops by 10%
    responseTimeIncreaseThreshold: 1.5, // Alert if response time increases by 50%
    errorRateThreshold: 0.05, // Alert if error rate exceeds 5%
  },

  // Retention policies for performance data
  retention: {
    detailed: 30, // Keep detailed results for 30 days
    summary: 365, // Keep summary data for 1 year
  },
} as const;
