import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { headers } from "next/headers";
import { Role, Permission, Invitation } from "@/generated/prisma";

export async function POST(req: Request) {
  let requestData;
  
  try {
    // Parse the request body once and store it
    requestData = await req.json();
    const { name, email, password, invitationToken, organizationName } = requestData;
    const headersList = headers();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // If no invitation token, organizationName is required
    if (!invitationToken && !organizationName) {
      return NextResponse.json(
        { message: "Organization name is required for new signups" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    let invitation: Invitation | null = null;
    let tenantId: string;

    if (invitationToken) {
      // If user is signing up with an invitation
      invitation = await prisma.invitation.findUnique({
        where: { token: invitationToken, status: "PENDING" },
      });

      if (!invitation || invitation.expiresAt < new Date()) {
        return NextResponse.json(
          { message: "Invalid or expired invitation token" },
          { status: 400 }
        );
      }

      tenantId = invitation.tenantId; // Use the tenant ID from the invitation
    } else {
      // Create a new tenant for the organization
      const tenant = await prisma.tenant.create({
        data: {
          name: organizationName,
        },
      });
      tenantId = tenant.id;
    }

    // Check if user already exists in this tenant
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        tenantId
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists in this organization" },
        { status: 400 }
      );
    }

    // Create user with tenant association
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: !invitationToken, // Admin if not invited (creating new tenant)
        tenant: {
          connect: {
            id: tenantId
          }
        },
        // If there's an invitation, connect the user to it
        ...(invitation && {
          receivedInvitation: {
            connect: { id: invitation.id },
          },
        }),
      },
    });

    // If the user was created from an invitation
    if (invitation) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", invitedUserId: user.id },
      });

      // Create UserRole based on invitation
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: invitation.role,
          permissions: invitation.permissions,
        }
      });
    } else {
      // If creating a new tenant, make user an admin with all permissions
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: Role.ADMIN,
          permissions: Object.values(Permission), // All permissions for tenant admin
        },
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
        organizationName: !invitationToken ? organizationName : undefined, // Only include for new signups
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
} 