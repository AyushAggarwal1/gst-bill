import { NextResponse } from 'next/server';
import { Role, Permission } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
// We'll need a way to get the current user, assuming you have an auth system.
// For now, let's placeholder it. You'll need to integrate this with your actual auth.
// import { getCurrentUser } from '@/lib/auth'; // Replace with your actual auth logic

// Placeholder for getting current user - replace with your actual implementation
async function getCurrentUser(request: Request): Promise<{ id: string; isAdmin: boolean; tenantId: string } | null> {
  // This is a mock. In a real app, you'd get this from session, token, etc.
  // For testing, you might hardcode an admin user or read from a header.
  console.log('getCurrentUser mock called. Ensure to replace with actual auth.', request.headers.get('user-id'));
  const userId = request.headers.get('user-id'); // Example: pass admin user ID in a header for now
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return { id: user.id, isAdmin: user.isAdmin, tenantId: user.tenantId };
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);

    // TODO: Replace with proper authentication and authorization
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can invite users.' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role, permissions } = body;

    if (!email || !role || !permissions) {
      return NextResponse.json({ error: 'Missing required fields: email, role, permissions' }, { status: 400 });
    }

    // Validate role
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate permissions
    if (!Array.isArray(permissions) || permissions.some(p => !Object.values(Permission).includes(p as Permission))) {
      return NextResponse.json({ error: 'Invalid permissions' }, { status: 400 });
    }
    
    // Check if user already exists with this email in the same tenant
    const existingUser = await prisma.user.findFirst({ 
      where: { 
        email,
        tenantId: currentUser.tenantId
      } 
    });
    if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists in your organization.' }, { status: 409 });
    }

    // Check if an active invitation already exists for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Greater than current time
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: 'An active invitation for this email already exists.' }, { status: 409 });
    }

    const invitationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Invitation expires in 24 hours

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role as Role,
        permissions: permissions as Permission[],
        invitedById: currentUser.id,
        token: invitationToken,
        expiresAt,
        status: 'PENDING',
        tenantId: currentUser.tenantId,
      },
    });

    // TODO: Implement email sending logic here
    // Example: sendInvitationEmail(email, invitationToken);
    console.log(`Invitation created for ${email} with token ${invitationToken}. Email sending to be implemented.`);

    return NextResponse.json({ message: 'Invitation sent successfully', invitationId: invitation.id }, { status: 201 });

  } catch (error) {
    console.error('Error inviting user:', error);
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
        // Handle specific Prisma errors if needed
    }
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 