import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET a specific customer
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found in your organization" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update a customer
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Validate GST Number format
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

    // Find the customer
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found in your organization" }, { status: 404 });
    }

    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        deliveryAddress: deliveryAddress || null,
        gstNo,
        phone: phone || null,
        email: email || null,
      },
    });

    return NextResponse.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a customer
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the customer
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found in your organization" }, { status: 404 });
    }

    // Check if this customer has any associated bills
    const billCount = await prisma.bill.count({
      where: {
        customerId: id,
        tenantId: currentUser.tenantId,
      },
    });

    if (billCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete customer because they have associated bills. Delete the bills first.",
        },
        { status: 400 }
      );
    }

    // Delete the customer
    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 