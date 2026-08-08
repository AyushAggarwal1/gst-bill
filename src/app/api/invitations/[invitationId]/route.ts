import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    invitationId: string;
  }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { invitationId } = await context.params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!currentUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Only admins can revoke invitations.' }, { status: 403 });
    }

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    // Invitation must belong to the caller's tenant
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, tenantId: currentUser.tenantId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot revoke an invitation with status: ${invitation.status}` }, { status: 400 });
    }

    await prisma.invitation.delete({ where: { id: invitationId } });

    return NextResponse.json({ message: 'Invitation revoked successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error revoking invitation:', error);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { invitationId } = await context.params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!currentUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Only admins can update invitations.' }, { status: 403 });
    }

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { role, permissions } = body;
    if (!role || !permissions) {
      return NextResponse.json({ error: 'Role and permissions are required for update' }, { status: 400 });
    }

    // Invitation must belong to the caller's tenant
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, tenantId: currentUser.tenantId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot update an invitation with status: ${invitation.status}` }, { status: 400 });
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        role,        // Prisma validates the Role enum value
        permissions, // Prisma validates the Permission enum values
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Invitation updated successfully', invitation: updatedInvitation }, { status: 200 });

  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
  }
}
