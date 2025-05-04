import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logAuthEvent } from "@/lib/logger";
import { headers } from "next/headers";

export async function POST(req: Request) {
  let requestData;
  
  try {
    // Parse the request body once and store it
    requestData = await req.json();
    const { name, email, password } = requestData;
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';

    // Validate input
    if (!email || !password) {
      await logAuthEvent({
        email,
        action: 'REGISTRATION',
        level: 'WARN',
        message: 'Registration failed - missing email or password',
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await logAuthEvent({
        email,
        action: 'REGISTRATION',
        level: 'WARN',
        message: 'Registration failed - email already exists',
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Log successful registration
    await logAuthEvent({
      email,
      action: 'REGISTRATION',
      level: 'INFO',
      message: 'User registered successfully',
      ipAddress,
      userAgent,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Log registration error
    try {
      const headersList = headers();
      // Use the already parsed request data instead of trying to clone the request
      const email = requestData?.email || 'unknown';
      
      await logAuthEvent({
        email,
        action: 'REGISTRATION',
        level: 'ERROR',
        message: `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress: headersList.get('x-forwarded-for') || 'unknown',
        userAgent: headersList.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.error("Failed to log registration error:", logError);
    }
    
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
} 