import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

function publicUrlFor(req: Request, token: string): string {
  const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  return `${origin.replace(/\/+$/, "")}/i/${token}`;
}

// POST: create (or return the existing) public share link for a bill
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bill = await prisma.bill.findFirst({
      where: { id, tenantId: currentUser.tenantId },
      select: { id: true, publicToken: true },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found in your organization" }, { status: 404 });
    }

    let token = bill.publicToken;
    if (!token) {
      token = randomBytes(24).toString("base64url");
      await prisma.bill.update({
        where: { id: bill.id },
        data: { publicToken: token },
      });
    }

    return NextResponse.json({ token, url: publicUrlFor(req, token) });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: revoke the public share link
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bill = await prisma.bill.findFirst({
      where: { id, tenantId: currentUser.tenantId },
      select: { id: true },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found in your organization" }, { status: 404 });
    }

    await prisma.bill.update({
      where: { id: bill.id },
      data: { publicToken: null },
    });

    return NextResponse.json({ message: "Share link revoked" });
  } catch (error) {
    console.error("Error revoking share link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
