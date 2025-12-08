import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const enableQueryLogs = process.env.PRISMA_LOG_QUERIES === 'true' || false;

// Re-use a single PG pool across the app (and across hot reloads in dev)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail fast with a clear error instead of letting Prisma throw a confusing one later
  throw new Error('DATABASE_URL is not set. Please configure it in your environment.');
}

const pool =
  globalForPrisma.prismaPool ||
  new Pool({
    connectionString,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    ...(enableQueryLogs ? { log: ['query'] } : {}),
    transactionOptions: {
      maxWait: 5000, // 5 seconds to wait for transaction to start
      timeout: 15000, // 15 seconds for transaction to complete
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = pool;
}