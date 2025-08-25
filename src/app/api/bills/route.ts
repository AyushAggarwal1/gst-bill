import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET all bills for the current user
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const customerName = url.searchParams.get("customerName");
    const billNumber = url.searchParams.get("billNumber");
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Build the where clause for filtering
    const whereClause: any = {
      tenantId: currentUser.tenantId,
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

    // Add customer name filter
    if (customerName && customerName.trim() !== "") {
      whereClause.customer = {
        name: {
          contains: customerName.trim(),
          mode: 'insensitive'
        }
      };
    }

    // Add bill number filter
    if (billNumber && billNumber.trim() !== "") {
      whereClause.billNumber = {
        contains: billNumber.trim(),
        mode: 'insensitive'
      };
    }

    // Build query options
    const queryOptions: any = {
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
    };

    // Add limit if specified
    if (limit && limit > 0) {
      queryOptions.take = limit;
    }

    // Get bills for this tenant with customer details
    const bills = await prisma.bill.findMany(queryOptions);

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
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
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

    // Check if bill number is unique for this tenant
    const existingBill = await prisma.bill.findFirst({
      where: {
        billNumber,
        tenantId: currentUser.tenantId,
      },
    });

    if (existingBill) {
      return NextResponse.json(
        { error: "Bill number already exists in your organization" },
        { status: 400 }
      );
    }

    // Verify customer belongs to the same tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found in your organization" },
        { status: 404 }
      );
    }

    // Calculate tax amounts and totals
    let subtotal = 0;
    let totalTax = 0;

    // First, fetch all items to get their tax rates (only from this tenant)
    const itemIds = items.map((item: any) => item.itemId);
    const itemsData = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
        tenantId: currentUser.tenantId,
      },
    });

    // Verify all items exist and belong to this tenant
    if (itemsData.length !== itemIds.length) {
      return NextResponse.json(
        { error: "One or more items not found in your organization" },
        { status: 404 }
      );
    }

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
          userId: currentUser.id,
          tenantId: currentUser.tenantId,
          isIGST: isIGST || false,
          subtotal,
          cgst,
          sgst,
          igst,
          total,
          deliveryAddress,
          items: {
            create: itemsWithCalculations,
          },
        },
      });

      return newBill;
    }, {
      timeout: 10000, // 10 seconds timeout for this specific transaction
    });

    // Fetch the complete bill data after transaction
    const completeBill = await prisma.bill.findUnique({
      where: { id: bill.id },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Bill created successfully", bill: completeBill },
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