import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a specific customer
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if this customer belongs to the current user
    if (customer.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    const id = params.id;
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, address, deliveryAddress, gstNo } = await req.json();

    // Validate input
    if (!name || !address || !deliveryAddress || !gstNo) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the customer
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if this customer belongs to the current user
    if (existingCustomer.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        deliveryAddress,
        gstNo,
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
    const id = params.id;
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the customer
    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if this customer belongs to the current user
    if (customer.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if this customer has any associated bills
    const billCount = await prisma.bill.count({
      where: {
        customerId: id,
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