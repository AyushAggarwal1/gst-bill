import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { renderBillHtml } from "@/lib/billHtml";

// Tell Next.js to always render this route dynamically
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { billIds } = await req.json();
    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json({ error: "No bill IDs provided" }, { status: 400 });
    }

    // Get the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id },
    });

    // Get bills with tenant isolation
    const billsDetails = await prisma.bill.findMany({
      where: {
        id: { in: billIds },
        tenantId: currentUser.tenantId,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        billNumber: "asc",
      }
    });

    if (billsDetails.length === 0) {
      return NextResponse.json({ error: "No matching bills found in your organization" }, { status: 404 });
    }

    const billHtmls = await Promise.all(billsDetails.map(bill => renderBillHtml(bill, profile)));

    return NextResponse.json({ htmls: billHtmls, companyName: profile?.firmName || 'Invoices' }, { status: 200 });

  } catch (error) {
    console.error("Error fetching bulk bill HTMLs:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "Failed to fetch bill HTMLs.", details: errorMessage }, { status: 500 });
  }
}
