import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import fs from "fs";
import path from "path";

// Helper function to convert number to words (copied from pdf-merge/route.ts)
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
      return result.trim(); // trim here to avoid double space if ones[n] is empty
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result.trim();
  }

  let result = '';
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    result += convertHundreds(crores) + ' Crore ';
    num %= 10000000;
  }
  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + ' Lakh ';
    num %= 100000;
  }
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    result += convertHundreds(thousands) + ' Thousand ';
    num %= 1000;
  }
  if (num > 0) { // This is for the remaining hundreds part
    result += convertHundreds(num);
  }

  // Ensure result is trimmed and "Only" is appended correctly
  result = result.trim();
  if (result === '') return 'Zero Only'; // Handle if num was 0 initially or became 0
  return result + ' Only';
}

// Generate HTML content for a single bill (copied and adapted from pdf-merge/route.ts)
function generateBillHTML(bill: any, profile: any): string {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'billFormat.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    const taxRate = bill?.items && bill.items.length > 0 && bill.items[0].item ? bill.items[0].item.taxRate : 0;

    const itemsTableHTML = bill?.items.map((item: any, index: number) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.item.name}</td>
        <td>${item.item.hsnCode || ''}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">₹${item.price.toFixed(2)}</td>
        <td class="text-right">₹${item.amount.toFixed(2)}</td>
        <td class="text-center">${item.item.taxRate || 0}%</td>
        <td class="text-right">₹${item.taxAmount.toFixed(2)}</td>
      </tr>
    `).join('') || '';
    
    const taxRowsHTML = bill?.isIGST ? `
      <tr>
        <td>IGST (${taxRate}%):</td>
        <td>₹${bill?.igst?.toFixed(2) || '0.00'}</td>
      </tr>
    ` : `
      <tr>
        <td>CGST (${taxRate / 2}%):</td>
        <td>₹${bill?.cgst?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td>SGST (${taxRate / 2}%):</td>
        <td>₹${bill?.sgst?.toFixed(2) || '0.00'}</td>
      </tr>
    `;

    const bankDetailsHTML = profile?.bankDetails ? `
      <div class="bank-details">
        <h3>Bank Details</h3>
        <p>${(profile.bankDetails || '').replace(/\n/g, '<br>')}</p>
      </div>
    ` : '';

    const deliveryAddressHTML = bill?.deliveryAddress ? `
      <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
        <p style="font-weight: 600;">Delivery Address:</p>
        <p>${(bill.deliveryAddress).replace(/\n/g, '<br>')}</p>
      </div>
    ` : '';

    const companyPhoneHTML = profile?.phoneNo ? `<p>Phone: ${profile.phoneNo}</p>` : '';

    htmlTemplate = htmlTemplate
      .replace(/{{BILL_NUMBER}}/g, bill?.billNumber || '')
      .replace(/{{BILL_DATE}}/g, bill?.billDate ? format(new Date(bill.billDate), "dd/MM/yyyy") : '')
      .replace(/{{TAX_TYPE}}/g, bill?.isIGST ? "IGST" : "CGST/SGST")
      .replace(/{{COMPANY_NAME}}/g, profile?.firmName || '')
      .replace(/{{COMPANY_ADDRESS}}/g, (profile?.address || '').replace(/\n/g, '<br>'))
      .replace(/{{COMPANY_GST}}/g, profile?.gstNo || '')
      .replace(/{{COMPANY_PHONE}}/g, companyPhoneHTML)
      .replace(/{{CUSTOMER_NAME}}/g, bill?.customer?.name || '')
      .replace(/{{CUSTOMER_ADDRESS}}/g, (bill?.customer?.address || '').replace(/\n/g, '<br>'))
      .replace(/{{CUSTOMER_GST}}/g, bill?.customer?.gstNo || '')
      .replace(/{{DELIVERY_ADDRESS}}/g, deliveryAddressHTML)
      .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
      .replace(/{{SUBTOTAL}}/g, bill?.subtotal?.toFixed(2) || '0.00')
      .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
      .replace(/{{TOTAL}}/g, bill?.total?.toFixed(2) || '0.00')
      .replace(/{{AMOUNT_IN_WORDS}}/g, numberToWords(bill?.total || 0))
      .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);
    
    return htmlTemplate;
  } catch (error) {
    console.error('Error generating single bill HTML:', error);
    return `<!-- Error generating HTML for bill ID: ${bill?.id} -->`;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { billIds } = await req.json();
    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json({ error: "No bill IDs provided" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const billsDetails = await prisma.bill.findMany({
      where: {
        id: { in: billIds },
        userId: user.id,
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
        billDate: "asc",
      }
    });

    if (billsDetails.length === 0) {
      return NextResponse.json({ error: "No matching bills found" }, { status: 404 });
    }

    const billHtmls = billsDetails.map(bill => generateBillHTML(bill, profile));

    return NextResponse.json(billHtmls, { status: 200 });

  } catch (error) {
    console.error("Error fetching bulk bill HTMLs:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "Failed to fetch bill HTMLs.", details: errorMessage }, { status: 500 });
  }
} 