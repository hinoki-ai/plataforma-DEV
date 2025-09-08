/**
 * Client-side monitoring utility for the enhanced debug panel
 * Safely captures performance metrics and errors without affecting user experience
 */

class DebugMonitor {
  private sessionId: string;
  private isEnabled: boolean = false;
  private performanceObserver?: PerformanceObserver;
  private errorHandler?: (event: ErrorEvent) => void;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled =
      typeof window !== 'undefined' && this.shouldEnableMonitoring();
  }

  /**
   * Initialize monitoring (call this in admin debug panel only)
   */
  public init() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.trackSessionActivity('login');
  }

  /**
   * Stop monitoring
   */
  public destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
      window.removeEventListener(
        'unhandledrejection',
        this.errorHandler as any
      );
    }
  }

  /**
   * Track navigation events
   */
  public trackNavigation(path: string) {
    if (!this.isEnabled) return;
    this.trackSessionActivity('navigation', path);
  }

  /**
   * Track API calls
   */
  public trackApiCall(endpoint: string, duration: number, success: boolean) {
    if (!this.isEnabled) return;

    this.sendToDebugAPI('/api/debug-performance', {
      type: 'api_call',
      data: {
        endpoint,
        duration,
        success,
      },
    });
  }

  /**
   * Track custom errors
   */
  public trackError(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: any
  ) {
    if (!this.isEnabled) return;

    this.sendToDebugAPI('/api/debug-errors', {
      type: 'javascript',
      message,
      severity,
      url: window.location.href,
      stack: new Error().stack,
    });
  }

  /**
   * Get basic performance metrics
   */
  public getPerformanceMetrics() {
    if (!this.isEnabled || typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      loadTime: navigation
        ? Math.round(navigation.loadEventEnd - navigation.fetchStart)
        : 0,
      domContentLoaded: navigation
        ? Math.round(
            navigation.domContentLoadedEventEnd - navigation.fetchStart
          )
        : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint:
        paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      memoryUsage: (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          }
        : null,
    };
  }

  private generateSessionId(): string {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  private shouldEnableMonitoring(): boolean {
    // Only enable if user is admin and on debug page or explicitly enabled
    const isDebugPage = window.location.pathname.includes('/debug');
    const isAdmin =
      document.cookie.includes('role=ADMIN') ||
      localStorage.getItem('userRole') === 'ADMIN';

    return isAdmin && isDebugPage;
  }

  private setupErrorHandling() {
    this.errorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
      let message = '';
      let stack = '';

      if (event instanceof ErrorEvent) {
        message = event.message;
        stack = event.error?.stack || '';
      } else if ('reason' in event) {
        message = event.reason?.message || String(event.reason);
        stack = event.reason?.stack || '';
      }

      // Filter out common non-critical errors
      if (this.isIgnorableError(message)) return;

      const severity = this.calculateErrorSeverity(message, stack);

      this.sendToDebugAPI('/api/debug-errors', {
        type: 'javascript',
        message: message.substring(0, 500),
        stack: stack.substring(0, 1000),
        url: window.location.href,
        severity,
      });
    };

    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.errorHandler as any);
  }

  private setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.performanceObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.sendToDebugAPI('/api/debug-performance', {
              type: 'request',
              data: {
                endpoint: window.location.pathname,
                responseTime: Math.round(
                  navEntry.loadEventEnd - navEntry.fetchStart
                ),
                status: 200, // Assume success for navigation
              },
            });
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['navigation', 'resource', 'measure'],
      });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  private trackSessionActivity(
    action: 'login' | 'logout' | 'navigation' | 'api_call',
    details?: string
  ) {
    this.sendToDebugAPI('/api/debug-sessions', {
      action,
      details,
      sessionId: this.sessionId,
    });
  }

  private isIgnorableError(message: string): boolean {
    const ignorablePatterns = [
      'Script error',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Loading chunk',
      'Loading CSS chunk',
    ];

    return ignorablePatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private calculateErrorSeverity(
    message: string,
    stack: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalPatterns = [
      'authentication',
      'login',
      'security',
      'database',
    ];
    const highPatterns = ['api', 'network', 'timeout', 'fetch failed'];
    const mediumPatterns = ['component', 'render', 'state'];

    const text = (message + ' ' + stack).toLowerCase();

    if (criticalPatterns.some(pattern => text.includes(pattern)))
      return 'critical';
    if (highPatterns.some(pattern => text.includes(pattern))) return 'high';
    if (mediumPatterns.some(pattern => text.includes(pattern))) return 'medium';
    return 'low';
  }

  private async sendToDebugAPI(endpoint: string, data: any) {
    try {
      // Use a short timeout to avoid affecting user experience
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error) {
      // Silently fail - debugging should never affect user experience
      console.debug('Debug monitoring request failed:', error);
    }
  }
}

// Singleton instance
export const debugMonitor = new DebugMonitor();

// Auto-initialize if we're on a debug page
if (
  typeof window !== 'undefined' &&
  window.location.pathname.includes('/debug')
) {
  debugMonitor.init();
}
