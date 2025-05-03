import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a specific item
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

    const item = await prisma.item.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if this item belongs to the current user
    if (item.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update an item
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, hsnCode, taxRate } = await req.json();

    // Validate input
    if (!name || !hsnCode || taxRate === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate tax rate is a number between 0 and 100
    const taxRateFloat = parseFloat(String(taxRate));
    if (isNaN(taxRateFloat) || taxRateFloat < 0 || taxRateFloat > 100) {
      return NextResponse.json(
        { error: "Tax rate must be a number between 0 and 100" },
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

    // Find the item
    const existingItem = await prisma.item.findUnique({
      where: {
        id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if this item belongs to the current user
    if (existingItem.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: {
        id,
      },
      data: {
        name,
        hsnCode,
        taxRate: taxRateFloat,
      },
    });

    return NextResponse.json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE an item
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

    // Find the item
    const item = await prisma.item.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if this item belongs to the current user
    if (item.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if this item is referenced in any bills
    const billItemCount = await prisma.billItem.count({
      where: {
        itemId: id,
      },
    });

    if (billItemCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete item because it is used in bills. Delete the bills first.",
        },
        { status: 400 }
      );
    }

    // Delete the item
    await prisma.item.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 