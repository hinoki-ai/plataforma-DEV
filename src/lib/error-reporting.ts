/**
 * Error Monitoring and Reporting
 * Centralized error logging and monitoring with context awareness
 * Part of Stage 4: Quality & Performance
 */

import { AppError, classifyError, isCriticalError } from './error-types';
import { UserRole } from '@prisma/client';

export type ExtendedUserRole = UserRole;

export interface ErrorReport {
  id: string;
  error: AppError;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  userRole?: ExtendedUserRole;
  sessionId?: string;
  context: 'public' | 'auth' | 'admin';
  stackTrace?: string;
  breadcrumbs: ErrorBreadcrumb[];
  metadata: Record<string, any>;
  reported: boolean;
}

export interface ErrorBreadcrumb {
  timestamp: Date;
  type: 'navigation' | 'user' | 'api' | 'error' | 'info';
  message: string;
  data?: Record<string, any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByContext: Record<string, number>;
  errorsByPage: Record<string, number>;
  topErrors: Array<{ message: string; count: number; lastSeen: Date }>;
}

class ErrorReportingService {
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private reports: ErrorReport[] = [];
  private maxBreadcrumbs = 50;
  private maxReports = 100;
  private sessionId: string;
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupBreadcrumbTracking();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup automatic breadcrumb tracking
   */
  private setupBreadcrumbTracking(): void {
    if (typeof window === 'undefined') return;

    // Track navigation
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      this.addBreadcrumb({
        type: 'navigation',
        message: `Navigation to ${args[2] || window.location.pathname}`,
        data: { url: args[2] || window.location.pathname },
      });
      return originalPushState.apply(history, args);
    };

    // Track clicks on important elements
    document.addEventListener(
      'click',
      event => {
        const target = event.target as Element;
        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('[role="button"]')
        ) {
          this.addBreadcrumb({
            type: 'user',
            message: `Clicked ${target.tagName.toLowerCase()}`,
            data: {
              text: target.textContent?.slice(0, 50),
              id: target.id,
              className: target.className,
            },
          });
        }
      },
      { capture: true, passive: true }
    );

    // Track form submissions
    document.addEventListener(
      'submit',
      event => {
        const form = event.target as HTMLFormElement;
        this.addBreadcrumb({
          type: 'user',
          message: 'Form submitted',
          data: {
            action: form.action,
            method: form.method,
            id: form.id,
          },
        });
      },
      { capture: true }
    );

    // Track API calls (intercept fetch)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || 'unknown';
      const startTime = Date.now();

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        this.addBreadcrumb({
          type: 'api',
          message: `API ${response.status} ${url}`,
          data: {
            url,
            status: response.status,
            duration,
            method: args[1]?.method || 'GET',
          },
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        this.addBreadcrumb({
          type: 'api',
          message: `API Error ${url}`,
          data: {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration,
            method: args[1]?.method || 'GET',
          },
        });

        throw error;
      }
    };
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>): void {
    if (!this.isEnabled) return;

    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date(),
    });

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Report error
   */
  reportError(
    error: any,
    context: 'public' | 'auth' | 'admin' = 'public',
    userId?: string,
    userRole?: ExtendedUserRole,
    metadata: Record<string, any> = {}
  ): string {
    if (!this.isEnabled) return '';

    const appError = classifyError(error);
    const reportId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const report: ErrorReport = {
      id: reportId,
      error: appError,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      userId,
      userRole,
      sessionId: this.sessionId,
      context,
      stackTrace: error instanceof Error ? error.stack : undefined,
      breadcrumbs: [...this.breadcrumbs],
      metadata: {
        ...metadata,
        viewport:
          typeof window !== 'undefined'
            ? {
                width: window.innerWidth,
                height: window.innerHeight,
              }
            : undefined,
        timestamp: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reported: false,
    };

    this.reports.push(report);

    // Keep only last N reports
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(-this.maxReports);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Report: ${appError.code}`);
      console.error('Error:', appError);
      console.groupEnd();
    }

    // Send to external monitoring service if available
    this.sendToMonitoringService(report);

    // Add breadcrumb for the error itself
    this.addBreadcrumb({
      type: 'error',
      message: `Error: ${appError.userMessage}`,
      data: {
        code: appError.code,
        severity: appError.severity,
        reportId,
      },
    });

    return reportId;
  }

  /**
   * Send error to external monitoring service
   */
  private async sendToMonitoringService(report: ErrorReport): Promise<void> {
    try {
      // Only send critical and high severity errors to external service
      if (
        report.error.severity !== 'critical' &&
        report.error.severity !== 'high'
      ) {
        return;
      }

      // Try to send to monitoring service (e.g., Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: report.error.technicalMessage,
          fatal: report.error.severity === 'critical',
          custom_map: {
            error_code: report.error.code,
            context: report.context,
            user_role: report.userRole,
            report_id: report.id,
          },
        });
      }

      // Send to custom API endpoint if configured
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: report.id,
            error: {
              code: report.error.code,
              message: report.error.technicalMessage,
              severity: report.error.severity,
              context: report.error.context,
            },
            timestamp: report.timestamp.toISOString(),
            url: report.url,
            userId: report.userId,
            userRole: report.userRole,
            sessionId: report.sessionId,
            context: report.context,
            breadcrumbs: report.breadcrumbs.slice(-10), // Only last 10
            metadata: report.metadata,
          }),
        });
      }

      report.reported = true;
    } catch (sendError) {}
  }

  /**
   * Get error metrics
   */
  getMetrics(): ErrorMetrics {
    const metrics: ErrorMetrics = {
      totalErrors: this.reports.length,
      errorsByCategory: {},
      errorsBySeverity: {},
      errorsByContext: {},
      errorsByPage: {},
      topErrors: [],
    };

    // Process reports
    const errorGroups = new Map<string, { count: number; lastSeen: Date }>();

    for (const report of this.reports) {
      const error = report.error;

      // Count by category
      const category = error.code.split('_')[0];
      metrics.errorsByCategory[category] =
        (metrics.errorsByCategory[category] || 0) + 1;

      // Count by severity
      metrics.errorsBySeverity[error.severity] =
        (metrics.errorsBySeverity[error.severity] || 0) + 1;

      // Count by context
      metrics.errorsByContext[report.context] =
        (metrics.errorsByContext[report.context] || 0) + 1;

      // Count by page
      const page = new URL(report.url).pathname;
      metrics.errorsByPage[page] = (metrics.errorsByPage[page] || 0) + 1;

      // Group similar errors
      const errorKey = `${error.code}:${error.technicalMessage}`;
      const existing = errorGroups.get(errorKey);
      if (existing) {
        existing.count++;
        if (report.timestamp > existing.lastSeen) {
          existing.lastSeen = report.timestamp;
        }
      } else {
        errorGroups.set(errorKey, {
          count: 1,
          lastSeen: report.timestamp,
        });
      }
    }

    // Get top errors
    metrics.topErrors = Array.from(errorGroups.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return metrics;
  }

  /**
   * Get error reports
   */
  getReports(limit?: number): ErrorReport[] {
    const reports = [...this.reports].reverse(); // Most recent first
    return limit ? reports.slice(0, limit) : reports;
  }

  /**
   * Clear reports and breadcrumbs
   */
  clear(): void {
    this.reports = [];
    this.breadcrumbs = [];
  }

  /**
   * Enable/disable error reporting
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Global error reporting service
export const errorReporting = new ErrorReportingService();

/**
 * Setup error reporting with global handlers
 */
export function setupErrorReporting(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    errorReporting.reportError(event.reason, 'public', undefined, undefined, {
      type: 'unhandled_promise_rejection',
    });
  });

  // Handle runtime JavaScript errors
  window.addEventListener('error', event => {
    errorReporting.reportError(
      event.error || new Error(event.message),
      'public',
      undefined,
      undefined,
      {
        type: 'runtime_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // Handle resource loading errors
  window.addEventListener(
    'error',
    event => {
      if (event.target !== window) {
        const target = event.target as any;
        errorReporting.addBreadcrumb({
          type: 'error',
          message: `Resource failed to load: ${target.src || target.href || 'unknown'}`,
          data: {
            type: 'resource_error',
            tagName: target.tagName,
            src: target.src,
            href: target.href,
          },
        });
      }
    },
    true
  );
}

/**
 * Hook for React components to report errors
 */
export function useErrorReporting(
  context: 'public' | 'auth' | 'admin' = 'public',
  userId?: string,
  userRole?: ExtendedUserRole
) {
  return {
    reportError: (error: any, metadata: Record<string, any> = {}) => {
      return errorReporting.reportError(
        error,
        context,
        userId,
        userRole,
        metadata
      );
    },

    addBreadcrumb: (breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>) => {
      errorReporting.addBreadcrumb(breadcrumb);
    },

    getMetrics: () => errorReporting.getMetrics(),

    getReports: (limit?: number) => errorReporting.getReports(limit),
  };
}

// Type augmentation for gtag function
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
