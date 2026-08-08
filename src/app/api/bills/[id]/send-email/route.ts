import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendInvoiceMail } from "@/lib/mailer";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST: email the public invoice link to the bill's customer
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bill = await prisma.bill.findFirst({
      where: { id, tenantId: currentUser.tenantId },
      include: { customer: true },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found in your organization" }, { status: 404 });
    }

    if (!bill.customer.email) {
      return NextResponse.json(
        { error: "This customer has no email address. Add one on the customer's page first." },
        { status: 400 }
      );
    }

    // Reuse the existing public link, or mint one
    let token = bill.publicToken;
    if (!token) {
      token = randomBytes(24).toString("base64url");
      await prisma.bill.update({ where: { id: bill.id }, data: { publicToken: token } });
    }

    const profile = await prisma.profile.findUnique({ where: { userId: currentUser.id } });
    const origin = (process.env.NEXTAUTH_URL || new URL(req.url).origin).replace(/\/+$/, "");

    await sendInvoiceMail(bill.customer.email, {
      firmName: profile?.firmName || "Your supplier",
      billNumber: bill.billNumber,
      total: bill.total,
      url: `${origin}/i/${token}`,
    });

    return NextResponse.json({ message: `Invoice emailed to ${bill.customer.email}` });
  } catch (error) {
    console.error("Error emailing invoice:", error);
    return NextResponse.json(
      { error: "Failed to send the email. Check your SMTP settings and try again." },
      { status: 500 }
    );
  }
}
