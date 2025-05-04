"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

// Helper function to convert number to words
function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanOneThousand(num: number): string {
    if (num === 0) {
      return '';
    }
    if (num < 20) {
      return units[num];
    }
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
    }
    return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
  }

  if (num === 0) {
    return 'Zero';
  }

  // Get integer and decimal parts
  let rupeesValue = Math.floor(num);
  const paise = Math.round((num - rupeesValue) * 100);

  let result = '';
  
  if (rupeesValue > 0) {
    if (rupeesValue >= 10000000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 10000000)) + ' Crore ';
      rupeesValue %= 10000000;
    }
    
    if (rupeesValue >= 100000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 100000)) + ' Lakh ';
      rupeesValue %= 100000;
    }
    
    if (rupeesValue >= 1000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 1000)) + ' Thousand ';
      rupeesValue %= 1000;
    }
    
    if (rupeesValue > 0) {
      result += convertLessThanOneThousand(rupeesValue);
    }
    
    result += ' Rupees';
  }
  
  if (paise > 0) {
    result += (rupeesValue > 0 ? ' and ' : '') + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
}

interface BillParams {
  params: {
    id: string;
  };
}

interface BillItem {
  id: string;
  item: {
    name: string;
    hsnCode: string;
    taxRate: number;
  };
  quantity: number;
  price: number;
  taxAmount: number;
  amount: number;
}

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  customer: {
    name: string;
    address: string;
    gstNo: string;
  };
  items: BillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isIGST: boolean;
}

interface Profile {
  firmName: string;
  address: string;
  gstNo: string;
  bankDetails: string | null;
}

export default function BillDetailPage({ params }: BillParams) {
  const router = useRouter();
  const { id } = params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bill data
        const billRes = await fetch(`/api/bills/${id}`);
        if (!billRes.ok) {
          throw new Error("Failed to fetch bill");
        }
        const billData = await billRes.json();
        setBill(billData);

        // Fetch profile data
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle printing with a dedicated function
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }
    
    // Get tax rate safely
    const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;
    
    // Create the print content with only the bill
    const printContent = `
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

          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .invoice-container {
              width: 100%;
              max-width: 100%;
              padding: 0;
              margin: 0;
              border: none;
            }
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
                <span class="value">${bill?.billNumber}</span>
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
              <p>${(profile?.address || '').replace(/\\n/g, '<br>')}</p>
              <p>GSTIN: ${profile?.gstNo || ''}</p>
            </div>
            <div class="party-info">
              <h3>Customer Details</h3>
              <p class="party-name">${bill?.customer.name || ''}</p>
              <p>${(bill?.customer.address || '').replace(/\\n/g, '<br>')}</p>
              <p>GSTIN: ${bill?.customer.gstNo || ''}</p>
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
              ${bill?.items.map((item, index) => `
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
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="summary-section">
            <table class="summary-table">
              <tr>
                <td>Subtotal:</td>
                <td>₹${bill?.subtotal.toFixed(2) || '0.00'}</td>
              </tr>
              
              ${bill?.isIGST ? `
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
              `}
              
              <tr class="total-row">
                <td>Total:</td>
                <td>₹${bill?.total.toFixed(2) || '0.00'}</td>
              </tr>
            </table>
            
            <div class="amount-in-words">
              <strong>Amount in words:</strong> ${numberToWords(bill?.total || 0)}
            </div>
          </div>
          
          ${profile?.bankDetails ? `
            <div class="bank-details">
              <h3>Bank Details</h3>
              <p>${(profile.bankDetails || '').replace(/\\n/g, '<br>').replace(/(Account No\.|Bank Name|ISFC Code) -/g, '<br>$1 -').replace(/^<br>/, '')}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>This is a system generated invoice</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window and print it
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give the browser a moment to render before printing
    setTimeout(() => {
      printWindow.print();
      // Don't close the window automatically to allow user to review
    }, 800);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bill?")) {
      try {
        const res = await fetch(`/api/bills/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete bill");
        }

        router.push("/dashboard/bills");
      } catch (error) {
        console.error("Error deleting bill:", error);
        setError("Failed to delete bill. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading bill...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md max-w-7xl mx-auto mt-8">
        {error || "Failed to load bill details"}
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Bill #{bill.billNumber}</h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Print
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
            <Link
              href="/dashboard/bills"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-full">
        <div className="px-4 py-6 sm:px-0 print:p-0">
          {/* Bill Content for Print and View */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg print:shadow-none print:rounded-none">
            <div className="px-4 py-5 sm:p-6 print:p-4">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-center mb-2">TAX INVOICE</h2>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Invoice #: {bill.billNumber}</p>
                    <p className="text-sm text-gray-500">
                      Date: {format(new Date(bill.billDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Tax Type: {bill.isIGST ? "IGST" : "CGST/SGST"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4">
                {profile && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Company Details</h3>
                    <p className="text-sm font-medium">{profile.firmName}</p>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{profile.address}</p>
                    <p className="text-sm text-gray-500">GSTIN: {profile.gstNo}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h3>
                  <p className="text-sm font-medium">{bill.customer.name}</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{bill.customer.address}</p>
                  <p className="text-sm text-gray-500">GSTIN: {bill.customer.gstNo}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          S.No.
                        </th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Item
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          HSN
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Qty
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Price
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Tax Rate
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Tax Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {bill.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                            {index + 1}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.item.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.item.hsnCode}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.item.taxRate}%
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ₹{item.taxAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                      <dd className="text-sm font-medium text-gray-900">₹{bill.subtotal.toFixed(2)}</dd>
                    </div>

                    {bill.isIGST ? (
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium text-gray-500">IGST</dt>
                        <dd className="text-sm font-medium text-gray-900">₹{bill.igst.toFixed(2)}</dd>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between py-2">
                          <dt className="text-sm font-medium text-gray-500">CGST</dt>
                          <dd className="text-sm font-medium text-gray-900">₹{bill.cgst.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between py-2">
                          <dt className="text-sm font-medium text-gray-500">SGST</dt>
                          <dd className="text-sm font-medium text-gray-900">₹{bill.sgst.toFixed(2)}</dd>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <dt className="text-base font-bold text-gray-900">Total</dt>
                      <dd className="text-base font-bold text-gray-900">₹{bill.total.toFixed(2)}</dd>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Amount in Words Section */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Amount in words:</span> {numberToWords(bill.total)}
                </p>
              </div>

              {/* Bank Details Section */}
              {profile && profile.bankDetails && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Details</h3>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{profile.bankDetails}</p>
                </div>
              )}

              {/* Footer Note */}
              <div className="mt-8 border-t border-gray-200 pt-4 text-center">
                <p className="text-sm text-gray-500">This is a system generated invoice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 