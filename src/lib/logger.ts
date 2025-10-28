// Production logging configuration for QMS

interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  private level: number;
  private context: string;

  constructor(context: string = 'QMS') {
    this.context = context;
    this.level = this.getLogLevel();
  }

  private getLogLevel(): number {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LOG_LEVELS[envLevel as keyof LogLevel] ?? LOG_LEVELS.INFO;
  }

  private shouldLog(level: number): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta && { meta }),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
    };

    return JSON.stringify(logEntry);
  }

  error(message: string, error?: Error | any, meta?: any): void {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;

    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error.cause && { cause: error.cause }),
        },
      }),
    };

    console.error(this.formatMessage('ERROR', message, errorMeta));

    // Send to external error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(message, error, errorMeta);
    }
  }

  warn(message: string, meta?: any): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    console.warn(this.formatMessage('WARN', message, meta));
  }

  info(message: string, meta?: any): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    console.info(this.formatMessage('INFO', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    console.debug(this.formatMessage('DEBUG', message, meta));
  }

  // Performance logging
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
  }

  // Request logging middleware
  logRequest(req: any, res: any, duration: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referer: req.headers.referer,
    };

    if (res.statusCode >= 400) {
      this.warn('HTTP Request Error', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, duration: number, error?: Error): void {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`,
    };

    if (error) {
      this.error(`Database operation failed: ${operation} on ${table}`, error, logData);
    } else {
      this.debug(`Database operation: ${operation} on ${table}`, logData);
    }
  }

  // Business logic logging
  logBusinessEvent(event: string, userId?: string, meta?: any): void {
    const logData = {
      event,
      ...(userId && { userId }),
      ...meta,
    };

    this.info(`Business Event: ${event}`, logData);
  }

  // Security event logging
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    meta?: any
  ): void {
    const logData = {
      event,
      severity,
      ...meta,
    };

    if (severity === 'critical' || severity === 'high') {
      this.error(`Security Event: ${event}`, undefined, logData);
    } else {
      this.warn(`Security Event: ${event}`, logData);
    }
  }

  private async sendToErrorTracking(message: string, error?: Error, meta?: any): Promise<void> {
    try {
      // Integration with error tracking services like Sentry, Bugsnag, etc.
      // This is a placeholder for actual implementation

      if (process.env.SENTRY_DSN) {
        // Sentry integration would go here
        // Sentry.captureException(error, { extra: meta });
      }

      if (process.env.WEBHOOK_ERROR_URL) {
        // Send to webhook for custom error handling
        await fetch(process.env.WEBHOOK_ERROR_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            error: error?.message,
            stack: error?.stack,
            meta,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
          }),
        });
      }
    } catch (trackingError) {
      // Don't let error tracking failures break the application
      console.error('Failed to send error to tracking service:', trackingError);
    }
  }
}

// Create logger instances for different parts of the application
export const logger = new Logger('QMS');
export const dbLogger = new Logger('QMS:Database');
export const apiLogger = new Logger('QMS:API');
export const authLogger = new Logger('QMS:Auth');

// Request logging middleware for Next.js
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      apiLogger.logRequest(req, res, duration);
    });

    if (next) next();
  };
}

// Error boundary logging
export function logErrorBoundary(error: Error, errorInfo: any): void {
  logger.error('React Error Boundary caught an error', error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
}

// Unhandled error logging
if (typeof window === 'undefined') {
  // Server-side error handling
  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception', error, { fatal: true });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason as Error, {
      promise: promise.toString(),
      fatal: false,
    });
  });
}

export default logger;
