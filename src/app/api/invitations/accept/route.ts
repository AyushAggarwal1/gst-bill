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
      include: {
        tenant: true // Include tenant information
      }
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
    
    // Check if a user already exists with this email IN THIS TENANT
    let user = await prisma.user.findFirst({ 
      where: { 
        email: invitation.email,
        tenantId: invitation.tenantId
      } 
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
        // User exists in this tenant, update their details
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                name: name || user.name
            }
        });
    } else {
        // Create new user in this tenant
        user = await prisma.user.create({
            data: {
                email: invitation.email,
                password: hashedPassword,
                name: name || null,
                isAdmin: false,
                tenant: {
                    connect: { id: invitation.tenantId }
                }
            },
        });
    }

    // Assign role and permissions to the user
    await prisma.userRole.deleteMany({ 
      where: { 
        userId: user.id,
      }
    });
    
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

    return NextResponse.json({ 
      message: 'Invitation accepted successfully. You can now log in.', 
      userId: user.id,
      tenantId: invitation.tenantId,
      tenantName: invitation.tenant.name
    }, { status: 200 });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    // Handle Prisma errors or other specific errors if needed
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 