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
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        bills: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Get customer error:", error);
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
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const { name, address, gstNo } = await req.json();

    const customer = await prisma.customer.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        gstNo,
      },
    });

    return NextResponse.json({ customer: updatedCustomer }, { status: 200 });
  } catch (error) {
    console.error("Update customer error:", error);
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
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        bills: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if customer has associated bills
    if (customer.bills.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete customer with existing bills. Please delete all bills for this customer first." 
      }, { status: 400 });
    }

    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete customer error:", error);
    
    // Check if this is a foreign key constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: "Cannot delete customer with existing bills. Please delete all bills for this customer first." 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 