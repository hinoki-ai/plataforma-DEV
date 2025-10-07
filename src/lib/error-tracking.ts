import { logger } from "./logger";

export interface ErrorTrackingConfig {
  enableClientTracking: boolean;
  enablePerformanceTracking: boolean;
  enableUserActionTracking: boolean;
  sampleRate: number; // 0.1 = 10% of errors tracked
  environment: "development" | "staging" | "production";
}

export class ErrorTracker {
  private config: ErrorTrackingConfig;
  private errorQueue: any[] = [];
  private isInitialized = false;

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = {
      enableClientTracking: true,
      enablePerformanceTracking: true,
      enableUserActionTracking: true,
      sampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.1,
      environment: (process.env.NODE_ENV as any) || "development",
      ...config,
    };
  }

  initialize() {
    if (this.isInitialized || typeof window === "undefined") return;

    if (this.config.enableClientTracking) {
      this.setupClientErrorTracking();
    }

    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    if (this.config.enableUserActionTracking) {
      this.setupUserActionTracking();
    }

    this.isInitialized = true;
    logger.info("Error tracking initialized", { config: this.config });
  }

  private shouldTrack(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private setupClientErrorTracking() {
    // Global error handler
    window.addEventListener("error", (event) => {
      if (!this.shouldTrack()) return;

      const errorData = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      this.trackError(
        "javascript_error",
        event.error || new Error(event.message),
        errorData,
      );
    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      if (!this.shouldTrack()) return;

      const errorData = {
        reason: event.reason,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      this.trackError("unhandled_promise_rejection", event.reason, errorData);
    });

    // Resource loading errors
    window.addEventListener(
      "error",
      (event) => {
        if (!this.shouldTrack() || !event.target) return;

        const target = event.target as HTMLElement;
        if (
          target.tagName === "IMG" ||
          target.tagName === "SCRIPT" ||
          target.tagName === "LINK"
        ) {
          const errorData = {
            resourceUrl: (target as any).src || (target as any).href,
            resourceType: target.tagName.toLowerCase(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
          };

          this.trackError(
            "resource_loading_error",
            new Error(`Failed to load ${target.tagName} resource`),
            errorData,
          );
        }
      },
      true,
    );
  }

  private setupPerformanceTracking() {
    // Track navigation timing
    window.addEventListener("load", () => {
      setTimeout(() => {
        if (!this.shouldTrack()) return;

        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const timingData = {
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: this.getFirstPaintTime(),
            largestContentfulPaint: this.getLargestContentfulPaint(),
            firstInputDelay: this.getFirstInputDelay(),
            cumulativeLayoutShift: this.getCumulativeLayoutShift(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
          };

          logger.logPerformanceMetric(
            "page_load_timing",
            navigation.loadEventEnd - navigation.loadEventStart,
            timingData,
          );
        }
      }, 0);
    });

    // Track long tasks
    if ("PerformanceObserver" in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        if (!this.shouldTrack()) return;

        list.getEntries().forEach((entry) => {
          if ((entry as any).duration > 50) {
            // Tasks longer than 50ms
            logger.logPerformanceMetric("long_task", (entry as any).duration, {
              startTime: entry.startTime,
              timestamp: new Date().toISOString(),
              url: window.location.href,
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ["longtask"] });
    }
  }

  private setupUserActionTracking() {
    // Track user interactions
    const trackUserAction = (action: string, details?: any) => {
      if (!this.shouldTrack()) return;

      logger.logUserAction(action, "anonymous", {
        ...details,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    // Track clicks
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const elementInfo = {
          tagName: target.tagName,
          id: target.id,
          className: target.className,
          textContent: target.textContent?.slice(0, 50),
          dataAttributes: this.getDataAttributes(target),
        };

        trackUserAction("click", elementInfo);
      }
    });

    // Track form submissions
    document.addEventListener("submit", (event) => {
      const form = event.target as HTMLFormElement;
      if (form) {
        const formData = {
          action: form.action,
          method: form.method,
          elementCount: form.elements.length,
          formId: form.id,
        };

        trackUserAction("form_submit", formData);
      }
    });

    // Track navigation
    let currentPath = window.location.pathname;
    const navigationObserver = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        trackUserAction("navigation", {
          from: currentPath,
          to: window.location.pathname,
          search: window.location.search,
        });
        currentPath = window.location.pathname;
      }
    });

    navigationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private getFirstPaintTime(): number | null {
    if ("PerformanceObserver" in window) {
      const paintEntries = performance.getEntriesByType("paint");
      const firstPaint = paintEntries.find(
        (entry) => entry.name === "first-paint",
      );
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }

  private getLargestContentfulPaint(): number | null {
    if ("PerformanceObserver" in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        return lastEntry ? lastEntry.startTime : null;
      });

      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    }
    return null;
  }

  private getFirstInputDelay(): number | null {
    if ("PerformanceEventTiming" in window) {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          logger.logPerformanceMetric(
            "first_input_delay",
            (entry as any).processingStart - entry.startTime,
          );
        });
      });

      fidObserver.observe({ entryTypes: ["first-input"] });
    }
    return null;
  }

  private getCumulativeLayoutShift(): number | null {
    if ("PerformanceObserver" in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });
      return clsValue;
    }
    return null;
  }

  private getDataAttributes(element: HTMLElement): Record<string, string> {
    const dataAttributes: Record<string, string> = {};
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-")) {
        dataAttributes[attr.name] = attr.value;
      }
    });
    return dataAttributes;
  }

  trackError(type: string, error: Error, context?: any) {
    if (!this.shouldTrack()) return;

    const errorData = {
      type,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      sessionId: this.getSessionId(),
    };

    // Queue error for batch processing if needed
    this.errorQueue.push(errorData);

    // Immediate logging
    logger.logClientError(error, {
      ...context,
      errorType: type,
      sessionId: errorData.sessionId,
    });

    // Process queue if it gets too large
    if (this.errorQueue.length > 10) {
      this.processErrorQueue();
    }
  }

  private processErrorQueue() {
    if (this.errorQueue.length === 0) return;

    logger.info("Processing error queue", {
      queueSize: this.errorQueue.length,
      errors: this.errorQueue,
    });

    this.errorQueue = [];
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem("error_tracking_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("error_tracking_session_id", sessionId);
    }
    return sessionId;
  }

  // Public API for manual error tracking
  trackCustomError(type: string, message: string, context?: any) {
    const error = new Error(message);
    this.trackError(type, error, context);
  }

  trackUserFeedback(feedback: string, context?: any) {
    if (!this.shouldTrack()) return;

    logger.logUserAction("user_feedback", "anonymous", {
      feedback,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  // Cleanup method
  destroy() {
    this.processErrorQueue();
    this.isInitialized = false;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Auto-initialize in browser
if (typeof window !== "undefined") {
  // Initialize after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      errorTracker.initialize(),
    );
  } else {
    errorTracker.initialize();
  }
}
