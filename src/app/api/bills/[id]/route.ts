import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET a specific bill
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the bill with all related data
    const bill = await prisma.bill.findUnique({
      where: {
        id,
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
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Check if this bill belongs to the current user
    if (bill.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    const id = params.id;
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the bill
    const bill = await prisma.bill.findUnique({
      where: {
        id,
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Check if this bill belongs to the current user
    if (bill.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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