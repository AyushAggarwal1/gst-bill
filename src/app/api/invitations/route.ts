import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { Role, Permission } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    // Check if the current user is an admin or has INVITE_USERS permission
    const userWithRoles = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { roles: true }
    });

    const canInvite = userWithRoles?.isAdmin || userWithRoles?.roles.some(role => role.permissions.includes(Permission.INVITE_USERS));

    if (!canInvite) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to invite users" }, { status: 403 });
    }

    const { email, role, permissions } = await req.json() as { email: string; role: Role; permissions?: Permission[] };

    if (!email || !role) {
      return NextResponse.json({ message: "Email and role are required" }, { status: 400 });
    }

    // Validate role
    if (!Object.values(Role).includes(role)) {
        return NextResponse.json({ message: "Invalid role specified" }, { status: 400 });
    }

    // Validate permissions if provided
    if (permissions) {
        for (const p of permissions) {
            if (!Object.values(Permission).includes(p)) {
                return NextResponse.json({ message: `Invalid permission: ${p}` }, { status: 400 });
            }
        }
    }

    // Check if an active invitation already exists for this email in the same tenant
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        tenantId: currentUser.tenantId,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ message: "An active invitation already exists for this email in your organization" }, { status: 409 });
    }
    
    // Check if user already exists with this email in the same tenant
    const existingUser = await prisma.user.findFirst({ 
      where: { 
        email,
        tenantId: currentUser.tenantId
      }
    });
    
    if (existingUser) {
        return NextResponse.json({ message: "User with this email already exists in your organization" }, { status: 409 });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        permissions: permissions || [], // Default to empty array if not provided
        invitedById: currentUser.id,
        tenantId: currentUser.tenantId,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({ message: "Invitation sent successfully", invitation }, { status: 201 });
  } catch (error) {
    console.error("Invitation error:", error);
    if (error instanceof Error && error.message.includes("Invalid `prisma.invitation.create()`")) {
        return NextResponse.json({ message: "Failed to create invitation. Check data types and relations.", error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "An error occurred while sending the invitation" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    // Get all invitations for the current user's tenant
    const invitations = await prisma.invitation.findMany({
      where: { 
        tenantId: currentUser.tenantId
      },
      include: { 
        invitedBy: { 
          select: { 
            email: true, 
            name: true 
          }
        }, 
        invitedUser: { 
          select: { 
            email: true, 
            name: true
          }
        }
      }
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Get Invitations error:", error);
    return NextResponse.json({ message: "An error occurred while fetching invitations" }, { status: 500 });
  }
} 