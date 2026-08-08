import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET all customers for the current user
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Build query options
    const queryOptions: any = {
      where: {
        tenantId: currentUser.tenantId,
      },
      orderBy: {
        name: "asc",
      },
    };

    // Add limit if specified
    if (limit && limit > 0) {
      queryOptions.take = limit;
    }

    // Get customers for this user's tenant
    const customers = await prisma.customer.findMany(queryOptions);

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to create a new customer
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, address, deliveryAddress, gstNo, phone, email } = await req.json();

    // Validate input
    if (!name || !address || !gstNo) {
      return NextResponse.json(
        { error: "Name, address, and GST number are required" },
        { status: 400 }
      );
    }

    // Validate GST Number format (simple regex)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNo)) {
      return NextResponse.json(
        { error: "Invalid GST Number format" },
        { status: 400 }
      );
    }

    if (phone && !/^[0-9+\-() ]{7,18}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        name,
        address,
        deliveryAddress: deliveryAddress || null,
        gstNo,
        phone: phone || null,
        email: email || null,
        userId: currentUser.id,
        tenantId: currentUser.tenantId,
      },
    });

    return NextResponse.json(
      { message: "Customer created successfully", customer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 