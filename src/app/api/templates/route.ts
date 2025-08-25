import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from 'fs';
import path from 'path';

interface Template {
  id: string;
  name: string;
  filename: string;
  description: string;
  category?: string;
  author?: string;
  version?: string;
  createdAt?: string;
}

interface TemplateMetadata {
  name?: string;
  description?: string;
  category?: string;
  author?: string;
  version?: string;
}

/**
 * Extract metadata from HTML template file
 */
function extractTemplateMetadata(htmlContent: string, filename: string): TemplateMetadata {
  const metadata: TemplateMetadata = {};
  
  // Try to extract from HTML comments first (<!-- @template-name: Template Name -->)
  const commentMatches = {
    name: htmlContent.match(/<!--\s*@template-name:\s*(.+?)\s*-->/i),
    description: htmlContent.match(/<!--\s*@template-description:\s*(.+?)\s*-->/i),
    category: htmlContent.match(/<!--\s*@template-category:\s*(.+?)\s*-->/i),
    author: htmlContent.match(/<!--\s*@template-author:\s*(.+?)\s*-->/i),
    version: htmlContent.match(/<!--\s*@template-version:\s*(.+?)\s*-->/i)
  };
  
  // Extract from comments if available
  if (commentMatches.name) metadata.name = commentMatches.name[1].trim();
  if (commentMatches.description) metadata.description = commentMatches.description[1].trim();
  if (commentMatches.category) metadata.category = commentMatches.category[1].trim();
  if (commentMatches.author) metadata.author = commentMatches.author[1].trim();
  if (commentMatches.version) metadata.version = commentMatches.version[1].trim();
  
  // Try to extract from HTML title tag if name not found
  if (!metadata.name) {
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      // Extract just the template part from title like "{{COMPANY_NAME}} - Invoice #{{BILL_NUMBER}}"
      let title = titleMatch[1];
      if (title.includes(' - Invoice')) {
        title = title.split(' - Invoice')[0];
        if (title.includes('{{') && title.includes('}}')) {
          // If it's a template variable, use filename instead
          title = filename.replace('.html', '').replace(/([A-Z])/g, ' $1').trim();
          title = title.charAt(0).toUpperCase() + title.slice(1);
        }
      }
      metadata.name = title;
    }
  }
  
  // Fallback to filename-based naming
  if (!metadata.name) {
    metadata.name = filename
      .replace('.html', '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  // Default description if not provided
  if (!metadata.description) {
    metadata.description = `Professional invoice template - ${metadata.name}`;
  }
  
  return metadata;
}

/**
 * Dynamically scan and load all templates from the templates directory
 */
function getAvailableTemplates(): Template[] {
  const templatesDir = path.join(process.cwd(), 'public', 'templates');
  
  try {
    const files = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.html'))
      .sort(); // Sort alphabetically for consistent ordering
    
    const templates: Template[] = [];
    
    files.forEach((filename, index) => {
      try {
        const filePath = path.join(templatesDir, filename);
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const metadata = extractTemplateMetadata(htmlContent, filename);
        
        templates.push({
          id: (index + 1).toString(),
          name: metadata.name || filename.replace('.html', ''),
          filename,
          description: metadata.description || `Professional invoice template`,
          category: metadata.category,
          author: metadata.author,
          version: metadata.version,
          createdAt: fs.statSync(filePath).birthtime.toISOString()
        });
      } catch (error) {
        console.error(`Error processing template ${filename}:`, error);
        // Still include the template with basic info
        templates.push({
          id: (index + 1).toString(),
          name: filename.replace('.html', '').replace(/([A-Z])/g, ' $1').trim(),
          filename,
          description: `Professional invoice template`
        });
      }
    });
    
    return templates;
  } catch (error) {
    console.error('Error scanning templates directory:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamically get all available templates
    const availableTemplates = getAvailableTemplates();

    return NextResponse.json({
      templates: availableTemplates,
      count: availableTemplates.length
    });

  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, this endpoint provides information about adding templates
    // In the future, this could handle template uploads
    return NextResponse.json({
      message: "Template upload endpoint",
      documentation: {
        howToAdd: "Add HTML templates to /public/templates/ directory",
        requiredMetadata: [
          "@template-name: Template Name",
          "@template-description: Template description"
        ],
        optionalMetadata: [
          "@template-category: Category",
          "@template-author: Author Name",
          "@template-version: Version"
        ],
        autoDetection: "Templates are automatically detected and loaded"
      },
      currentTemplates: getAvailableTemplates().length
    });

  } catch (error) {
    console.error("Error in template POST endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
