import { NextResponse } from 'next/server';
import { Role, Permission } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

// Zod schema for validating the update request body
const updateUserSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").optional(),
  isAdmin: z.boolean().optional(),
  roles: z.array(
    z.object({
      role: z.nativeEnum(Role),
      permissions: z.array(z.nativeEnum(Permission)),
    })
  ).optional(),
});

// PUT handler to update a user
export async function PUT(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { userId } = await context.params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!currentUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Only admins can update users.' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Target user must belong to the caller's tenant
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, tenantId: currentUser.tenantId },
    });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.flatten() }, { status: 400 });
    }

    const { name, isAdmin, roles } = validation.data;

    // Use a transaction to ensure atomicity
    const updatedUser = await prisma.$transaction(async (tx) => {
      if (roles !== undefined) {
        await tx.userRole.deleteMany({ where: { userId } });
        if (roles.length > 0) {
          await tx.userRole.createMany({
            data: roles.map(r => ({
              userId,
              role: r.role,
              permissions: r.permissions,
            })),
          });
        }
      }

      const userDataToUpdate: { name?: string; isAdmin?: boolean } = {};
      if (name !== undefined) userDataToUpdate.name = name;
      if (isAdmin !== undefined) {
        // Don't let the last admin in THIS tenant drop their own admin rights
        if (currentUser.id === userId && isAdmin === false) {
          const adminCount = await tx.user.count({
            where: { isAdmin: true, tenantId: currentUser.tenantId },
          });
          if (adminCount === 1) {
            throw new Error('Cannot remove admin status from the last admin.');
          }
        }
        userDataToUpdate.isAdmin = isAdmin;
      }

      if (Object.keys(userDataToUpdate).length > 0) {
        return tx.user.update({
          where: { id: userId },
          data: userDataToUpdate,
          include: { roles: true },
        });
      }
      return tx.user.findUnique({
        where: { id: userId },
        include: { roles: true },
      });
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'Cannot remove admin status from the last admin.') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE handler to remove a user
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { userId } = await context.params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!currentUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Only admins can delete users.' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json({ error: 'Admins cannot delete their own account.' }, { status: 400 });
    }

    // Target user must belong to the caller's tenant
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, tenantId: currentUser.tenantId },
    });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

// GET handler to fetch a single user
export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { userId } = await context.params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Admin can fetch any user in their tenant; a non-admin only their own record
    if (!currentUser.isAdmin && currentUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden. You can only fetch your own details.' }, { status: 403 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId: currentUser.tenantId },
      include: {
        roles: {
          select: { role: true, permissions: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
