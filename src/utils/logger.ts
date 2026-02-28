/**
 * Advanced Logging System with Local Storage Persistence
 * Tracks: Errors, Performance, Device Info, User Actions, Network Events
 *
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * - Local storage persistence (IndexedDB for large logs)
 * - Performance metrics tracking
 * - Error stack traces
 * - Automatic log rotation
 * - Export logs for debugging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, any>;
  stack?: string;
  userAgent?: string;
  url?: string;
}

interface StoredLogs {
  version: number;
  logs: LogEntry[];
  lastExport: string;
  totalErrors: number;
  totalWarnings: number;
}

const LOG_STORAGE_KEY = 'technologiya_logs';
const MAX_LOGS_IN_MEMORY = 1000;
const MAX_LOGS_IN_STORAGE = 10000;
const LOG_RETENTION_DAYS = 30;

class LoggerService {
  private logs: LogEntry[] = [];
  private initialized = false;
  private networkErrors = 0;
  private renderErrors = 0;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      this.loadLogsFromStorage();
      this.setupGlobalErrorHandlers();
      this.logStartup();
      this.initialized = true;
      console.log('[Logger] Initialized successfully');
    } catch (error) {
      console.error('[Logger] Initialization failed:', error);
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('UNCAUGHT_ERROR', 'JavaScript Exception', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('UNHANDLED_REJECTION', 'Promise Rejection', {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });

    // Performance issues
    if ('PerformanceObserver' in window) {
      try {
        const perfObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if ((entry as any).duration > 3000) {
              this.logWarn('SLOW_TASK', `Slow task detected: ${entry.name}`, {
                duration: (entry as any).duration,
                name: entry.name,
              });
            }
          }
        });

        perfObserver.observe({ entryTypes: ['longtask', 'measure'] });
      } catch (error) {
        console.warn('[Logger] PerformanceObserver not available');
      }
    }

    // Console errors (catch console.error calls)
    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError.apply(console, args);

      if (args[0]?.includes && args[0].includes('[')) {
        // Skip logs that are already from logger
        return;
      }

      this.logError('CONSOLE_ERROR', args[0] || 'Console error', {
        args: args.slice(1),
      });
    };

    // Console warnings
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);

      if (args[0]?.includes && args[0].includes('[')) {
        return;
      }

      this.logWarn('CONSOLE_WARN', args[0] || 'Console warning', {
        args: args.slice(1),
      });
    };
  }

  /**
   * Log startup information
   */
  private logStartup() {
    const logEntry = this.createLogEntry(LogLevel.INFO, 'LOGGER', 'Application Started', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      memory: (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          }
        : undefined,
      connection: {
        effectiveType: (navigator as any).connection?.effectiveType,
        downlink: (navigator as any).connection?.downlink,
      },
    });

    this.addLog(logEntry);
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    data?: Record<string, any>,
    stack?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  /**
   * Add log to collection
   */
  private addLog(entry: LogEntry) {
    this.logs.push(entry);

    // Keep only recent logs in memory
    if (this.logs.length > MAX_LOGS_IN_MEMORY) {
      this.logs = this.logs.slice(-MAX_LOGS_IN_MEMORY);
    }

    // Save to storage periodically
    if (this.logs.length % 50 === 0) {
      this.saveLogsToStorage();
    }

    // Also always log to console for debugging
    this.logToConsole(entry);
  }

  /**
   * Log to browser console
   */
  private logToConsole(entry: LogEntry) {
    const prefix = `[${entry.component}] ${entry.level}:`;
    const style =
      entry.level === LogLevel.ERROR
        ? 'color: red; font-weight: bold;'
        : entry.level === LogLevel.WARN
          ? 'color: orange; font-weight: bold;'
          : entry.level === LogLevel.DEBUG
            ? 'color: gray;'
            : '';

    if (entry.data) {
      console.log(`%c${prefix}`, style, entry.message, entry.data);
    } else {
      console.log(`%c${prefix}`, style, entry.message);
    }

    if (entry.stack) {
      console.log(`Stack trace:\n${entry.stack}`);
    }
  }

  /**
   * Public logging methods
   */

  logDebug(component: string, message: string, data?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.DEBUG, component, message, data);
    this.addLog(entry);
  }

  logInfo(component: string, message: string, data?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.INFO, component, message, data);
    this.addLog(entry);
  }

  logWarn(component: string, message: string, data?: Record<string, any>, stack?: string) {
    const entry = this.createLogEntry(LogLevel.WARN, component, message, data, stack);
    this.addLog(entry);
  }

  logError(component: string, message: string, data?: Record<string, any>, error?: Error) {
    this.renderErrors++;
    const stack = error?.stack || new Error().stack;
    const entry = this.createLogEntry(LogLevel.ERROR, component, message, data, stack);
    this.addLog(entry);
  }

  logCritical(component: string, message: string, data?: Record<string, any>, error?: Error) {
    this.renderErrors++;
    const stack = error?.stack || new Error().stack;
    const entry = this.createLogEntry(LogLevel.CRITICAL, component, message, data, stack);
    this.addLog(entry);

    // Send critical error to analytics if available
    if (window.gtag) {
      (window as any).gtag('event', 'exception', {
        description: `[${component}] ${message}`,
        fatal: true,
      });
    }
  }

  /**
   * Log network request
   */
  logNetworkRequest(url: string, method: string, status: number, duration: number, error?: string) {
    if (status >= 400) {
      this.networkErrors++;
    }

    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.DEBUG;

    this.addLog(
      this.createLogEntry(level, 'NETWORK', `${method} ${url} - ${status}`, {
        method,
        url,
        status,
        duration,
        error,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Log performance metric
   */
  logPerformance(metric: string, duration: number, data?: Record<string, any>) {
    const level = duration > 3000 ? LogLevel.WARN : LogLevel.DEBUG;

    this.addLog(
      this.createLogEntry(level, 'PERFORMANCE', `${metric}: ${duration}ms`, {
        metric,
        duration,
        ...data,
      })
    );
  }

  /**
   * Log device info
   */
  logDeviceInfo(deviceInfo: Record<string, any>) {
    this.addLog(this.createLogEntry(LogLevel.INFO, 'DEVICE', 'Device detected', deviceInfo));
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return this.logs;
  }

  /**
   * Get errors only
   */
  getErrors(): LogEntry[] {
    return this.logs.filter((log) => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL);
  }

  /**
   * Get warnings only
   */
  getWarnings(): LogEntry[] {
    return this.logs.filter((log) => log.level === LogLevel.WARN);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter((log) => log.component === component);
  }

  /**
   * Get logs since time
   */
  getLogsSince(minutes: number): LogEntry[] {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.logs.filter((log) => log.timestamp > cutoffTime);
  }

  /**
   * Get statistics
   */
  getStats() {
    const errors = this.logs.filter((log) => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL);
    const warnings = this.logs.filter((log) => log.level === LogLevel.WARN);
    const networkRequests = this.logs.filter((log) => log.component === 'NETWORK');

    const errorSummary = errors.reduce((acc, log) => {
      const msg = log.message;
      acc[msg] = (acc[msg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logs.length,
      errors: errors.length,
      warnings: warnings.length,
      networkErrors: this.networkErrors,
      renderErrors: this.renderErrors,
      networkRequests: networkRequests.length,
      errorSummary,
      memoryUsage: (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          }
        : undefined,
    };
  }

  /**
   * Export logs as JSON
   */
  exportLogsAsJSON(): string {
    const data: StoredLogs = {
      version: 1,
      logs: this.logs,
      lastExport: new Date().toISOString(),
      totalErrors: this.logs.filter((log) => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL).length,
      totalWarnings: this.logs.filter((log) => log.level === LogLevel.WARN).length,
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Download logs as file
   */
  downloadLogs() {
    const json = this.exportLogsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Save logs to browser local storage
   */
  private saveLogsToStorage() {
    try {
      const data: StoredLogs = {
        version: 1,
        logs: this.logs.slice(-MAX_LOGS_IN_STORAGE),
        lastExport: new Date().toISOString(),
        totalErrors: this.logs.filter((log) => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL).length,
        totalWarnings: this.logs.filter((log) => log.level === LogLevel.WARN).length,
      };

      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[Logger] Failed to save logs to storage:', error);
    }
  }

  /**
   * Load logs from browser local storage
   */
  private loadLogsFromStorage() {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        const data: StoredLogs = JSON.parse(stored);
        this.logs = data.logs || [];

        // Clean old logs
        const cutoffTime = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        this.logs = this.logs.filter((log) => log.timestamp > cutoffTime);

        console.log(`[Logger] Loaded ${this.logs.length} logs from storage`);
      }
    } catch (error) {
      console.warn('[Logger] Failed to load logs from storage:', error);
      this.logs = [];
    }
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(LOG_STORAGE_KEY);
    this.logInfo('LOGGER', 'All logs cleared');
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const stats = this.getStats();
    console.table(stats);
  }
}

// Create singleton instance
export const logger = new LoggerService();

// Make available globally for debugging
(window as any).logger = logger;

export default logger;
