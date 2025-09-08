/**
 * Load Testing Suite
 * Comprehensive load testing for educational platform
 */

import { test, expect, Page } from '@playwright/test';

interface LoadTestResult {
  responseTime: number;
  success: boolean;
  statusCode?: number;
  error?: string;
}

interface LoadTestMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  totalRequests: number;
  requestsPerSecond: number;
  errors: string[];
}

test.describe('Load Testing Suite', () => {
  async function measurePageLoad(
    page: Page,
    url: string
  ): Promise<LoadTestResult> {
    const startTime = Date.now();

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        responseTime,
        success: response?.ok() ?? false,
        statusCode: response?.status(),
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async function runLoadTest(
    url: string,
    concurrentUsers: number,
    requestsPerUser: number,
    timeoutMs: number = 30000
  ): Promise<LoadTestMetrics> {
    const results: LoadTestResult[] = [];
    const startTime = Date.now();

    // Create concurrent user sessions
    const userPromises = Array.from(
      { length: concurrentUsers },
      async (_, userIndex) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        const userResults: LoadTestResult[] = [];

        for (let i = 0; i < requestsPerUser; i++) {
          const result = await measurePageLoad(page, url);
          userResults.push(result);

          // Small delay between requests from same user
          await page.waitForTimeout(100);
        }

        await context.close();
        return userResults;
      }
    );

    // Wait for all users to complete
    const allUserResults = await Promise.all(userPromises);
    allUserResults.forEach(userResults => results.push(...userResults));

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000; // seconds

    // Calculate metrics
    const responseTimes = results.map(r => r.responseTime);
    const successfulRequests = results.filter(r => r.success);
    const errors = results
      .filter(r => !r.success)
      .map(r => r.error || 'Unknown error');

    responseTimes.sort((a, b) => a - b);

    return {
      averageResponseTime:
        responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
      successRate: (successfulRequests.length / results.length) * 100,
      totalRequests: results.length,
      requestsPerSecond: results.length / totalDuration,
      errors: [...new Set(errors)], // Unique errors
    };
  }

  async function runApiLoadTest(
    endpoint: string,
    concurrentUsers: number,
    requestsPerUser: number
  ): Promise<LoadTestMetrics> {
    const results: LoadTestResult[] = [];
    const startTime = Date.now();

    const userPromises = Array.from({ length: concurrentUsers }, async () => {
      const userResults: LoadTestResult[] = [];

      for (let i = 0; i < requestsPerUser; i++) {
        const requestStart = Date.now();

        try {
          const response = await fetch(endpoint);
          const requestEnd = Date.now();

          userResults.push({
            responseTime: requestEnd - requestStart,
            success: response.ok,
            statusCode: response.status,
          });
        } catch (error) {
          const requestEnd = Date.now();

          userResults.push({
            responseTime: requestEnd - requestStart,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return userResults;
    });

    const allUserResults = await Promise.all(userPromises);
    allUserResults.forEach(userResults => results.push(...userResults));

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;

    const responseTimes = results.map(r => r.responseTime);
    const successfulRequests = results.filter(r => r.success);
    const errors = results
      .filter(r => !r.success)
      .map(r => r.error || 'Unknown error');

    responseTimes.sort((a, b) => a - b);

    return {
      averageResponseTime:
        responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
      successRate: (successfulRequests.length / results.length) * 100,
      totalRequests: results.length,
      requestsPerSecond: results.length / totalDuration,
      errors: [...new Set(errors)],
    };
  }

  test('Homepage load test - 10 concurrent users', async () => {
    const metrics = await runLoadTest('http://localhost:3000/', 10, 5);

    console.log('Homepage Load Test Results:', metrics);

    // Performance assertions
    expect(metrics.averageResponseTime).toBeLessThan(3000); // 3 seconds average
    expect(metrics.p95ResponseTime).toBeLessThan(5000); // 5 seconds 95th percentile
    expect(metrics.successRate).toBeGreaterThanOrEqual(95); // 95% success rate
    expect(metrics.requestsPerSecond).toBeGreaterThan(1); // At least 1 RPS

    // No critical errors
    expect(metrics.errors.filter(e => e.includes('timeout')).length).toBe(0);
  });

  test('Login page load test - 20 concurrent users', async () => {
    const metrics = await runLoadTest('http://localhost:3000/login', 20, 3);

    console.log('Login Page Load Test Results:', metrics);

    // Login page should be fast and reliable
    expect(metrics.averageResponseTime).toBeLessThan(2000); // 2 seconds average
    expect(metrics.p95ResponseTime).toBeLessThan(4000); // 4 seconds 95th percentile
    expect(metrics.successRate).toBeGreaterThanOrEqual(98); // 98% success rate for critical page

    // Authentication page is critical - no errors allowed
    expect(metrics.errors.length).toBe(0);
  });

  test('Teacher dashboard load test - authenticated users', async ({
    browser,
  }) => {
    // First, authenticate a user to get session
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login process (simplified)
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');

    // Get session cookies for load testing
    const cookies = await context.cookies();
    await context.close();

    // Run load test with authenticated session
    const metrics = await runLoadTest('http://localhost:3000/profesor', 5, 10);

    console.log('Teacher Dashboard Load Test Results:', metrics);

    // Authenticated pages may be slower due to data loading
    expect(metrics.averageResponseTime).toBeLessThan(4000);
    expect(metrics.successRate).toBeGreaterThanOrEqual(90);
  });

  test('API health endpoint load test - 50 concurrent requests', async () => {
    const metrics = await runApiLoadTest(
      'http://localhost:3000/api/health',
      50,
      2
    );

    console.log('API Health Endpoint Load Test Results:', metrics);

    // API endpoints should be extremely fast and reliable
    expect(metrics.averageResponseTime).toBeLessThan(500); // 500ms average
    expect(metrics.p95ResponseTime).toBeLessThan(1000); // 1 second 95th percentile
    expect(metrics.successRate).toBe(100); // 100% success rate for health check
    expect(metrics.requestsPerSecond).toBeGreaterThan(10); // At least 10 RPS

    // Health endpoint should never fail
    expect(metrics.errors.length).toBe(0);
  });

  test('File upload performance test', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');

    // Navigate to planning documents
    await page.goto('http://localhost:3000/profesor/planificaciones/crear');

    // Create a test file (1MB)
    const testFileContent = 'A'.repeat(1024 * 1024); // 1MB file
    const testFile = new File([testFileContent], 'test-document.txt', {
      type: 'text/plain',
    });

    const uploadTimes: number[] = [];

    // Test multiple file uploads
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();

      // Fill form
      await page.fill('[name="title"]', `Test Planning ${i + 1}`);
      await page.fill('[name="description"]', 'Load testing document');
      await page.fill('[name="subject"]', 'Mathematics');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-document.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(testFileContent),
      });

      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForSelector('.toast', { timeout: 10000 }); // Wait for success toast

      const endTime = Date.now();
      uploadTimes.push(endTime - startTime);

      // Navigate back for next test
      if (i < 4) {
        await page.goto('http://localhost:3000/profesor/planificaciones/crear');
      }
    }

    const averageUploadTime =
      uploadTimes.reduce((sum, time) => sum + time, 0) / uploadTimes.length;
    const maxUploadTime = Math.max(...uploadTimes);

    console.log('File Upload Performance:', {
      averageTime: `${averageUploadTime}ms`,
      maxTime: `${maxUploadTime}ms`,
      allTimes: uploadTimes,
    });

    // File uploads should complete within reasonable time
    expect(averageUploadTime).toBeLessThan(5000); // 5 seconds average
    expect(maxUploadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('Database query performance test', async () => {
    // Test multiple API endpoints that query the database
    const endpoints = [
      'http://localhost:3000/api/health',
      // Add more API endpoints as they become available
    ];

    const results: Record<string, LoadTestMetrics> = {};

    for (const endpoint of endpoints) {
      const metrics = await runApiLoadTest(endpoint, 10, 5);
      results[endpoint] = metrics;

      console.log(`Database Query Performance - ${endpoint}:`, metrics);

      // Database queries should be fast
      expect(metrics.averageResponseTime).toBeLessThan(1000); // 1 second
      expect(metrics.successRate).toBeGreaterThanOrEqual(95);
    }
  });

  test('Memory usage monitoring during load test', async ({ browser }) => {
    // Monitor browser memory during sustained load
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable CDP for memory monitoring
    const client = await context.newCDPSession(page);
    await client.send('Performance.enable');

    const memoryMeasurements: number[] = [];

    // Run sustained navigation test
    for (let i = 0; i < 20; i++) {
      await page.goto('http://localhost:3000/');
      await page.waitForLoadState('networkidle');

      // Measure memory usage
      const metrics = await client.send('Performance.getMetrics');
      const jsHeapUsed =
        metrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;
      memoryMeasurements.push(jsHeapUsed);

      // Small delay
      await page.waitForTimeout(500);
    }

    await context.close();

    const maxMemory = Math.max(...memoryMeasurements);
    const avgMemory =
      memoryMeasurements.reduce((sum, mem) => sum + mem, 0) /
      memoryMeasurements.length;

    console.log('Memory Usage During Load Test:', {
      maxMemoryMB: `${(maxMemory / 1024 / 1024).toFixed(2)}MB`,
      avgMemoryMB: `${(avgMemory / 1024 / 1024).toFixed(2)}MB`,
      measurements: memoryMeasurements.length,
    });

    // Memory usage should not grow excessively
    expect(maxMemory).toBeLessThan(100 * 1024 * 1024); // 100MB max

    // Check for memory leaks (memory should not continuously grow)
    if (memoryMeasurements.length >= 10) {
      const firstHalf = memoryMeasurements.slice(
        0,
        Math.floor(memoryMeasurements.length / 2)
      );
      const secondHalf = memoryMeasurements.slice(
        Math.floor(memoryMeasurements.length / 2)
      );

      const firstHalfAvg =
        firstHalf.reduce((sum, mem) => sum + mem, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, mem) => sum + mem, 0) / secondHalf.length;

      // Memory growth should be minimal (less than 50% increase)
      const memoryGrowthRatio = secondHalfAvg / firstHalfAvg;
      expect(memoryGrowthRatio).toBeLessThan(1.5);
    }
  });

  test('Stress test - peak load simulation', async () => {
    // Simulate peak school hours load
    const peakLoadMetrics = await runLoadTest('http://localhost:3000/', 50, 3);

    console.log('Peak Load Stress Test Results:', peakLoadMetrics);

    // Under stress, some degradation is acceptable
    expect(peakLoadMetrics.averageResponseTime).toBeLessThan(10000); // 10 seconds max
    expect(peakLoadMetrics.successRate).toBeGreaterThanOrEqual(80); // 80% min success rate

    // System should not completely fail
    expect(
      peakLoadMetrics.errors.filter(e => e.includes('ECONNREFUSED')).length
    ).toBeLessThan(peakLoadMetrics.totalRequests * 0.1);
  });
});
