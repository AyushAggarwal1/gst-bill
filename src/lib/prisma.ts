import { PrismaClient } from '../generated/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
    transactionOptions: {
      maxWait: 5000, // 5 seconds to wait for transaction to start
      timeout: 15000, // 15 seconds for transaction to complete
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 