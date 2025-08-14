import { NextResponse } from 'next/server';
import { hostname } from 'os';
import pkg from '../../../../package.json';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const memory = process.memoryUsage();
    const version = (pkg as any)?.version ?? 'unknown';
    // Check DB connectivity with a fast, safe query and timeout
    let dbConnected = false;
    let dbLatencyMs: number | null = null;
    let dbError: string | null = null;
    try {
      const start = Date.now();
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB check timeout')), 1500)),
      ]);
      dbConnected = true;
      dbLatencyMs = Date.now() - start;
    } catch (err) {
      dbConnected = false;
      dbError = err instanceof Error ? err.message : 'Unknown DB error';
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        ppid: process.ppid,
        hostname: hostname(),
        commitSha: process.env.GIT_COMMIT_SHA ?? null,
        database: {
          connected: dbConnected,
          latencyMs: dbLatencyMs,
          error: dbError,
        },
        memory: {
          rss: memory.rss,
          heapTotal: memory.heapTotal,
          heapUsed: memory.heapUsed,
          external: memory.external,
          arrayBuffers: (memory as any).arrayBuffers ?? null
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
} 