import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch user profile
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profile) {
      return NextResponse.json({
        firmName: "",
        address: "",
        gstNo: "",
        phoneNo: "",
        bankDetails: "",
      });
    }

    return NextResponse.json({
      firmName: user.profile.firmName,
      address: user.profile.address,
      gstNo: user.profile.gstNo,
      phoneNo: user.profile.phoneNo || "",
      bankDetails: user.profile.bankDetails || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Update or create user profile
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firmName, address, gstNo, phoneNo, bankDetails } = await req.json();

    // Validate input
    if (!firmName || !address || !gstNo) {
      return NextResponse.json(
        { error: "Firm name, address, and GST number are required" },
        { status: 400 }
      );
    }

    // Validate GST Number format (simple regex)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNo)) {
      return NextResponse.json(
        { error: "Invalid GST Number format" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        firmName,
        address,
        gstNo,

        phoneNo: phoneNo || null,

        bankDetails: bankDetails || null,
      },
      create: {
        firmName,
        address,
        gstNo,
        phoneNo: phoneNo || null,
        bankDetails: bankDetails || null,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 