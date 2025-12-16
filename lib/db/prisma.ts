import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Extract the file path from DATABASE_URL (format: "file:./dev.db" or "file:dev.db")
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const dbPath = databaseUrl.replace(/^file:/, "");

// Create adapter with error handling
let adapter: PrismaBetterSqlite3;
try {
  adapter = new PrismaBetterSqlite3({ url: dbPath });
} catch (error) {
  console.error("Failed to create Prisma adapter:", error);
  throw new Error(
    `Failed to initialize database adapter. Please ensure better-sqlite3 is properly installed and built. Error: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}

// Create Prisma client with proper configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

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
