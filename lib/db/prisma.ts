import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Determine database type from DATABASE_URL
const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
const isSQLite = databaseUrl.startsWith("file:") || databaseUrl.endsWith(".db");
const isProduction = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

// In production/Vercel, require Postgres
if ((isProduction || isVercel) && isSQLite) {
  throw new Error(
    "SQLite is not supported in production. Please set DATABASE_URL to a Postgres connection string."
  );
}

// Create Prisma client with appropriate adapter
let prismaClient: PrismaClient;

if (isSQLite) {
  // Local development with SQLite
  // Note: Schema must be postgresql, but we use SQLite adapter at runtime
  const dbPath = databaseUrl.replace(/^file:/, "");
  try {
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    prismaClient = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch (error) {
    console.error("Failed to create SQLite adapter:", error);
    throw new Error(
      `Failed to initialize SQLite database. Error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
} else {
  // Production/Postgres
  prismaClient = new PrismaClient({
    ...(process.env.PRISMA_DATABASE_URL
      ? { accelerateUrl: process.env.PRISMA_DATABASE_URL }
      : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? prismaClient;

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
