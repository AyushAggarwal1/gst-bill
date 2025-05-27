import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import { format } from "date-fns";

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousandsArray = ['', 'Thousand', 'Lakh', 'Crore'];

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

// Generate HTML content for a bill
async function generateBillHTML(bill: any, profile: any): Promise<string> {
  try {
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
    
    // HTML template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${bill?.billNumber}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #333;
            line-height: 1.4;
            padding: 0;
            font-size: 11px;
            background-color: white;
          }
          
          .invoice-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border: 1px solid #eee;
          }
          
          .invoice-header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .invoice-header h1 {
            font-size: 20px;
            color: #000;
            margin: 0;
            font-weight: 700;
            padding-bottom: 15px;
          }
          
          .invoice-subheader {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 11px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          
          .info-item {
            margin-bottom: 3px;
          }
          
          .info-item .label {
            font-weight: 500;
            color: #555;
          }
          
          .info-item .value {
            font-weight: 500;
          }
          
          .parties-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            gap: 40px;
          }
          
          .party-info {
            flex: 1;
            font-size: 11px;
          }
          
          .party-info h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #000;
          }
          
          .party-info p {
            margin-bottom: 3px;
            line-height: 1.5;
          }
          
          .party-name {
            font-weight: 600;
          }
          
          .details-title {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #000;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 11px;
          }
          
          table thead th {
            background-color: #fff;
            color: #000;
            font-weight: 600;
            text-align: left;
            padding: 10px;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
          }
          
          table tbody tr {
            border-bottom: 1px solid #eee;
          }
          
          table tbody td {
            padding: 12px 10px;
            color: #333;
            vertical-align: middle;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .summary-section {
            margin-bottom: 25px;
            margin-top: 10px;
          }
          
          .summary-table {
            width: 250px;
            margin-left: auto;
            border-collapse: collapse;
          }
          
          .summary-table tr td {
            padding: 5px 0;
            text-align: right;
          }
          
          .summary-table tr td:first-child {
            text-align: left;
            padding-right: 15px;
          }
          
          .summary-table tr.total-row td {
            padding-top: 6px;
            font-weight: 600;
            color: #000;
            border-top: 1px solid #ddd;
          }
          
          .amount-in-words {
            margin: 0 0 25px 0;
            padding: 0 0 10px 0;
            font-size: 11px;
            line-height: 1.5;
            border-bottom: 1px solid #eee;
          }
          
          .bank-details {
            margin-top: 0;
            margin-bottom: 25px;
            font-size: 11px;
          }
          
          .bank-details h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #000;
          }
          
          .bank-details p {
            margin-bottom: 3px;
            line-height: 1.5;
          }
          
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>TAX INVOICE</h1>
          </div>
          
          <div class="invoice-subheader">
            <div>
              <div class="info-item">
                <span class="label">Invoice #:</span>
                <span class="value">${bill?.billNumber || ''}</span>
              </div>
              <div class="info-item">
                <span class="label">Date:</span>
                <span class="value">${format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy")}</span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="label">Tax Type:</span>
                <span class="value">${bill?.isIGST ? "IGST" : "CGST/SGST"}</span>
              </div>
            </div>
          </div>
          
          <div class="parties-container">
            <div class="party-info">
              <h3>Company Details</h3>
              <p class="party-name">${profile?.firmName || ''}</p>
              <p>${(profile?.address || '').replace(/\n/g, '<br>')}</p>
              <p>GSTIN: ${profile?.gstNo || ''}</p>
              ${profile?.phoneNo ? `<p>Phone: ${profile.phoneNo}</p>` : ''}
            </div>
            <div class="party-info">
              <h3>Customer Details</h3>
              <p class="party-name">${bill?.customer.name || ''}</p>
              <p>${(bill?.customer.address || '').replace(/\n/g, '<br>')}</p>
              <p>GSTIN: ${bill?.customer.gstNo || ''}</p>
              ${deliveryAddressHTML}
            </div>
          </div>
          
          <h3 class="details-title">Items</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">S.No.</th>
                <th style="width: 25%">Item</th>
                <th style="width: 10%">HSN</th>
                <th style="width: 8%; text-align: center;">Qty</th>
                <th style="width: 12%; text-align: right;">Price</th>
                <th style="width: 13%; text-align: right;">Amount</th>
                <th style="width: 10%; text-align: center;">Tax Rate</th>
                <th style="width: 15%; text-align: right;">Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableHTML}
            </tbody>
          </table>
          
          <div class="summary-section">
            <table class="summary-table">
              <tr>
                <td>Subtotal:</td>
                <td>₹${bill?.subtotal.toFixed(2) || '0.00'}</td>
              </tr>
              ${taxRowsHTML}
              <tr class="total-row">
                <td>Total:</td>
                <td>₹${bill?.total.toFixed(2) || '0.00'}</td>
              </tr>
            </table>
            
            <div class="amount-in-words">
              <strong>Amount in words:</strong> ${numberToWords(bill?.total || 0)}
            </div>
          </div>
          
          ${bankDetailsHTML}
          
          <div class="footer">
            <p>This is a system generated invoice</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return htmlTemplate;
  } catch (error) {
    console.error('Error generating bill HTML:', error);
    throw error;
  }
}

// POST to generate and merge PDFs for selected bills
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

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // Create a merged PDF document
      const mergedPdf = await PDFDocument.create();

      // Generate PDF for each bill
      for (const bill of bills) {
        const htmlContent = await generateBillHTML(bill, profile);
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
          format: 'A4',
          margin: {
            top: '15mm',
            right: '10mm',
            bottom: '15mm',
            left: '10mm',
          },
          printBackground: true,
        });

        await page.close();

        // Add this PDF to the merged document
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      await browser.close();

      // Generate the final merged PDF
      const mergedPdfBytes = await mergedPdf.save();

      // Generate filename with date range
      const firstBillDate = format(new Date(bills[0].billDate), "dd-MM-yyyy");
      const lastBillDate = format(new Date(bills[bills.length - 1].billDate), "dd-MM-yyyy");
      const filename = bills.length === 1 
        ? `Invoice_${bills[0].billNumber}.pdf`
        : `Bills_${firstBillDate}_to_${lastBillDate}_${bills.length}bills.pdf`;

      // Return the merged PDF
      return new NextResponse(mergedPdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });

    } catch (error) {
      await browser.close();
      throw error;
    }

  } catch (error) {
    console.error("Error generating merged PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 