import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import { resolveTemplatePath } from "@/lib/templatePath";

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { defaultTemplate } = await req.json();

    if (!defaultTemplate || typeof defaultTemplate !== 'string') {
      return NextResponse.json(
        { error: "defaultTemplate is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate the template name and that the file exists — also blocks a
    // traversal value (e.g. "../../.env") from being stored and later read.
    const templatePath = resolveTemplatePath(defaultTemplate);
    if (!templatePath || !fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: "Template file not found" },
        { status: 404 }
      );
    }

    // Check if user has a profile, create if not exists
    let profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id }
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete your profile setup first." },
        { status: 404 }
      );
    }

    // Update the default template
    const updatedProfile = await prisma.profile.update({
      where: { userId: currentUser.id },
      data: { defaultTemplate }
    });

    return NextResponse.json({
      message: "Default template updated successfully",
      defaultTemplate: updatedProfile.defaultTemplate
    });

  } catch (error) {
    console.error("Error updating default template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
