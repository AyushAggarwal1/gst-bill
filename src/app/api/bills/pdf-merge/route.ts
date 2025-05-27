import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import jsPDF from "jspdf";

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function convertHundreds(n: number): string {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  }

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousandsValue = Math.floor((num % 100000) / 1000);
  const hundreds = num % 1000;

  let result = '';
  
  if (crores > 0) {
    result += convertHundreds(crores) + 'Crore ';
  }
  
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + 'Lakh ';
  }
  
  if (thousandsValue > 0) {
    result += convertHundreds(thousandsValue) + 'Thousand ';
  }
  
  if (hundreds > 0) {
    result += convertHundreds(hundreds);
  }

  return result.trim() + ' Only';
}

// Generate HTML content for a single bill using billFormat.html template
function generateBillHTML(bill: any, profile: any): string {
  try {
    // Read the billFormat.html template
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'billFormat.html');
    // console.log(templatePath);
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Get tax rate safely
    const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;

    // Generate items table HTML
    const itemsTableHTML = bill?.items.map((item: any, index: number) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.item.name}</td>
        <td>${item.item.hsnCode}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">₹${item.price.toFixed(2)}</td>
        <td class="text-right">₹${item.amount.toFixed(2)}</td>
        <td class="text-center">${item.item.taxRate}%</td>
        <td class="text-right">₹${item.taxAmount.toFixed(2)}</td>
      </tr>
    `).join('') || '';
    
    // Generate tax rows HTML
    const taxRowsHTML = bill?.isIGST ? `
      <tr>
        <td>IGST (${taxRate}%):</td>
        <td>₹${bill?.igst.toFixed(2) || '0.00'}</td>
      </tr>
    ` : `
      <tr>
        <td>CGST (${taxRate / 2}%):</td>
        <td>₹${bill?.cgst.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td>SGST (${taxRate / 2}%):</td>
        <td>₹${bill?.sgst.toFixed(2) || '0.00'}</td>
      </tr>
    `;

    // Generate bank details HTML
    const bankDetailsHTML = profile?.bankDetails ? `
      <div class="bank-details">
        <h3>Bank Details</h3>
        <p>${(profile.bankDetails || '').replace(/\n/g, '<br>')}</p>
      </div>
    ` : '';

    // Generate delivery address HTML
    const deliveryAddressHTML = bill?.deliveryAddress ? `
      <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
        <p style="font-weight: 600;">Delivery Address:</p>
        <p>${(bill.deliveryAddress).replace(/\n/g, '<br>')}</p>
      </div>
    ` : '';

    // Generate company phone HTML
    const companyPhoneHTML = profile?.phoneNo ? `<p>Phone: ${profile.phoneNo}</p>` : '';

    // Replace placeholders in the template
    htmlTemplate = htmlTemplate
      .replace(/{{BILL_NUMBER}}/g, bill?.billNumber || '')
      .replace(/{{BILL_DATE}}/g, format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy"))
      .replace(/{{TAX_TYPE}}/g, bill?.isIGST ? "IGST" : "CGST/SGST")
      .replace(/{{COMPANY_NAME}}/g, profile?.firmName || '')
      .replace(/{{COMPANY_ADDRESS}}/g, (profile?.address || '').replace(/\n/g, '<br>'))
      .replace(/{{COMPANY_GST}}/g, profile?.gstNo || '')
      .replace(/{{COMPANY_PHONE}}/g, companyPhoneHTML)
      .replace(/{{CUSTOMER_NAME}}/g, bill?.customer.name || '')
      .replace(/{{CUSTOMER_ADDRESS}}/g, (bill?.customer.address || '').replace(/\n/g, '<br>'))
      .replace(/{{CUSTOMER_GST}}/g, bill?.customer.gstNo || '')
      .replace(/{{DELIVERY_ADDRESS}}/g, deliveryAddressHTML)
      .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
      .replace(/{{SUBTOTAL}}/g, bill?.subtotal.toFixed(2) || '0.00')
      .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
      .replace(/{{TOTAL}}/g, bill?.total.toFixed(2) || '0.00')
      .replace(/{{AMOUNT_IN_WORDS}}/g, numberToWords(bill?.total || 0))
      .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);
    
    return htmlTemplate;
  } catch (error) {
    console.error('Error generating bill HTML:', error);
    throw error;
  }
}

// Generate consolidated HTML for all bills using the billFormat.html template
function generateConsolidatedHTML(bills: any[], profile: any): string {
  try {
    // Read the billFormat.html template
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'billFormat.html');
    // console.log(templatePath);
    let baseTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Modify the template to support multiple bills with page breaks
    // First, extract the CSS and HTML structure
    const cssMatch = baseTemplate.match(/<style>([\s\S]*?)<\/style>/);
    const css = cssMatch ? cssMatch[1] : '';
    
    // Add page break CSS for multiple bills
    const enhancedCSS = css + `
    .invoice-container {
      page-break-after: always;
    }
    
    .invoice-container:last-child {
      page-break-after: auto;
    }`;
    
    // Start building consolidated HTML
    let consolidatedHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Consolidated Bills</title>
  <meta charset="UTF-8">
  <style>
    ${enhancedCSS}
  </style>
</head>
<body>`;

    // Loop through each bill and generate HTML using the template
    bills.forEach((bill, index) => {
      // Generate individual bill HTML using the existing function
      const billHTML = generateBillHTML(bill, profile);
      
      // Extract just the body content (everything inside <body> tags)
      const bodyMatch = billHTML.match(/<body>([\s\S]*?)<\/body>/);
      if (bodyMatch) {
        consolidatedHTML += bodyMatch[1];
      }
    });

    consolidatedHTML += `
</body>
</html>`;

    return consolidatedHTML;
  } catch (error) {
    console.error('Error generating consolidated HTML:', error);
    throw error;
  }
}

// Convert HTML to PDF using Puppeteer
async function convertHTMLToPDF(htmlContent: string, bills: any[], profile: any): Promise<Buffer> {
  try {
    const puppeteer = await import('puppeteer');
    console.log(htmlContent);
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
    });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    
    // Fallback to simplified PDF generation if main method fails
    console.log('Falling back to simplified PDF generation...');
    return generateSimplifiedPDF(bills, profile);
  }
}

// Fallback function for simplified PDF generation
function generateSimplifiedPDF(bills: any[], profile: any): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set default font
  doc.setFont('helvetica');
  
  let yPosition = 25;
  const pageWidth = 210; // A4 width in mm
  const margin = 20;
  
  // Loop through each bill and add to PDF
  bills.forEach((bill, billIndex) => {
    if (billIndex > 0) {
      doc.addPage();
    }
    
    yPosition = 25; // Reset position for each page
    
    // Header - TAX INVOICE (centered, bold, large)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Invoice details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${bill?.billNumber || ''}`, margin, yPosition);
    doc.text(`Date: ${format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy")}`, pageWidth - margin - 40, yPosition);
    yPosition += 10;
    
    doc.text(`Tax Type: ${bill?.isIGST ? "IGST" : "CGST/SGST"}`, margin, yPosition);
    yPosition += 15;
    
    // Company Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Company Details', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(profile?.firmName || '', margin, yPosition);
    yPosition += 5;
    
    // Split and display company address
    const companyAddress = (profile?.address || '').split('\n');
    companyAddress.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    
    doc.text(`GSTIN: ${profile?.gstNo || ''}`, margin, yPosition);
    yPosition += 4;
    if (profile?.phoneNo) {
      doc.text(`Phone: ${profile.phoneNo}`, margin, yPosition);
      yPosition += 4;
    }
    yPosition += 10;
    
    // Customer Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(bill?.customer.name || '', margin, yPosition);
    yPosition += 5;
    
    // Split and display customer address
    const customerAddress = (bill?.customer.address || '').split('\n');
    customerAddress.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    
    doc.text(`GSTIN: ${bill?.customer.gstNo || ''}`, margin, yPosition);
    yPosition += 4;
    
    // Delivery address if exists
    if (bill?.deliveryAddress) {
      yPosition += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery Address:', margin, yPosition);
      yPosition += 4;
      
      doc.setFont('helvetica', 'normal');
      const deliveryAddress = bill.deliveryAddress.split('\n');
      deliveryAddress.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });
    }
    yPosition += 10;
    
    // Items section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Items', margin, yPosition);
    yPosition += 8;
    
    // Items table (simplified)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('S.No.', margin, yPosition);
    doc.text('Item', margin + 15, yPosition);
    doc.text('HSN', margin + 60, yPosition);
    doc.text('Qty', margin + 80, yPosition);
    doc.text('Price', margin + 100, yPosition);
    doc.text('Amount', margin + 125, yPosition);
    doc.text('Tax%', margin + 150, yPosition);
    doc.text('Tax Amt', margin + 170, yPosition);
    yPosition += 6;
    
    // Draw line
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;
    
    // Items data
    doc.setFont('helvetica', 'normal');
    bill?.items?.forEach((item: any, index: number) => {
      doc.text((index + 1).toString(), margin, yPosition);
      doc.text(item.item.name.substring(0, 25), margin + 15, yPosition); // Truncate long names
      doc.text(item.item.hsnCode, margin + 60, yPosition);
      doc.text(item.quantity.toString(), margin + 80, yPosition);
      doc.text(`₹${item.price.toFixed(2)}`, margin + 100, yPosition);
      doc.text(`₹${item.amount.toFixed(2)}`, margin + 125, yPosition);
      doc.text(`${item.item.taxRate}%`, margin + 150, yPosition);
      doc.text(`₹${item.taxAmount.toFixed(2)}`, margin + 170, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
    
    // Summary section
    doc.setFont('helvetica', 'normal');
    const summaryX = pageWidth - margin - 60;
    
    doc.text('Subtotal:', summaryX, yPosition);
    doc.text(`₹${bill?.subtotal.toFixed(2) || '0.00'}`, summaryX + 30, yPosition);
    yPosition += 5;
    
    // Tax rows
    const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;
    if (bill?.isIGST) {
      doc.text(`IGST (${taxRate}%):`, summaryX, yPosition);
      doc.text(`₹${bill?.igst.toFixed(2) || '0.00'}`, summaryX + 30, yPosition);
      yPosition += 5;
    } else {
      doc.text(`CGST (${taxRate / 2}%):`, summaryX, yPosition);
      doc.text(`₹${bill?.cgst.toFixed(2) || '0.00'}`, summaryX + 30, yPosition);
      yPosition += 5;
      doc.text(`SGST (${taxRate / 2}%):`, summaryX, yPosition);
      doc.text(`₹${bill?.sgst.toFixed(2) || '0.00'}`, summaryX + 30, yPosition);
      yPosition += 5;
    }
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', summaryX, yPosition);
    doc.text(`₹${bill?.total.toFixed(2) || '0.00'}`, summaryX + 30, yPosition);
    yPosition += 10;
    
    // Amount in words
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount in words: ${numberToWords(bill?.total || 0)}`, margin, yPosition);
    yPosition += 10;
    
    // Bank details
    if (profile?.bankDetails) {
      doc.setFont('helvetica', 'bold');
      doc.text('Bank Details:', margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      const bankDetails = profile.bankDetails.split('\n');
      bankDetails.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text('This is a system generated invoice', pageWidth / 2, 280, { align: 'center' });
  });
  
  return Buffer.from(doc.output('arraybuffer'));
}

// POST to generate consolidated PDF for selected bills
export async function POST(req: Request) {
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the bill IDs from the request body
    const { billIds } = await req.json();

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json(
        { error: "No bills selected for PDF generation" },
        { status: 400 }
      );
    }

    // Get the bills with all related data
    const bills = await prisma.bill.findMany({
      where: {
        id: {
          in: billIds,
        },
        userId: user.id, // Ensure bills belong to the current user
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        billDate: "asc", // Sort by bill date for consistent ordering
      },
    });

    if (bills.length === 0) {
      return NextResponse.json(
        { error: "No valid bills found for PDF generation" },
        { status: 404 }
      );
    }

    // Get profile data
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    // Generate consolidated HTML for all bills
    const consolidatedHTML = generateConsolidatedHTML(bills, profile);
    
    // Convert HTML to PDF (pass bills and profile for programmatic generation)
    const pdfBuffer = await convertHTMLToPDF(consolidatedHTML, bills, profile);

    // Generate filename with date range
    const firstBillDate = format(new Date(bills[0].billDate), "dd-MM-yyyy");
    const lastBillDate = format(new Date(bills[bills.length - 1].billDate), "dd-MM-yyyy");
    const filename = bills.length === 1 
      ? `Invoice_${bills[0].billNumber}.pdf`
      : `Consolidated_Bills_${firstBillDate}_to_${lastBillDate}_${bills.length}bills.pdf`;

    // Return the consolidated PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error generating consolidated PDF:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: "Failed to create PDF. Please try again.",
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
} 