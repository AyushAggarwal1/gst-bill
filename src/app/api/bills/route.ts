import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      invoiceNo, 
      date, 
      customerId, 
      items, 
      totalAmount, 
      totalTax, 
      grandTotal 
    } = await req.json();

    // Create bill transaction
    const bill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the bill
      const newBill = await tx.bill.create({
        data: {
          invoiceNo,
          date: new Date(date),
          customerId,
          userId: session.user.id,
          totalAmount: parseFloat(totalAmount),
          totalTax: parseFloat(totalTax),
          grandTotal: parseFloat(grandTotal),
        },
      });

      // Create the bill items
      for (const item of items) {
        await tx.billItem.create({
          data: {
            billId: newBill.id,
            itemId: item.itemId,
            quantity: parseInt(item.quantity),
            rate: parseFloat(item.rate),
            amount: parseFloat(item.amount),
            taxAmount: parseFloat(item.taxAmount),
            totalAmount: parseFloat(item.totalAmount),
          },
        });
      }

      return newBill;
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    console.error("Create bill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bills = await prisma.bill.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bills }, { status: 200 });
  } catch (error) {
    console.error("Get bills error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 