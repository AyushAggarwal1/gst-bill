import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        firmName: true,
        address: true,
        gstNo: true,
        bankName: true,
        accountNo: true,
        ifscCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firmName, address, gstNo, bankName, accountNo, ifscCode } = await req.json();

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firmName,
        address,
        gstNo,
        bankName,
        accountNo,
        ifscCode,
      },
      select: {
        id: true,
        name: true,
        email: true,
        firmName: true,
        address: true,
        gstNo: true,
        bankName: true,
        accountNo: true,
        ifscCode: true,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 