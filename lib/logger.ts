import pino from "pino";

// Create logger instance
// pino-pretty uses worker threads which don't work in Next.js API routes
// Use simple console-based logging instead
const isDevelopment = process.env.NODE_ENV === "development";

// Use basic pino without transport in Next.js environment
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  // Don't use pino-pretty transport - it causes worker thread issues in Next.js
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Export convenience methods with safe error handling
export const log = {
  info: (message: string, ...args: unknown[]) => {
    try {
      logger.info({ args }, message);
    } catch (err) {
      // Fallback to console if logger fails
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    try {
      if (error instanceof Error) {
        logger.error({ err: error, args }, message);
      } else {
        logger.error({ error, args }, message);
      }
    } catch (err) {
      // Fallback to console if logger fails
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    try {
      logger.warn({ args }, message);
    } catch (err) {
      // Fallback to console if logger fails
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    try {
      logger.debug({ args }, message);
    } catch (err) {
      // Fallback to console if logger fails
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

