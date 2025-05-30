import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
// Assuming you have a way to get the current authenticated user and check if they are admin
// For now, using the same mock as in invite/route.ts
// import { getCurrentUser } from '@/lib/auth'; // Replace with your actual auth logic

const prisma = new PrismaClient();

// Placeholder for getting current user - replace with your actual implementation
async function getCurrentUser(request: Request): Promise<{ id: string; isAdmin: boolean } | null> {
  // This is a mock. In a real app, you'd get this from session, token, etc.
  // For testing, you might hardcode an admin user or read from a header.
  const userId = request.headers.get('user-id'); // Example: pass admin user ID in a header for now
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return { id: user.id, isAdmin: user.isAdmin };
    }
  }
  return null;
}


export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);

    // TODO: Replace with proper authentication and authorization
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can view all users.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        roles: { // Include UserRole data
          select: {
            role: true,
            permissions: true,
          }
        },
        // Do not select password
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 