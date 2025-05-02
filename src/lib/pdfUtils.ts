import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Need to add typings for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type BillItem = {
  item: {
    name: string;
    hsnCode: string;
    gstPercentage: number;
  };
  quantity: number;
  rate: number;
  amount: number;
  taxAmount: number;
  totalAmount: number;
};

type BillData = {
  invoiceNo: string;
  date: Date;
  customerName: string;
  customerAddress: string;
  customerGst: string | null;
  firmName: string;
  firmAddress: string;
  firmGst: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  items: BillItem[];
  totalAmount: number;
  totalTax: number;
  grandTotal: number;
};

export const generateBillPdf = (billData: BillData): jsPDF => {
  try {
    // Create a new instance with explicit orientation and unit
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add company header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(billData.firmName || 'Your Business', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(billData.firmAddress || 'Your Address', doc.internal.pageSize.width / 2, 28, { align: 'center' });
    doc.text(`GSTIN: ${billData.firmGst || 'Not Provided'}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Add line separator
    doc.setLineWidth(0.5);
    doc.line(15, 40, doc.internal.pageSize.width - 15, 40);
    
    // Add invoice details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', doc.internal.pageSize.width / 2, 48, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${billData.invoiceNo}`, 15, 55);
    doc.text(`Date: ${(billData.date instanceof Date ? billData.date : new Date(billData.date)).toLocaleDateString()}`, doc.internal.pageSize.width - 15, 55, { align: 'right' });
    
    // Add customer details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 65);
    
    doc.setFont('helvetica', 'normal');
    doc.text(billData.customerName, 15, 72);
    
    // Split address into multiple lines if needed
    const addressLines = billData.customerAddress.split('\n');
    let lineY = 79;
    addressLines.forEach(line => {
      if (line.trim()) {
        doc.text(line, 15, lineY);
        lineY += 7;
      }
    });
    
    if (billData.customerGst) {
      doc.text(`GSTIN: ${billData.customerGst}`, 15, lineY);
      lineY += 7;
    }
    
    // Add item table using manual table creation instead of autoTable
    const startY = 95;
    const colWidths = [10, 35, 20, 15, 20, 20, 15, 20, 20];
    const colStarts = [15];
    
    for (let i = 1; i < colWidths.length; i++) {
      colStarts[i] = colStarts[i-1] + colWidths[i-1];
    }
    
    // Table header
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    
    // Draw header rectangle
    doc.rect(15, startY, doc.internal.pageSize.width - 30, 8, 'F');
    
    // Headers
    const headers = ['S.No', 'Item', 'HSN/SAC', 'Qty', 'Rate', 'Amount', 'GST %', 'GST Amt', 'Total'];
    headers.forEach((header, i) => {
      doc.text(header, colStarts[i] + 2, startY + 5);
    });
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let currentY = startY + 8;
    
    // Make sure we have items to display
    const items = billData.items || [];
    if (items.length === 0) {
      // Draw empty row
      doc.rect(15, currentY, doc.internal.pageSize.width - 30, 8);
      doc.text('No items', colStarts[1] + 2, currentY + 5);
      currentY += 8;
    } else {
      // Draw actual items
      items.forEach((item, index) => {
        // Row rectangle
        doc.setDrawColor(200, 200, 200);
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 8);
        
        // Row data
        doc.text((index + 1).toString(), colStarts[0] + 2, currentY + 5);
        doc.text(item.item.name, colStarts[1] + 2, currentY + 5);
        doc.text(item.item.hsnCode, colStarts[2] + 2, currentY + 5);
        doc.text(item.quantity.toString(), colStarts[3] + 2, currentY + 5);
        doc.text(`₹${item.rate.toFixed(2)}`, colStarts[4] + 2, currentY + 5);
        doc.text(`₹${item.amount.toFixed(2)}`, colStarts[5] + 2, currentY + 5);
        doc.text(`${item.item.gstPercentage}%`, colStarts[6] + 2, currentY + 5);
        doc.text(`₹${item.taxAmount.toFixed(2)}`, colStarts[7] + 2, currentY + 5);
        doc.text(`₹${item.totalAmount.toFixed(2)}`, colStarts[8] + 2, currentY + 5);
        
        currentY += 8;
      });
    }
    
    // Add totals - Handle case when lastAutoTable is not defined
    let finalY = currentY + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: ₹${billData.totalAmount.toFixed(2)}`, doc.internal.pageSize.width - 15, finalY, { align: 'right' });
    doc.text(`Total Tax: ₹${billData.totalTax.toFixed(2)}`, doc.internal.pageSize.width - 15, finalY + 7, { align: 'right' });
    doc.text(`Grand Total: ₹${billData.grandTotal.toFixed(2)}`, doc.internal.pageSize.width - 15, finalY + 14, { align: 'right' });
    
    // Add bank details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', 15, finalY + 25);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank Name: ${billData.bankName || 'Not Provided'}`, 15, finalY + 32);
    doc.text(`Account No: ${billData.accountNo || 'Not Provided'}`, 15, finalY + 39);
    doc.text(`IFSC Code: ${billData.ifscCode || 'Not Provided'}`, 15, finalY + 46);
    
    // Add signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('For ' + (billData.firmName || 'Your Business'), doc.internal.pageSize.width - 15, finalY + 46, { align: 'right' });
    
    doc.text('Authorized Signatory', doc.internal.pageSize.width - 15, finalY + 60, { align: 'right' });
    
    // Add footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('This is a computer generated invoice.', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF: " + (error instanceof Error ? error.message : String(error)));
  }
};

export const downloadBillPdf = (billData: BillData): void => {
  try {
    // Validate required fields
    if (!billData.invoiceNo) {
      throw new Error("Invoice number is required");
    }
    
    if (!billData.items || !Array.isArray(billData.items)) {
      throw new Error("Bill items are missing or invalid");
    }

    // Create safe copies of data to prevent null reference errors
    const safeData = {
      ...billData,
      customerName: billData.customerName || "Customer",
      customerAddress: billData.customerAddress || "Address not provided",
      firmName: billData.firmName || "Your Business",
      firmAddress: billData.firmAddress || "Your Address",
      firmGst: billData.firmGst || "GSTIN not provided",
      items: billData.items.map(item => ({
        ...item,
        item: {
          name: item.item?.name || "Unknown Item",
          hsnCode: item.item?.hsnCode || "-",
          gstPercentage: item.item?.gstPercentage || 0
        },
        quantity: item.quantity || 0,
        rate: item.rate || 0,
        amount: item.amount || 0,
        taxAmount: item.taxAmount || 0,
        totalAmount: item.totalAmount || 0
      }))
    };
    
    // Try a more reliable approach for PDF download
    try {
      // First try using the standard jsPDF approach
      const doc = generateBillPdf(safeData);
      doc.save(`Invoice-${safeData.invoiceNo}.pdf`);
    } catch (innerError) {
      console.error("Standard PDF download failed, trying alternative method:", innerError);
      
      // If the standard method fails, try an alternative approach
      const doc = generateBillPdf(safeData);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${safeData.invoiceNo}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw new Error("Failed to download PDF: " + (error instanceof Error ? error.message : String(error)));
  }
};

export const printBillPdf = (billData: BillData): void => {
  try {
    // Validate required fields
    if (!billData.invoiceNo) {
      throw new Error("Invoice number is required");
    }
    
    if (!billData.items || !Array.isArray(billData.items)) {
      throw new Error("Bill items are missing or invalid");
    }

    // Create safe copies of data to prevent null reference errors
    const safeData = {
      ...billData,
      customerName: billData.customerName || "Customer",
      customerAddress: billData.customerAddress || "Address not provided",
      firmName: billData.firmName || "Your Business",
      firmAddress: billData.firmAddress || "Your Address",
      firmGst: billData.firmGst || "GSTIN not provided",
      items: billData.items.map(item => ({
        ...item,
        item: {
          name: item.item?.name || "Unknown Item",
          hsnCode: item.item?.hsnCode || "-",
          gstPercentage: item.item?.gstPercentage || 0
        },
        quantity: item.quantity || 0,
        rate: item.rate || 0,
        amount: item.amount || 0,
        taxAmount: item.taxAmount || 0,
        totalAmount: item.totalAmount || 0
      }))
    };
    
    const doc = generateBillPdf(safeData);
    
    // Use a more reliable method for printing by opening in a new tab
    // and then triggering print from there
    const pdfData = doc.output('dataurlstring');
    
    // Create a new window with the PDF content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error("Popup blocker may be preventing the print window from opening");
    }
    
    // Write the PDF viewer HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${safeData.invoiceNo} - Print</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe src="${pdfData}"></iframe>
          <script>
            // Automatically print when the iframe loads
            document.querySelector('iframe').onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
  } catch (error) {
    console.error("Error printing PDF:", error);
    throw new Error("Failed to print PDF: " + (error instanceof Error ? error.message : String(error)));
  }
}; 