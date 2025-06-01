import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a specific item
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.item.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found in your organization" }, { status: 404 });
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
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, hsnCode, taxRate } = await req.json();

    // Validate input
    if (!name || !hsnCode || taxRate === undefined) {
      return NextResponse.json(
        { error: "Name, HSN code, and tax rate are required" },
        { status: 400 }
      );
    }

    // Validate tax rate
    if (taxRate < 0 || taxRate > 100) {
      return NextResponse.json(
        { error: "Tax rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Find the item
    const existingItem = await prisma.item.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found in your organization" }, { status: 404 });
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: {
        id,
      },
      data: {
        name,
        hsnCode,
        taxRate,
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
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the item
    const item = await prisma.item.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found in your organization" }, { status: 404 });
    }

    // Check if this item is referenced in any bills
    const billItemCount = await prisma.billItem.count({
      where: {
        itemId: id,
        bill: {
          tenantId: currentUser.tenantId,
        },
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