import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET all bills for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the where clause for date filtering
    const whereClause: any = {
      userId: user.id,
    };

    if (startDate || endDate) {
      whereClause.billDate = {};
      if (startDate) {
        whereClause.billDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Set the end date to the end of the day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.billDate.lte = endDateTime;
      }
    }

    // Get all bills for this user with customer details
    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            gstNo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to create a new bill
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      billNumber,
      billDate,
      customerId,
      items,
      isIGST,
      deliveryAddress
    } = await req.json();

    // Validate required fields
    if (!billNumber || !customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Check if bill number is unique for this user
    const existingBill = await prisma.bill.findFirst({
      where: {
        billNumber,
        userId: user.id,
      },
    });

    if (existingBill) {
      return NextResponse.json(
        { error: "Bill number already exists" },
        { status: 400 }
      );
    }

    // Calculate tax amounts and totals
    let subtotal = 0;
    let totalTax = 0;

    // First, fetch all items to get their tax rates
    const itemIds = items.map((item: any) => item.itemId);
    const itemsData = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });

    // Create item objects with calculations
    const itemsWithCalculations = items.map((item: any) => {
      const itemData = itemsData.find((i) => i.id === item.itemId);
      if (!itemData) {
        throw new Error(`Item not found: ${item.itemId}`);
      }

      const quantity = parseInt(item.quantity);
      const price = parseFloat(item.price);
      const amount = quantity * price;
      const taxRate = itemData.taxRate;
      const taxAmount = (amount * taxRate) / 100;

      subtotal += amount;
      totalTax += taxAmount;

      return {
        itemId: item.itemId,
        quantity,
        price,
        taxAmount,
        amount,
      };
    });

    // Calculate CGST/SGST or IGST
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIGST) {
      igst = totalTax;
    } else {
      cgst = totalTax / 2;
      sgst = totalTax / 2;
    }

    const total = subtotal + totalTax;

    // Create the bill with its items in a transaction
    const bill = await prisma.$transaction(async (tx) => {
      // Create the bill
      const newBill = await tx.bill.create({
        data: {
          billNumber,
          billDate: billDate ? new Date(billDate) : new Date(),
          customerId,
          userId: user.id,
          isIGST: isIGST || false,
          subtotal,
          cgst,
          sgst,
          igst,
          total,
          deliveryAddress: deliveryAddress || null,
          items: {
            create: itemsWithCalculations,
          },
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

      return newBill;
    });

    return NextResponse.json(
      { message: "Bill created successfully", bill },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 