import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
      return NextResponse.json({ error: "Bill ID is required" }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        customer: true,
        billItems: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ bill }, { status: 200 });
  } catch (error) {
    console.error("Get bill error:", error);
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
      return NextResponse.json({ error: "Bill ID is required" }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    await prisma.bill.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete bill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 