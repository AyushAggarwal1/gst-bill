import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

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

    // Validate that the template file exists in an allowed directory
    const templatesRoot = path.join(process.cwd(), 'public', 'templates');
    const backupTemplatesRoot = path.join(process.cwd(), 'public', 'backup-templates');

    let templatePath: string;
    if (defaultTemplate.startsWith('backup-templates/')) {
      const relativePath = defaultTemplate.slice('backup-templates/'.length);
      templatePath = path.resolve(backupTemplatesRoot, relativePath);
      if (!templatePath.startsWith(backupTemplatesRoot + path.sep) && templatePath !== backupTemplatesRoot) {
        return NextResponse.json(
          { error: "Invalid template path" },
          { status: 400 }
        );
      }
    } else {
      templatePath = path.resolve(templatesRoot, defaultTemplate);
      if (!templatePath.startsWith(templatesRoot + path.sep) && templatePath !== templatesRoot) {
        return NextResponse.json(
          { error: "Invalid template path" },
          { status: 400 }
        );
      }
    }
    
    if (!fs.existsSync(templatePath)) {
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
