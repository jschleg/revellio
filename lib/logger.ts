import pino from "pino";

// Create logger instance
// In production, use structured logging
// In development, use pretty printing
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

// Export convenience methods
export const log = {
  info: (message: string, ...args: unknown[]) => logger.info({ args }, message),
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    if (error instanceof Error) {
      logger.error({ err: error, args }, message);
    } else {
      logger.error({ error, args }, message);
    }
  },
  warn: (message: string, ...args: unknown[]) => logger.warn({ args }, message),
  debug: (message: string, ...args: unknown[]) => logger.debug({ args }, message),
};

