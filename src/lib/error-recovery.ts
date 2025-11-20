/**
 * Error Recovery Mechanisms
 * Automatic error recovery and graceful degradation strategies
 * Part of Stage 4: Quality & Performance
 */

import {
  AppError,
  classifyError,
  isRetryableError,
  isCriticalError,
  NetworkError,
  ServiceError,
  formatErrorForContext,
} from "./error-types";
import { apiRequest, ApiResponse } from "./api-client";

export interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  fallbackData?: any;
  onRetry?: (attempt: number, error: AppError) => void;
  onFailure?: (error: AppError) => void;
  context?: "public" | "auth" | "admin";
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  recovered: boolean;
  attempts: number;
  fallbackUsed: boolean;
}

/**
 * Automatic retry with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RecoveryOptions = {},
): Promise<RecoveryResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    fallbackData,
    onRetry,
    onFailure,
  } = options;

  let lastError: AppError | undefined;
  let attempts = 0;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    attempts = attempt;

    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        recovered: attempt > 1,
        attempts,
        fallbackUsed: false,
      };
    } catch (error) {
      lastError = classifyError(error);

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError)) {
        break;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Call retry callback
      onRetry?.(attempt + 1, lastError);

      // Wait before retry with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed, try fallback
  if (fallbackData !== undefined) {
    return {
      success: true,
      data: fallbackData,
      error: lastError,
      recovered: true,
      attempts,
      fallbackUsed: true,
    };
  }

  // Call failure callback
  onFailure?.(lastError!);

  return {
    success: false,
    error: lastError,
    recovered: false,
    attempts,
    fallbackUsed: false,
  };
}

/**
 * API request with automatic recovery
 */
export async function apiWithRecovery<T>(
  url: string,
  options: any = {},
  recoveryOptions: RecoveryOptions = {},
): Promise<RecoveryResult<T>> {
  const result = await withRetry(() => apiRequest<T>(url, options), {
    ...recoveryOptions,
    onRetry: (attempt, error) => {
      recoveryOptions.onRetry?.(attempt, error);
    },
  });

  return {
    ...result,
    data: result.data as T,
  };
}

/**
 * Graceful degradation for UI components
 */
export class GracefulDegradation {
  private fallbackCache = new Map<string, any>();
  private failureCount = new Map<string, number>();

  /**
   * Get data with fallback strategy
   */
  async getData<T>(
    key: string,
    fetcher: () => Promise<T>,
    fallback?: T,
    options: RecoveryOptions = {},
  ): Promise<{ data: T | undefined; error?: AppError; degraded: boolean }> {
    const result = await withRetry(fetcher, {
      ...options,
      fallbackData: fallback || this.fallbackCache.get(key),
    });

    if (result.success && result.data && !result.fallbackUsed) {
      // Cache successful result for future fallback
      this.fallbackCache.set(key, result.data);
      this.failureCount.delete(key);
      return { data: result.data, degraded: false };
    }

    if (result.fallbackUsed) {
      // Track failure count
      const count = this.failureCount.get(key) || 0;
      this.failureCount.set(key, count + 1);

      return {
        data: result.data,
        error: result.error,
        degraded: true,
      };
    }

    return {
      data: undefined,
      error: result.error,
      degraded: true,
    };
  }

  /**
   * Check if a service is in degraded mode
   */
  isDegraded(key: string): boolean {
    return (this.failureCount.get(key) || 0) > 0;
  }

  /**
   * Get failure count for a service
   */
  getFailureCount(key: string): number {
    return this.failureCount.get(key) || 0;
  }

  /**
   * Clear failure tracking for a service
   */
  clearFailures(key: string): void {
    this.failureCount.delete(key);
  }

  /**
   * Get cached fallback data
   */
  getFallbackData<T>(key: string): T | undefined {
    return this.fallbackCache.get(key);
  }
}

// Global degradation manager
export const gracefulDegradation = new GracefulDegradation();

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private successThreshold: number = 3,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = "half-open";
      } else {
        throw new ServiceError(
          "Circuit breaker is open - service temporarily unavailable",
          "CIRCUIT_OPEN",
        );
      }
    }

    try {
      const result = await operation();

      if (this.state === "half-open") {
        this.failures = 0;
        this.state = "closed";
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "open";
    }
  }

  getState(): "closed" | "open" | "half-open" {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = "closed";
  }
}

/**
 * Global circuit breakers for different services
 */
export const circuitBreakers = {
  api: new CircuitBreaker(5, 60000, 3),
  calendar: new CircuitBreaker(3, 30000, 2),
  upload: new CircuitBreaker(3, 120000, 2),
  auth: new CircuitBreaker(10, 300000, 5), // More tolerant for auth
};

/**
 * Enhanced error notification system
 */
export interface ErrorNotification {
  id: string;
  error: AppError;
  context: "public" | "auth" | "admin";
  dismissed: boolean;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "default" | "destructive" | "outline";
  }>;
}

class ErrorNotificationManager {
  private notifications: ErrorNotification[] = [];
  private listeners: Array<(notifications: ErrorNotification[]) => void> = [];

  /**
   * Add error notification
   */
  notify(
    error: AppError,
    context: "public" | "auth" | "admin" = "public",
    actions?: ErrorNotification["actions"],
  ): string {
    const notification: ErrorNotification = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      context,
      dismissed: false,
      timestamp: new Date(),
      actions,
    };

    this.notifications.unshift(notification);

    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }

    this.notifyListeners();

    // Auto-dismiss low severity errors after 5 seconds
    if (error.severity === "low") {
      setTimeout(() => this.dismiss(notification.id), 5000);
    }

    return notification.id;
  }

  /**
   * Dismiss notification
   */
  dismiss(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.dismissed = true;
      this.notifyListeners();
    }
  }

  /**
   * Get active notifications
   */
  getNotifications(context?: "public" | "auth" | "admin"): ErrorNotification[] {
    return this.notifications.filter(
      (n) => !n.dismissed && (!context || n.context === context),
    );
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(
    listener: (notifications: ErrorNotification[]) => void,
  ): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getNotifications()));
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }
}

export const errorNotificationManager = new ErrorNotificationManager();

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      const error = classifyError(event.reason);

      if (isCriticalError(error)) {
        errorNotificationManager.notify(error, "public");
      }

      event.preventDefault();
    });

    // Handle runtime JavaScript errors
    window.addEventListener("error", (event) => {
      const error = classifyError(event.error || new Error(event.message));

      if (isCriticalError(error)) {
        errorNotificationManager.notify(error, "public");
      }
    });
  }
}

/**
 * Context-aware error handling hook
 */
export function useErrorRecovery(
  context: "public" | "auth" | "admin" = "public",
) {
  return {
    /**
     * Handle error with context-appropriate recovery
     */
    handleError: (error: any, options: RecoveryOptions = {}) => {
      const appError = classifyError(error);
      const formatted = formatErrorForContext(appError, context);

      // Add retry action if error is retryable
      const actions: ErrorNotification["actions"] = [];
      if (isRetryableError(appError) && options.onRetry) {
        actions.push({
          label: "Reintentar",
          action: () => options.onRetry?.(1, appError),
          variant: "default",
        });
      }

      errorNotificationManager.notify(
        appError,
        context,
        actions.length > 0 ? actions : undefined,
      );
      return appError;
    },

    /**
     * Recover from error with fallback
     */
    recoverWith: async <T>(
      operation: () => Promise<T>,
      fallback: T,
      options: RecoveryOptions = {},
    ): Promise<T> => {
      const result = await withRetry(operation, {
        ...options,
        fallbackData: fallback,
        context,
      });

      if (!result.success) {
        errorNotificationManager.notify(result.error!, context);
        return fallback;
      }

      return result.data!;
    },

    /**
     * Get degradation manager for context
     */
    degradation: gracefulDegradation,

    /**
     * Get circuit breaker for service
     */
    getCircuitBreaker: (service: keyof typeof circuitBreakers) =>
      circuitBreakers[service],
  };
}
