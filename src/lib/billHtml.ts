import fs from "fs";
import path from "path";
import { format } from "date-fns";
import NumberToWords from "@/components/NumberToWords";
import { buildUpiBlockHtml, buildUpiUri, generateUpiQrDataUrl } from "./upi";

// Server-side invoice renderer shared by the bulk-HTML API and the public
// invoice page. Fills the tenant's template with bill/profile data; templates
// may place the payment QR explicitly with {{UPI_QR}}, otherwise the block is
// appended before </body> when a UPI ID is configured.
export async function renderBillHtml(bill: any, profile: any): Promise<string> {
  try {
    // Use user's default template if available, otherwise fall back to billFormat.html
    const templateFilename = profile?.defaultTemplate || 'billFormat.html';

    // Check if it's a backup template
    let templatePath: string;
    if (templateFilename.startsWith('backup-templates/')) {
      templatePath = path.join(process.cwd(), 'public', templateFilename);
    } else {
      templatePath = path.join(process.cwd(), 'public', 'templates', templateFilename);
    }

    // Check if the template file exists, fall back to default if not
    let htmlTemplate: string;
    if (fs.existsSync(templatePath)) {
      htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    } else {
      console.warn(`Template ${templateFilename} not found, falling back to billFormat.html`);
      const defaultTemplatePath = path.join(process.cwd(), 'public', 'templates', 'billFormat.html');
      htmlTemplate = fs.readFileSync(defaultTemplatePath, 'utf8');
    }

    const taxRate = bill?.items && bill.items.length > 0 && bill.items[0].item ? bill.items[0].item.taxRate : 0;

    const itemsTableHTML = bill?.items.map((item: any, index: number) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.item.name}</td>
        <td>${item.item.hsnCode || ''}</td>
        <td class="text-center">${parseFloat(item.quantity).toFixed(2)}</td>
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

    // Handle profile photo
    const profilePhotoHTML = profile?.profilePhoto ?
      `<img src="${profile.profilePhoto}" alt="Business Logo" class="profile-photo" />` : '';

    // UPI payment QR (only when the profile has a UPI ID configured)
    let upiQrHTML = '';
    if (profile?.upiId && bill?.total > 0) {
      const upiUri = buildUpiUri({
        payeeVpa: profile.upiId,
        payeeName: profile.firmName || '',
        amount: bill.total,
        note: `Bill ${bill?.billNumber || ''}`,
      });
      const qrDataUrl = await generateUpiQrDataUrl(upiUri);
      upiQrHTML = buildUpiBlockHtml(qrDataUrl, profile.upiId, bill.total);
    }

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
      .replace(/{{PROFILE_PHOTO}}/g, profilePhotoHTML)
      .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
      .replace(/{{SUBTOTAL}}/g, bill?.subtotal?.toFixed(2) || '0.00')
      .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
      .replace(/{{TOTAL}}/g, bill?.total?.toFixed(2) || '0.00')
      .replace(/{{AMOUNT_IN_WORDS}}/g, NumberToWords(bill?.total || 0))
      .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);

    if (htmlTemplate.includes('{{UPI_QR}}')) {
      htmlTemplate = htmlTemplate.replace(/{{UPI_QR}}/g, upiQrHTML);
    } else if (upiQrHTML) {
      // Template doesn't position the QR itself — append it at the end of the page.
      htmlTemplate = htmlTemplate.replace(/<\/body>/i, `${upiQrHTML}\n</body>`);
    }

    return htmlTemplate;
  } catch (error) {
    console.error('Error generating single bill HTML:', error);
    return `<!-- Error generating HTML for bill ID: ${bill?.id} -->`;
  }
}
