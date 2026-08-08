import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { resolveTemplatePath } from '@/lib/templatePath';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get('template');

    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    // Guard against path traversal (e.g. ?template=../../.env)
    const templatePath = resolveTemplatePath(templateName);
    if (!templatePath || !fs.existsSync(templatePath)) {
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
