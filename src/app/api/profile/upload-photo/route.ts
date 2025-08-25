import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${currentUser.id}_${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update profile with photo path
    const photoUrl = `/uploads/profiles/${fileName}`;
    
    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: currentUser.id,
      },
      update: {
        profilePhoto: photoUrl,
      },
      create: {
        profilePhoto: photoUrl,
        firmName: "Your Company Name", // Default values
        address: "Your Address",
        gstNo: "Your GST Number",
        userId: currentUser.id,
      },
    });

    return NextResponse.json({
      message: "Profile photo uploaded successfully",
      photoUrl,
      profile: updatedProfile,
    });

  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
