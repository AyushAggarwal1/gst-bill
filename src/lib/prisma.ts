import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const enableQueryLogs = process.env.PRISMA_LOG_QUERIES === 'true' || false;

// Reuse a single pg pool across the app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;