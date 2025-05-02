import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

interface RouteContext {
  params: { id: string }
}

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerAuthSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get params after awaiting the context
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error("Get item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerAuthSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get params after awaiting the context
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const { name, hsnCode, gstPercentage } = await req.json();

    const item = await prisma.item.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.item.update({
      where: {
        id,
      },
      data: {
        name,
        hsnCode,
        gstPercentage: parseFloat(gstPercentage),
      },
    });

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: RouteContext
) {
  try {
    const session = await getServerAuthSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get params after awaiting the context
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        billItems: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if item has associated billItems
    if (item.billItems.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete item that is used in bills. Please delete all bills containing this item first." 
      }, { status: 400 });
    }

    await prisma.item.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete item error:", error);
    
    // Check if this is a foreign key constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: "Cannot delete item that is used in bills. Please delete all bills containing this item first." 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 