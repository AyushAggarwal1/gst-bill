import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const enableQueryLogs =
  process.env.PRISMA_LOG_QUERIES === 'true' || false;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Please configure it in your environment.',
  );
}

// Re-use a single pg.Pool across hot reloads in dev
const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString,
    min: 2,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
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