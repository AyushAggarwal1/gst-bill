import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get('template');
    
    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }
    
    let templatePath: string;
    
    // Check if it's a backup template
    if (templateName.startsWith('backup-templates/')) {
      // Remove the prefix and get the actual filename
      const actualFilename = templateName.replace('backup-templates/', '');
      templatePath = path.join(process.cwd(), 'public', 'backup-templates', actualFilename);
    } else {
      // Main template (from external repository)
      templatePath = path.join(process.cwd(), 'public', 'templates', templateName);
    }
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ 
        error: `Template ${templateName} not found` 
      }, { status: 404 });
    }
    
    // Read the template
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Remove metadata comments for cleaner output
    templateContent = templateContent.replace(/<!--\s*@template-[^>]*-->\s*/g, '');
    
    return new NextResponse(templateContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error serving template:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
