import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Tell Next.js to always render this route dynamically
export const dynamic = 'force-dynamic';

// Generate the next bill number
export async function GET() {
  try {
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

    // Find the latest bill for this user
    const latestBill = await prisma.bill.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        billNumber: "desc",
      },
    });

    let nextBillNumber = "B0001";

    if (latestBill) {
      // Extract number from the bill number (assuming format like B0001)
      const latestNumber = parseInt(latestBill.billNumber.replace(/\D/g, ""));
      const nextNumber = latestNumber + 1;
      
      // Format with leading zeros
      nextBillNumber = `B${String(nextNumber).padStart(4, "0")}`;
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