import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Tell Next.js to always render this route dynamically
export const dynamic = 'force-dynamic';

// Generate the next bill number
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the latest bill for this tenant
    const latestBill = await prisma.bill.findFirst({
      where: {
        tenantId: currentUser.tenantId,
      },
      orderBy: {
        billNumber: "desc",
      },
    });

    let nextBillNumber = "0001";

    if (latestBill) {
      // Extract number from the bill number (assuming format like B0001)
      const latestNumber = parseInt(latestBill.billNumber.replace(/\D/g, ""));
      const nextNumber = latestNumber + 1;
      
      // Format with leading zeros
      nextBillNumber = `${String(nextNumber).padStart(4, "0")}`;
    }

    return NextResponse.json({
      billNumber: nextBillNumber,
    });
  } catch (error) {
    console.error("Error generating bill number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 