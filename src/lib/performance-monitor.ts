/**
 * Performance Monitoring System
 * Context-aware performance tracking and optimization
 * Part of Stage 4: Quality & Performance
 */

import { UserRole } from '@prisma/client';
export type ExtendedUserRole = UserRole;

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  context: 'public' | 'auth' | 'admin';
  userRole?: ExtendedUserRole;
  url: string;
  device: 'mobile' | 'tablet' | 'desktop';
  connection: string;
  metadata: Record<string, any>;
}

export interface ComponentPerformanceMetric {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  errorCount: number;
  context: 'public' | 'auth' | 'admin';
  timestamp: Date;
}

export interface CoreWebVitals {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export interface PerformanceReport {
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  coreWebVitals: CoreWebVitals;
  componentMetrics: ComponentPerformanceMetric[];
  bundleSize: number;
  memoryUsage: number;
  networkRequests: number;
  context: 'public' | 'auth' | 'admin';
  timestamp: Date;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: ComponentPerformanceMetric[] = [];
  private maxMetrics = 1000;
  private isEnabled = true;
  private observer?: PerformanceObserver;
  private coreWebVitals: CoreWebVitals = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  };

  constructor() {
    this.setupPerformanceObserver();
    this.setupWebVitalsTracking();
  }

  /**
   * Setup Performance Observer
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different performance entry types
      this.observer.observe({
        entryTypes: [
          'navigation',
          'resource',
          'paint',
          'layout-shift',
          'first-input',
        ],
      });
    } catch (error) {}
  }

  /**
   * Setup Core Web Vitals tracking
   */
  private setupWebVitalsTracking(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.trackLCP();

    // First Input Delay (FID)
    this.trackFID();

    // Cumulative Layout Shift (CLS)
    this.trackCLS();

    // First Contentful Paint (FCP)
    this.trackFCP();

    // Time to First Byte (TTFB)
    this.trackTTFB();
  }

  /**
   * Track Largest Contentful Paint
   */
  private trackLCP(): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.coreWebVitals.lcp = lastEntry.startTime;

        this.recordMetric({
          name: 'lcp',
          value: lastEntry.startTime,
          metadata: { type: 'core-web-vital' },
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {}
  }

  /**
   * Track First Input Delay
   */
  private trackFID(): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const fid = (entry as any).processingStart - entry.startTime;
          this.coreWebVitals.fid = fid;

          this.recordMetric({
            name: 'fid',
            value: fid,
            metadata: { type: 'core-web-vital' },
          });
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {}
  }

  /**
   * Track Cumulative Layout Shift
   */
  private trackCLS(): void {
    if (!window.PerformanceObserver) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        this.coreWebVitals.cls = clsValue;
        this.recordMetric({
          name: 'cls',
          value: clsValue,
          metadata: { type: 'core-web-vital' },
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {}
  }

  /**
   * Track First Contentful Paint
   */
  private trackFCP(): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.coreWebVitals.fcp = entry.startTime;

            this.recordMetric({
              name: 'fcp',
              value: entry.startTime,
              metadata: { type: 'core-web-vital' },
            });
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {}
  }

  /**
   * Track Time to First Byte
   */
  private trackTTFB(): void {
    if (typeof window === 'undefined' || !window.performance.timing) return;

    window.addEventListener('load', () => {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.navigationStart;

      this.coreWebVitals.ttfb = ttfb;
      this.recordMetric({
        name: 'ttfb',
        value: ttfb,
        metadata: { type: 'core-web-vital' },
      });
    });
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    if (!this.isEnabled) return;

    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.processResourceEntry(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.processPaintEntry(entry);
        break;
    }
  }

  /**
   * Process navigation timing
   */
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = {
      domContentLoaded:
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.recordMetric({
          name,
          value,
          metadata: { type: 'navigation', entryType: entry.entryType },
        });
      }
    });
  }

  /**
   * Process resource timing
   */
  private processResourceEntry(entry: PerformanceResourceTiming): void {
    // Track large resources and slow loading times
    const loadTime = entry.responseEnd - entry.requestStart;
    const resourceSize = entry.transferSize || 0;

    if (loadTime > 1000 || resourceSize > 100000) {
      // > 1s or > 100KB
      this.recordMetric({
        name: 'slow-resource',
        value: loadTime,
        metadata: {
          type: 'resource',
          url: entry.name,
          size: resourceSize,
          resourceType: this.getResourceType(entry.name),
        },
      });
    }
  }

  /**
   * Process paint timing
   */
  private processPaintEntry(entry: PerformanceEntry): void {
    this.recordMetric({
      name: entry.name,
      value: entry.startTime,
      metadata: { type: 'paint' },
    });
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: {
    name: string;
    value: number;
    context?: 'public' | 'auth' | 'admin';
    userRole?: ExtendedUserRole;
    metadata?: Record<string, any>;
  }): void {
    if (!this.isEnabled) return;

    const fullMetric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: metric.name,
      value: metric.value,
      timestamp: new Date(),
      context: metric.context || this.detectContext(),
      userRole: metric.userRole,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      device: this.detectDevice(),
      connection: this.detectConnection(),
      metadata: metric.metadata || {},
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      this.checkPerformanceThresholds(fullMetric);
    }
  }

  /**
   * Record component performance
   */
  recordComponentMetric(
    metric: Omit<ComponentPerformanceMetric, 'timestamp' | 'context'>
  ): void {
    if (!this.isEnabled) return;

    const fullMetric: ComponentPerformanceMetric = {
      ...metric,
      context: this.detectContext(),
      timestamp: new Date(),
    };

    this.componentMetrics.push(fullMetric);

    // Keep only recent metrics
    if (this.componentMetrics.length > this.maxMetrics) {
      this.componentMetrics = this.componentMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Detect current context
   */
  private detectContext(): 'public' | 'auth' | 'admin' {
    if (typeof window === 'undefined') return 'public';

    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/profesor') || path.startsWith('/parent'))
      return 'auth';
    return 'public';
  }

  /**
   * Detect device type
   */
  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Detect connection type
   */
  private detectConnection(): string {
    if (typeof navigator === 'undefined' || !(navigator as any).connection) {
      return 'unknown';
    }

    const connection = (navigator as any).connection;
    return connection.effectiveType || connection.type || 'unknown';
  }

  /**
   * Check performance thresholds and warn
   */
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
      pageLoadTime: { good: 3000, poor: 5000 },
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold.poor) {
      // Poor performance warning - could be logged to monitoring service
    }
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const now = new Date();
    const recentMetrics = this.metrics.filter(
      m => now.getTime() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    return {
      pageLoadTime: this.getLatestMetricValue('pageLoadTime') || 0,
      domContentLoaded: this.getLatestMetricValue('domContentLoaded') || 0,
      resourceLoadTime: this.getAverageMetricValue('slow-resource') || 0,
      coreWebVitals: { ...this.coreWebVitals },
      componentMetrics: [...this.componentMetrics.slice(-20)], // Last 20
      bundleSize: this.getBundleSize(),
      memoryUsage: this.getMemoryUsage(),
      networkRequests: recentMetrics.filter(m => m.metadata.type === 'resource')
        .length,
      context: this.detectContext(),
      timestamp: now,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
  }

  /**
   * Get latest metric value
   */
  private getLatestMetricValue(name: string): number | null {
    const metric = this.metrics
      .filter(m => m.name === name)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return metric ? metric.value : null;
  }

  /**
   * Get average metric value
   */
  private getAverageMetricValue(name: string): number | null {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get bundle size estimate
   */
  private getBundleSize(): number {
    if (typeof performance === 'undefined') return 0;

    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
    return resources
      .filter(r => r.name.includes('.js') || r.name.includes('.css'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance === 'undefined' || !(performance as any).memory)
      return 0;

    return (performance as any).memory.usedJSHeapSize || 0;
  }

  /**
   * Get metrics
   */
  getMetrics(limit?: number): PerformanceMetric[] {
    const metrics = [...this.metrics].reverse(); // Most recent first
    return limit ? metrics.slice(0, limit) : metrics;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
    this.componentMetrics = [];
    this.coreWebVitals = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
    };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for React components to track performance
 */
export function usePerformanceMonitor(componentName: string) {
  return {
    recordRender: (renderTime: number) => {
      performanceMonitor.recordComponentMetric({
        componentName,
        renderTime,
        mountTime: 0,
        updateCount: 0,
        errorCount: 0,
      });
    },

    recordMount: (mountTime: number) => {
      performanceMonitor.recordComponentMetric({
        componentName,
        renderTime: 0,
        mountTime,
        updateCount: 0,
        errorCount: 0,
      });
    },

    recordError: () => {
      performanceMonitor.recordComponentMetric({
        componentName,
        renderTime: 0,
        mountTime: 0,
        updateCount: 0,
        errorCount: 1,
      });
    },
  };
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track initial page load
  window.addEventListener('load', () => {
    const timing = performance.timing;
    performanceMonitor.recordMetric({
      name: 'page-load-complete',
      value: timing.loadEventEnd - timing.navigationStart,
      metadata: { type: 'page-load' },
    });
  });
}
