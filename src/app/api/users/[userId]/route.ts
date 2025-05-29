import { NextResponse } from 'next/server';
import { PrismaClient, Role, Permission } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Placeholder for getting current user - replace with your actual implementation
async function getCurrentUser(request: Request): Promise<{ id: string; isAdmin: boolean } | null> {
  // TODO: Replace with actual session validation (e.g., NextAuth.js getServerSession)
  const mockUserId = request.headers.get('user-id'); // Using a header for now
  if (mockUserId) {
    const user = await prisma.user.findUnique({ where: { id: mockUserId } });
    if (user) {
      return { id: user.id, isAdmin: user.isAdmin };
    }
  }
  return null;
}

interface RouteContext {
  params: {
    userId: string;
  };
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
    const { userId } = context.params;

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can update users.' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // // Prevent admin from accidentally removing their own admin rights if they are the last admin
    // if (currentUser.id === userId && body.isAdmin === false) {
    //   const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    //   if (adminCount === 1) {
    //     return NextResponse.json({ error: 'Cannot remove admin status from the last admin.' }, { status: 400 });
    //   }
    // }


    let body;
    try {
      body = await request.json();
    } catch (error) {
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
        // Delete existing roles for the user
        await tx.userRole.deleteMany({
          where: { userId: userId },
        });
        // Create new roles
        if (roles.length > 0) {
          await tx.userRole.createMany({
            data: roles.map(r => ({
              userId: userId,
              role: r.role,
              permissions: r.permissions,
            })),
          });
        }
      }

      // Update user details
      const userDataToUpdate: { name?: string; isAdmin?: boolean } = {};
      if (name !== undefined) userDataToUpdate.name = name;
      if (isAdmin !== undefined) {
         // Prevent admin from accidentally removing their own admin rights if they are the last admin
        if (currentUser.id === userId && isAdmin === false) {
          const adminCount = await tx.user.count({ where: { isAdmin: true } });
          if (adminCount === 1) {
            // Instead of throwing error, which would rollback, we explicitly ignore this change
            // Or, throw an error that the client can catch and display
             throw new Error('Cannot remove admin status from the last admin.');
          }
        }
        userDataToUpdate.isAdmin = isAdmin;
      }


      if (Object.keys(userDataToUpdate).length > 0) {
        return tx.user.update({
          where: { id: userId },
          data: userDataToUpdate,
          include: { roles: true }, // Return updated roles
        });
      }
      // If only roles were updated, fetch the user again to include roles
      return tx.user.findUnique({
          where: { id: userId },
          include: { roles: true },
      });
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating user:', error);
     if (error.message === 'Cannot remove admin status from the last admin.') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE handler to remove a user
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { userId } = context.params;

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can delete users.' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json({ error: 'Admins cannot delete their own account.' }, { status: 400 });
    }
    
    // Additional check: Prevent deletion of the last admin if you want to be extra careful
    // This is often a business rule. The self-deletion check above is more common.
    // if (targetUser.isAdmin) {
    //   const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    //   if (adminCount === 1) {
    //     return NextResponse.json({ error: 'Cannot delete the last admin account.' }, { status: 400 });
    //   }
    // }

    await prisma.user.delete({
      where: { id: userId },
    });
    // UserRole entries are deleted by onDelete: Cascade
    // Invitation inviterId/invitedUserId are set to null by onDelete: SetNull

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET handler to fetch a single user
export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser(request);
    const { userId } = context.params;

    if (!currentUser) { // User must be logged in
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    
    // Admin can fetch any user, or user can fetch their own details
    if (!currentUser.isAdmin && currentUser.id !== userId) {
        return NextResponse.json({ error: 'Forbidden. You can only fetch your own details or an admin must perform this action.' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            role: true,
            permissions: true,
          },
        },
        // Do not include password
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Exclude password from the response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 