import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Tell Next.js to always render this route dynamically
export const dynamic = 'force-dynamic';

// GET: Fetch user profile
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user with their profile
    const user = await prisma.user.findFirst({
      where: {
        id: currentUser.id,
        tenantId: currentUser.tenantId,
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
        id: "",
        firmName: "",
        address: "",
        gstNo: "",
        phoneNo: "",
        bankDetails: "",
        profilePhoto: null,
        upiId: "",
        defaultTemplate: null,
      });
    }

    return NextResponse.json({
      id: user.profile.id,
      firmName: user.profile.firmName,
      address: user.profile.address,
      gstNo: user.profile.gstNo,
      phoneNo: user.profile.phoneNo || "",
      bankDetails: user.profile.bankDetails || "",
      profilePhoto: user.profile.profilePhoto,
      upiId: user.profile.upiId || "",
      defaultTemplate: user.profile.defaultTemplate,
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
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firmName, address, gstNo, phoneNo, bankDetails, profilePhoto, upiId } = await req.json();

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

    // Validate UPI ID (VPA) format when provided, e.g. shopname@okhdfcbank
    if (upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      return NextResponse.json(
        { error: "Invalid UPI ID format (expected something like name@bank)" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        id: currentUser.id,
        tenantId: currentUser.tenantId,
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
        profilePhoto: profilePhoto || null,
        upiId: upiId || null,
      },
      create: {
        firmName,
        address,
        gstNo,
        phoneNo: phoneNo || null,
        bankDetails: bankDetails || null,
        profilePhoto: profilePhoto || null,
        upiId: upiId || null,
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