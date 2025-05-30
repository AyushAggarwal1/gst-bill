import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Placeholder for getting current user - replace with your actual implementation
async function getCurrentUser(request: Request): Promise<{ id: string; isAdmin: boolean } | null> {
  const userId = request.headers.get('user-id'); 
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

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can view invitations.' }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          }
        },
        invitedUser:{
            select: {
                name: true,
                email: true,
            }
        }
      }
    });

    return NextResponse.json(invitations, { status: 200 });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 