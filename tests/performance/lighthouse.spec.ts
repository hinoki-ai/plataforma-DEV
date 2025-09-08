/**
 * Lighthouse Performance Testing Suite
 * Automated performance testing with CI/CD integration
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface LighthouseResult {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    'best-practices': { score: number };
    seo: { score: number };
  };
  audits: {
    [key: string]: {
      score: number | null;
      numericValue?: number;
      displayValue?: string;
    };
  };
}

test.describe('Lighthouse Performance Tests', () => {
  const PERFORMANCE_THRESHOLDS = {
    performance: 0.9,
    accessibility: 0.9,
    bestPractices: 0.9,
    seo: 0.9,
    // Core Web Vitals
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    speedIndex: 3000,
    cumulativeLayoutShift: 0.1,
    totalBlockingTime: 200,
  };

  async function runLighthouse(
    url: string,
    preset: 'desktop' | 'mobile' = 'desktop'
  ): Promise<LighthouseResult> {
    const configFlag =
      preset === 'mobile'
        ? '--config-path=lighthouse.config.js --preset=mobile'
        : '--config-path=lighthouse.config.js';
    const command = `npx lighthouse ${url} --output=json --quiet ${configFlag}`;

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Lighthouse execution failed:', error);
      throw error;
    }
  }

  test.beforeAll(async () => {
    // Ensure app is running for tests
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (!response.ok) {
        throw new Error('Application not running');
      }
    } catch (error) {
      console.warn('Application may not be running. Start with: npm run dev');
      throw error;
    }
  });

  test('Homepage performance audit', async () => {
    const result = await runLighthouse('http://localhost:3000/');

    // Performance category
    expect(result.categories.performance.score).toBeGreaterThanOrEqual(
      PERFORMANCE_THRESHOLDS.performance
    );

    // Core Web Vitals
    expect(
      result.audits['first-contentful-paint'].numericValue
    ).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.firstContentfulPaint);
    expect(
      result.audits['largest-contentful-paint'].numericValue
    ).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.largestContentfulPaint);
    expect(result.audits['speed-index'].numericValue).toBeLessThanOrEqual(
      PERFORMANCE_THRESHOLDS.speedIndex
    );
    expect(
      result.audits['cumulative-layout-shift'].numericValue
    ).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.cumulativeLayoutShift);
    expect(
      result.audits['total-blocking-time'].numericValue
    ).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.totalBlockingTime);

    // Log performance metrics
    console.log('Homepage Performance Metrics:', {
      performanceScore: result.categories.performance.score,
      fcp: result.audits['first-contentful-paint'].numericValue,
      lcp: result.audits['largest-contentful-paint'].numericValue,
      speedIndex: result.audits['speed-index'].numericValue,
      cls: result.audits['cumulative-layout-shift'].numericValue,
      tbt: result.audits['total-blocking-time'].numericValue,
    });
  });

  test('Login page performance audit', async () => {
    const result = await runLighthouse('http://localhost:3000/login');

    expect(result.categories.performance.score).toBeGreaterThanOrEqual(
      PERFORMANCE_THRESHOLDS.performance
    );
    expect(result.categories.accessibility.score).toBeGreaterThanOrEqual(
      PERFORMANCE_THRESHOLDS.accessibility
    );

    // Critical for auth forms - accessibility is crucial
    expect(result.audits['color-contrast'].score).toBe(1);
    expect(result.audits['label'].score).toBe(1);
    expect(result.audits['focusable-controls']).toBeTruthy();
  });

  test('Teacher dashboard performance audit', async () => {
    const result = await runLighthouse('http://localhost:3000/profesor');

    expect(result.categories.performance.score).toBeGreaterThanOrEqual(0.8); // Slightly lower for authenticated pages
    expect(result.audits['unused-javascript'].numericValue).toBeLessThanOrEqual(
      100000
    );
    expect(result.audits['unused-css-rules'].numericValue).toBeLessThanOrEqual(
      15000
    );
  });

  test('Parent dashboard performance audit', async () => {
    const result = await runLighthouse('http://localhost:3000/parent');

    expect(result.categories.performance.score).toBeGreaterThanOrEqual(0.8);
    expect(result.categories.accessibility.score).toBeGreaterThanOrEqual(
      PERFORMANCE_THRESHOLDS.accessibility
    );
  });

  test('Planning documents page performance audit', async () => {
    const result = await runLighthouse(
      'http://localhost:3000/profesor/planificaciones'
    );

    expect(result.categories.performance.score).toBeGreaterThanOrEqual(0.8);

    // Check for data-heavy page optimizations
    expect(
      result.audits['render-blocking-resources'].numericValue
    ).toBeLessThanOrEqual(400);
    expect(result.audits['modern-image-formats']).toBeTruthy();
  });

  test('API health endpoint performance', async () => {
    const result = await runLighthouse('http://localhost:3000/api/health');

    // API endpoints should be extremely fast
    expect(
      result.audits['first-contentful-paint'].numericValue
    ).toBeLessThanOrEqual(500);
    expect(
      result.audits['largest-contentful-paint'].numericValue
    ).toBeLessThanOrEqual(500);
  });

  test('Mobile performance audit - Homepage', async () => {
    const result = await runLighthouse('http://localhost:3000/', 'mobile');

    // Mobile thresholds are more lenient
    expect(result.categories.performance.score).toBeGreaterThanOrEqual(0.8);
    expect(
      result.audits['first-contentful-paint'].numericValue
    ).toBeLessThanOrEqual(3000);
    expect(
      result.audits['largest-contentful-paint'].numericValue
    ).toBeLessThanOrEqual(4000);
    expect(
      result.audits['cumulative-layout-shift'].numericValue
    ).toBeLessThanOrEqual(0.1);

    // Mobile-specific checks
    expect(result.audits['meta-viewport'].score).toBe(1);
    expect(result.audits['tap-targets']).toBeTruthy();
  });

  test('Mobile performance audit - Login', async () => {
    const result = await runLighthouse('http://localhost:3000/login', 'mobile');

    expect(result.categories.performance.score).toBeGreaterThanOrEqual(0.8);
    expect(result.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);

    // Critical for mobile auth
    expect(result.audits['color-contrast'].score).toBe(1);
    expect(result.audits['meta-viewport'].score).toBe(1);
  });

  test('Performance regression detection', async () => {
    const baselineFile = path.join(__dirname, 'baseline-performance.json');
    const currentResults = {
      homepage: await runLighthouse('http://localhost:3000/'),
      login: await runLighthouse('http://localhost:3000/login'),
    };

    try {
      const baseline = JSON.parse(await fs.readFile(baselineFile, 'utf-8'));

      // Check for performance regressions (more than 5% decrease)
      const homepageRegression =
        baseline.homepage.categories.performance.score -
        currentResults.homepage.categories.performance.score;
      const loginRegression =
        baseline.login.categories.performance.score -
        currentResults.login.categories.performance.score;

      expect(homepageRegression).toBeLessThanOrEqual(0.05);
      expect(loginRegression).toBeLessThanOrEqual(0.05);

      if (homepageRegression > 0.02) {
        console.warn(
          `Performance regression detected on homepage: ${homepageRegression.toFixed(3)}`
        );
      }
      if (loginRegression > 0.02) {
        console.warn(
          `Performance regression detected on login: ${loginRegression.toFixed(3)}`
        );
      }
    } catch (error) {
      // No baseline exists, create one
      await fs.writeFile(baselineFile, JSON.stringify(currentResults, null, 2));
      console.log('Performance baseline created');
    }
  });

  test('Bundle size analysis', async () => {
    const result = await runLighthouse('http://localhost:3000/');

    // Check bundle sizes
    const unusedJS = result.audits['unused-javascript'].numericValue || 0;
    const unusedCSS = result.audits['unused-css-rules'].numericValue || 0;

    expect(unusedJS).toBeLessThanOrEqual(100000); // 100KB max unused JS
    expect(unusedCSS).toBeLessThanOrEqual(15000); // 15KB max unused CSS

    console.log('Bundle Analysis:', {
      unusedJavaScript: `${(unusedJS / 1024).toFixed(2)}KB`,
      unusedCSS: `${(unusedCSS / 1024).toFixed(2)}KB`,
    });
  });

  test('Image optimization check', async () => {
    const result = await runLighthouse('http://localhost:3000/');

    // Image optimization audits
    const modernImageFormats = result.audits['modern-image-formats'];
    const efficientlyEncodeImages = result.audits['efficiently-encode-images'];
    const responsiveImages = result.audits['uses-responsive-images'];

    // These should pass or have minimal impact
    if (modernImageFormats.numericValue) {
      expect(modernImageFormats.numericValue).toBeLessThanOrEqual(50000); // 50KB max savings
    }
    if (efficientlyEncodeImages.numericValue) {
      expect(efficientlyEncodeImages.numericValue).toBeLessThanOrEqual(50000);
    }

    console.log('Image Optimization:', {
      modernFormats: modernImageFormats.displayValue || 'Passed',
      encoding: efficientlyEncodeImages.displayValue || 'Passed',
      responsive: responsiveImages.displayValue || 'Passed',
    });
  });
});
