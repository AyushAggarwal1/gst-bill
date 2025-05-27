import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET all items for the current user
export async function GET() {
  try {
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

    // Get all items for this user
    const items = await prisma.item.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to create a new item
export async function POST(req: Request) {
  try {
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

    // Create the item
    const item = await prisma.item.create({
      data: {
        name,
        hsnCode,
        taxRate: taxRateFloat,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Item created successfully", item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 