import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Get external templates index
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get('template');
    
    const externalTemplatesDir = path.join(process.cwd(), 'public', 'templates');
    const indexPath = path.join(externalTemplatesDir, 'index.json');
    
    // If no template specified, return the index
    if (!templateName) {
      if (!fs.existsSync(indexPath)) {
        return NextResponse.json({ 
          error: 'No external templates found. Run the fetch script first.' 
        }, { status: 404 });
      }
      
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const templates = JSON.parse(indexContent);
      
      return NextResponse.json({
        success: true,
        templates,
        count: templates.length
      });
    }
    
    // If template name specified, return the specific template
    const templatePath = path.join(externalTemplatesDir, templateName);
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ 
        error: `Template ${templateName} not found` 
      }, { status: 404 });
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Extract metadata
    const nameMatch = templateContent.match(/@template-name:\s*(.+)/);
    const descMatch = templateContent.match(/@template-description:\s*(.+)/);
    const categoryMatch = templateContent.match(/@template-category:\s*(.+)/);
    const authorMatch = templateContent.match(/@template-author:\s*(.+)/);
    const versionMatch = templateContent.match(/@template-version:\s*(.+)/);
    const sourceMatch = templateContent.match(/@template-source:\s*(.+)/);
    const importDateMatch = templateContent.match(/@template-import-date:\s*(.+)/);
    
    const metadata = {
      filename: templateName,
      name: nameMatch ? nameMatch[1].trim() : templateName.replace('.html', ''),
      description: descMatch ? descMatch[1].trim() : '',
      category: categoryMatch ? categoryMatch[1].trim() : 'External',
      author: authorMatch ? authorMatch[1].trim() : 'External',
      version: versionMatch ? versionMatch[1].trim() : '1.0',
      source: sourceMatch ? sourceMatch[1].trim() : '',
      importDate: importDateMatch ? importDateMatch[1].trim() : '',
    };
    
    return NextResponse.json({
      success: true,
      template: templateContent,
      metadata
    });
    
  } catch (error) {
    console.error('Error serving external template:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Update external templates (trigger fetch)
export async function POST(request: NextRequest) {
  try {
    const { fetchTemplatesFromRepo } = await import('../../../../../scripts/get_bill_html_templates/fetch-templates.js');
    
    // This would require the script to be properly set up
    // For now, return a message about manual fetching
    return NextResponse.json({
      success: true,
      message: 'External templates should be fetched using the script: node scripts/get_bill_html_templates/fetch-templates.js fetch'
    });
    
  } catch (error) {
    console.error('Error updating external templates:', error);
    return NextResponse.json({ 
      error: 'Failed to update external templates' 
    }, { status: 500 });
  }
}
