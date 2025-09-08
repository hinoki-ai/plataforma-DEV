/**
 * Enhanced logger for production and development environments
 * Provides structured logging with different levels and environments
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogData {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private context: string;

  constructor(context: string = 'Application') {
    this.context = context;
    this.logLevel = this.getLogLevel();
  }

  static getInstance(context: string = 'Application'): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

    if (validLevels.includes(envLevel)) {
      return envLevel;
    }

    // Default to info in production, debug in development
    return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): LogData {
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
      error,
    };
  }

  private logToConsole(logData: LogData) {
    const { level, message, timestamp, context, data, error } = logData;
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, data || '');
        }
        break;
      case 'info':
        break;
      case 'warn':
        break;
      case 'error':
        console.error(logMessage, error || data || '');
        break;
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      const logData = this.formatMessage('debug', message, data);
      this.logToConsole(logData);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      const logData = this.formatMessage('info', message, data);
      this.logToConsole(logData);
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      const logData = this.formatMessage('warn', message, data);
      this.logToConsole(logData);
    }
  }

  error(message: string, error?: Error | any, data?: any) {
    if (this.shouldLog('error')) {
      const logData = this.formatMessage(
        'error',
        message,
        data,
        error instanceof Error ? error : undefined
      );
      this.logToConsole(logData);

      // In production, you might want to send errors to external service
      if (process.env.NODE_ENV === 'production') {
        this.sendToExternalService(logData);
      }
    }
  }

  private sendToExternalService(logData: LogData) {
    try {
      // Sentry integration
      if (process.env.SENTRY_DSN && logData.level === 'error') {
        this.sendToSentry(logData);
      }

      // CloudWatch Logs integration
      if (process.env.AWS_CLOUDWATCH_LOG_GROUP) {
        this.sendToCloudWatch(logData);
      }

      // Generic webhook integration
      if (process.env.ERROR_WEBHOOK_URL && logData.level === 'error') {
        this.sendToWebhook(logData);
      }
    } catch (externalError) {
      // Don't let external service errors break the application
      console.error('Failed to send log to external service:', externalError);
    }
  }

  private sendToSentry(logData: LogData) {
    // Dynamic import to avoid bundle bloat if Sentry isn't used
    try {
      // Check if Sentry is available before importing
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        // Client-side Sentry is available
        const Sentry = (window as any).Sentry;
        this.sendToSentryInstance(Sentry, logData);
      } else {
        // Try dynamic import for server-side
        import('@sentry/nextjs')
          .then((Sentry) => {
            this.sendToSentryInstance(Sentry.default || Sentry, logData);
          })
          .catch(() => {
            // Sentry not available, silently ignore
          });
      }
    } catch {
      // Sentry not available, silently ignore
    }
  }

  private sendToSentryInstance(Sentry: any, logData: LogData) {
    if (logData.error) {
      Sentry.captureException(logData.error, {
        tags: {
          context: logData.context,
          level: logData.level,
        },
        extra: {
          message: logData.message,
          data: logData.data,
          userId: logData.userId,
          sessionId: logData.sessionId,
          requestId: logData.requestId,
        },
      });
    } else {
      Sentry.captureMessage(logData.message, {
        level: logData.level === 'error' ? 'error' : 'warning',
        tags: {
          context: logData.context,
        },
        extra: {
          data: logData.data,
          userId: logData.userId,
          sessionId: logData.sessionId,
          requestId: logData.requestId,
        },
      });
    }
  }

  private sendToCloudWatch(logData: LogData) {
    // AWS CloudWatch integration would go here
    // This is a placeholder for actual implementation
    if (typeof window === 'undefined') {
      // Only run on server side
      console.log('CloudWatch logging not implemented yet');
    }
  }

  private async sendToWebhook(logData: LogData) {
    try {
      await fetch(process.env.ERROR_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...logData,
          service: 'manitos-pintadas',
          environment: process.env.NODE_ENV,
        }),
      });
    } catch (error) {
      console.error('Failed to send error to webhook:', error);
    }
  }

  // Enhanced error tracking methods
  logApiError(endpoint: string, error: Error, context?: any, userId?: string, sessionId?: string) {
    this.error(`API Error: ${endpoint}`, error, {
      context,
      userId,
      sessionId,
      endpoint,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }

  logDatabaseError(operation: string, error: Error, context?: any) {
    this.error(`Database Error: ${operation}`, error, {
      context,
      operation,
      database: process.env.DATABASE_URL ? 'configured' : 'not-configured',
    });
  }

  logSecurityEvent(event: string, userId?: string, details?: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const level = severity === 'critical' ? 'error' : 'warn';
    const logData = this.formatMessage(level, `Security Event: ${event}`, {
      userId,
      details,
      severity,
      ip: details?.ip,
      userAgent: details?.userAgent,
    });

    if (level === 'error') {
      this.error(`Security Event: ${event}`, undefined, { userId, details, severity });
    } else {
      this.warn(`Security Event: ${event}`, { userId, details, severity });
    }
  }

  logUserAction(action: string, userId: string, details?: any) {
    this.info(`User Action: ${action}`, {
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logPerformanceMetric(metric: string, value: number, context?: any) {
    this.info(`Performance: ${metric}`, {
      value,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Error boundary specific logging
  logErrorBoundary(error: Error, errorInfo: any, componentName?: string) {
    this.error('Error Boundary Caught Error', error, {
      componentName,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
    });
  }

  // Client-side error tracking
  logClientError(error: Error, context?: any) {
    this.error('Client Error', error, {
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      clientSide: true,
    });
  }
}

// Convenience exports
export const logger = Logger.getInstance('Application');

// Context-specific loggers
export const authLogger = Logger.getInstance('Auth');
export const apiLogger = Logger.getInstance('API');
export const dbLogger = Logger.getInstance('Database');
export const securityLogger = Logger.getInstance('Security');

// Export for backward compatibility
export default logger;
