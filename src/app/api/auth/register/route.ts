import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { headers } from "next/headers";
import { Role, Permission, Invitation } from "@/generated/prisma";
import { sendSignupOtpMail } from "@/lib/mailer";
import { generateNumericOtp } from "@/lib/utils";
import { hash } from "bcrypt";

// Legacy direct create kept for compatibility when OTP is not enforced.
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
      // Organization names must be unique — login resolves the tenant by name,
      // so a duplicate would make the second org's users unable to sign in.
      const existingTenant = await prisma.tenant.findFirst({
        where: { name: organizationName },
      });
      if (existingTenant) {
        return NextResponse.json(
          { message: "Organization name already exists" },
          { status: 409 }
        );
      }

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

// Step 1: request OTP for signup
export async function PUT(req: Request) {
  try {
    const { name, email, password, organizationName, invitationToken } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ message: "name, email and password are required" }, { status: 400 });
    }
    if (!invitationToken && !organizationName) {
      return NextResponse.json({ message: "Organization name is required for new signups" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOrg = invitationToken ? undefined : String(organizationName).trim();

    // If invited, verify invitation exists and is valid
    if (invitationToken) {
      const invitation = await prisma.invitation.findUnique({ where: { token: invitationToken, status: "PENDING" } });
      if (!invitation || invitation.expiresAt < new Date()) {
        return NextResponse.json({ message: "Invalid or expired invitation token" }, { status: 400 });
      }
    }

    // If not invited, ensure organization name not taken
    if (!invitationToken && normalizedOrg) {
      const existingTenant = await prisma.tenant.findFirst({ where: { name: normalizedOrg } });
      // Allow same org name? For safety, require unique org names
      if (existingTenant) {
        // still allow signup; user will become admin in this tenant? To avoid cross-tenant collision, block
        return NextResponse.json({ message: "Organization name already exists" }, { status: 409 });
      }
    }

    // Block if user already exists under any tenant resolution after verify step would fail; do a soft check here by email across all tenants only if invited is unknown
    const anyExisting = await prisma.user.findFirst({ where: { email: normalizedEmail } });
    if (anyExisting) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    const otp = generateNumericOtp(6);
    const otpHash = await hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await hashPassword(password);

    // Upsert by email so resending replaces previous attempts
    await prisma.signupVerification.upsert({
      where: { email: normalizedEmail },
      update: {
        name,
        hashedPassword,
        organizationName: normalizedOrg,
        invitationToken: invitationToken || null,
        otpHash,
        expiresAt,
        usedAt: null,
      },
      create: {
        email: normalizedEmail,
        name,
        hashedPassword,
        organizationName: normalizedOrg,
        invitationToken: invitationToken || null,
        otpHash,
        expiresAt,
      },
    });

    await sendSignupOtpMail(normalizedEmail, otp);
    return NextResponse.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("register request-otp error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Step 2: verify OTP and create account
export async function PATCH(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ message: "email and otp are required" }, { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const attempt = await prisma.signupVerification.findFirst({
      where: { email: normalizedEmail, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!attempt) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    // Cap brute-force: invalidate the code after too many wrong guesses
    const MAX_OTP_ATTEMPTS = 5;
    if (attempt.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.signupVerification.update({
        where: { id: attempt.id },
        data: { usedAt: new Date() },
      });
      return NextResponse.json(
        { message: "Too many incorrect attempts. Please request a new code." },
        { status: 429 }
      );
    }

    const isValid = await (await import("bcrypt")).compare(otp, attempt.otpHash);
    if (!isValid) {
      await prisma.signupVerification.update({
        where: { id: attempt.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    let tenantId: string;
    let invitation: Invitation | null = null;

    if (attempt.invitationToken) {
      invitation = await prisma.invitation.findUnique({ where: { token: attempt.invitationToken, status: "PENDING" } });
      if (!invitation || invitation.expiresAt < new Date()) {
        return NextResponse.json({ message: "Invalid or expired invitation token" }, { status: 400 });
      }
      tenantId = invitation.tenantId;
    } else {
      const tenant = await prisma.tenant.create({ data: { name: attempt.organizationName as string } });
      tenantId = tenant.id;
    }

    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail, tenantId } });
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists in this organization" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: attempt.name,
        email: normalizedEmail,
        password: attempt.hashedPassword,
        isAdmin: !attempt.invitationToken,
        tenant: { connect: { id: tenantId } },
        ...(invitation && { receivedInvitation: { connect: { id: invitation.id } } }),
      },
    });

    if (invitation) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED", invitedUserId: user.id } });
      await prisma.userRole.create({ data: { userId: user.id, role: invitation.role, permissions: invitation.permissions } });
    } else {
      await prisma.userRole.create({ data: { userId: user.id, role: Role.ADMIN, permissions: Object.values(Permission) } });
    }

    await prisma.signupVerification.update({ where: { email: normalizedEmail }, data: { usedAt: new Date() } });

    const { password: _, ...userWithoutPassword } = user as any;
    return NextResponse.json({ message: "Account created", user: userWithoutPassword });
  } catch (error) {
    console.error("register verify error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}