import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(req: Request): boolean {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  const fallback = req.headers.get('x-internal-token') || '';
  const provided = token || fallback;
  const expected = process.env.FLAGS_ADMIN_TOKEN || '';
  return expected.length > 0 && provided === expected;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tenants);
}

