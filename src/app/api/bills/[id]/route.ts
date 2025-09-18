import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET a specific bill
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the bill with all related data
    const bill = await prisma.bill.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found in your organization" }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a bill
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the bill
    const bill = await prisma.bill.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found in your organization" }, { status: 404 });
    }

    // Delete the bill (bill items will be cascade deleted due to the relation)
    await prisma.bill.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 