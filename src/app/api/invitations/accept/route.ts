import { NextResponse } from 'next/server';
import { PrismaClient, Role, Permission } from '@/generated/prisma';
import bcrypt from 'bcryptjs'; // For password hashing

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password, name } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing required fields: token, password' }, { status: 400 });
    }

    if (password.length < 8) { // Basic password policy
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation token.' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: `Invitation has already been ${invitation.status.toLowerCase()}.` }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'EXPIRED' },
        });
      return NextResponse.json({ error: 'Invitation has expired.' }, { status: 400 });
    }
    
    // Check if a user already exists with this email (e.g., if they signed up normally after invite was sent but before accepting)
    let user = await prisma.user.findUnique({ where: { email: invitation.email } });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
        // User exists, but maybe didn't set password via invite. Update their password.
        // Or, this could be an error condition depending on your desired flow if an active user gets re-invited.
        // For now, we'll assume it's okay to update the password if they are accepting an invite.
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                name: name || user.name, // Update name if provided
                // Roles and permissions are set via UserRole table
            }
        });
    } else {
        // Create new user
        user = await prisma.user.create({
            data: {
                email: invitation.email,
                password: hashedPassword,
                name: name || null,
                isAdmin: false, // Invited users are not admins by default
                // Roles and permissions will be linked via UserRole
            },
        });
    }

    // Assign role and permissions to the user
    // First, remove any existing roles for this user if they are being re-assigned through a new invite (edge case)
    await prisma.userRole.deleteMany({ where: { userId: user.id }});
    
    await prisma.userRole.create({
        data: {
            userId: user.id,
            role: invitation.role as Role,
            permissions: invitation.permissions as Permission[],
        }
    });

    // Update invitation status
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        invitedUserId: user.id,
      },
    });

    // TODO: Here you might want to automatically sign in the user
    // and redirect them to the dashboard or a welcome page.

    return NextResponse.json({ message: 'Invitation accepted successfully. You can now log in.', userId: user.id }, { status: 200 });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    // Handle Prisma errors or other specific errors if needed
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 