// Simple logger that works reliably in Next.js (including Edge Runtime and Vercel builds)
// Using console methods directly to avoid issues with pino and worker threads

const isDevelopment = process.env.NODE_ENV === "development";
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

const shouldLog = (level: string): boolean => {
  const levels = ["debug", "info", "warn", "error"];
  const currentLevelIndex = levels.indexOf(logLevel);
  const messageLevelIndex = levels.indexOf(level);
  return messageLevelIndex >= currentLevelIndex;
};

const formatMessage = (level: string, message: string, ...args: unknown[]): string => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (args.length > 0) {
    try {
      const argsStr = args.map(arg => 
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ");
      return `${prefix} ${message} ${argsStr}`;
    } catch {
      return `${prefix} ${message}`;
    }
  }
  
  return `${prefix} ${message}`;
};

// Export convenience methods
export const log = {
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog("info")) {
      console.log(formatMessage("info", message, ...args));
    }
  },
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    if (shouldLog("error")) {
      if (error instanceof Error) {
        console.error(formatMessage("error", message, error.message, ...args));
        if (error.stack) {
          console.error(error.stack);
        }
      } else {
        console.error(formatMessage("error", message, error, ...args));
      }
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, ...args));
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", message, ...args));
    }
  },
};

// Export logger for compatibility (if anything still uses it directly)
export const logger = log;

