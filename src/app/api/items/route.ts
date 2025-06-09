import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET all items
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

    const items = await prisma.item.findMany(queryOptions);

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
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, hsnCode, taxRate } = await req.json();

    // Validate input
    if (!name || !hsnCode || taxRate === undefined) {
      return NextResponse.json(
        { error: "Name, HSN code, and tax rate are required" },
        { status: 400 }
      );
    }

    // Create the item
    const item = await prisma.item.create({
      data: {
        name,
        description: description || null,
        hsnCode,
        taxRate,
        userId: currentUser.id,
        tenantId: currentUser.tenantId,
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