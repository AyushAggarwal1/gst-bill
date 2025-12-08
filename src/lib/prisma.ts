import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const enableQueryLogs = process.env.PRISMA_LOG_QUERIES === 'true' || false;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(enableQueryLogs ? { log: ['query'] } : {}),
    transactionOptions: {
      maxWait: 5000, // 5 seconds to wait for transaction to start
      timeout: 15000, // 15 seconds for transaction to complete
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;