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

interface RouteContext {
    params: {
        invitationId: string;
    }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { invitationId } = context.params;

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can revoke invitations.' }, { status: 403 });
    }

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Optional: Only allow deletion if status is PENDING
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot revoke an invitation with status: ${invitation.status}` }, { status: 400 });
    }

    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ message: 'Invitation revoked successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error revoking invitation:', error);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { invitationId } = context.params;
    const body = await request.json();
    const { role, permissions } = body;

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can update invitations.' }, { status: 403 });
    }

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    if (!role || !permissions) {
      return NextResponse.json({ error: 'Role and permissions are required for update' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot update an invitation with status: ${invitation.status}` }, { status: 400 });
    }

    // Validate role and permissions (optional, but good practice)
    // Assuming Role and Permission enums are available in this scope or via PrismaClient
    // if (!Object.values(PrismaClient.Role).includes(role)) { ... }
    // if (!Array.isArray(permissions) || permissions.some(p => !Object.values(PrismaClient.Permission).includes(p))) { ... }

    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        role: role, // Prisma will validate if 'role' is a valid Enum value
        permissions: permissions, // Prisma will validate if 'permissions' are valid Enum values
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Invitation updated successfully', invitation: updatedInvitation }, { status: 200 });

  } catch (error) {
    console.error('Error updating invitation:', error);
    // Add more specific error handling if needed, e.g., for Prisma validation errors
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 