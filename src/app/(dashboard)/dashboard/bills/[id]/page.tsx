"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import Spinner from "@/components/Spinner";
import { PrintIcon, DownloadIcon, DeleteIcon, BackIcon } from "@/components/icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import NumberToWords from "@/components/NumberToWords";

// @ayushaggarwal1 this is original code for number to words
// Helper function to convert number to words
// function numberToWords(num: number): string {
//   const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
//   function convertLessThanOneThousand(n: number): string {
//     if (n === 0) return '';
//     if (n < 20) return units[n];
//     if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
//     return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
//   }

//   if (num === 0) {
//     return 'Zero Rupees Only';
//   }

//   // Get integer and decimal parts
//   let rupeesValue = Math.floor(num);
//   const paise = Math.round((num - rupeesValue) * 100);

//   let result = '';
  
//     if (rupeesValue >= 10000000) {
//       result += convertLessThanOneThousand(Math.floor(rupeesValue / 10000000)) + ' Crore ';
//       rupeesValue %= 10000000;
//     }
    
//     if (rupeesValue >= 100000) {
//       result += convertLessThanOneThousand(Math.floor(rupeesValue / 100000)) + ' Lakh ';
//       rupeesValue %= 100000;
//     }
    
//     if (rupeesValue >= 1000) {
//       result += convertLessThanOneThousand(Math.floor(rupeesValue / 1000)) + ' Thousand ';
//       rupeesValue %= 1000;
//     }
    
//     if (rupeesValue > 0) {
//       result += convertLessThanOneThousand(rupeesValue);
//     }
    
//   result += (rupeesValue > 0 || paise > 0) ? (rupeesValue > 0 ? ' Rupees' : '') : 'Zero Rupees';
  
//   if (paise > 0) {
//     result += (rupeesValue > 0 ? ' and ' : '') + convertLessThanOneThousand(paise) + ' Paise';
//   }
  
//   return result.trim() + ' Only';
// }

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
  deliveryAddress: string | null;
}

interface Profile {
  firmName: string;
  address: string;
  gstNo: string;
  phoneNo: string | null;
  bankDetails: string | null;
}

export default function BillDetailPage({ params }: BillParams) {
  const router = useRouter();
  const { id } = params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch bill data
        const billRes = await fetch(`/api/bills/${id}`);
        if (!billRes.ok) {
          if (billRes.status === 404) throw new Error("Bill not found.");
          throw new Error("Failed to fetch bill details.");
        }
        const billData = await billRes.json();
        setBill(billData);

        // Fetch profile data
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData(); else { setError("Bill ID missing."); setLoading(false); }
  }, [id]);

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print the invoice'); return; }
    try {
      const templateResponse = await fetch('/templates/billFormat.html');
      if (!templateResponse.ok) throw new Error('Failed to load template');
      let htmlTemplate = await templateResponse.text();
    const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;
      const itemsTableHTML = bill?.items.map((item, index) => `
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
      const bankDetailsHTML = profile?.bankDetails ? `<div class="bank-details"><h3>Bank Details</h3><p>${(profile.bankDetails || '').replace(/\n/g, '<br>')}</p></div>` : '';
      const deliveryAddressHTML = bill?.deliveryAddress ? `<div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;"><p style="font-weight: 600;">Delivery Address:</p><p>${(bill.deliveryAddress).replace(/\n/g, '<br>')}</p></div>` : '';
      const printContent = htmlTemplate
        .replace(/{{BILL_NUMBER}}/g, bill?.billNumber || '')
        .replace(/{{BILL_DATE}}/g, format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy"))
        .replace(/{{TAX_TYPE}}/g, bill?.isIGST ? "IGST" : "CGST/SGST")
        .replace(/{{COMPANY_NAME}}/g, profile?.firmName || '')
        .replace(/{{COMPANY_ADDRESS}}/g, (profile?.address || '').replace(/\n/g, '<br>'))
        .replace(/{{COMPANY_GST}}/g, profile?.gstNo || '')
        .replace(/{{COMPANY_PHONE}}/g, profile?.phoneNo ? `<p>Phone: ${profile.phoneNo}</p>` : '')
        .replace(/{{CUSTOMER_NAME}}/g, bill?.customer.name || '')
        .replace(/{{CUSTOMER_ADDRESS}}/g, (bill?.customer.address || '').replace(/\n/g, '<br>'))
        .replace(/{{CUSTOMER_GST}}/g, bill?.customer.gstNo || '')
        .replace(/{{DELIVERY_ADDRESS}}/g, deliveryAddressHTML)
        .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
        .replace(/{{SUBTOTAL}}/g, bill?.subtotal.toFixed(2) || '0.00')
        .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
        .replace(/{{TOTAL}}/g, bill?.total.toFixed(2) || '0.00')
        .replace(/{{AMOUNT_IN_WORDS}}/g, NumberToWords(bill?.total || 0))
        .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);
    printWindow.document.write(printContent);
    printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 800);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load print template. Please try again.');
      if (printWindow) printWindow.close();
    }
  };

  const handleDownloadPDF = async () => {
    // Placeholder for PDF generation logic (e.g., using jsPDF or a backend service)
    alert("PDF Download functionality not yet implemented.");
  };

  const openDeleteDialog = () => setShowDeleteConfirm(true);
  const closeDeleteDialog = () => setShowDeleteConfirm(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to delete bill'); }
      router.push('/dashboard/bills');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bill.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>;
  }

  if (error && !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Bill</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link href="/dashboard/bills"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <BackIcon /> <span className="ml-2">Back to Bills List</span>
            </Link>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No Bill Data</h2>
            <p className="text-gray-600 mb-6">The bill information could not be displayed.</p>
            <Link href="/dashboard/bills"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                 <BackIcon /> <span className="ml-2">Back to Bills List</span>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard/bills" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center">
              <BackIcon />
              <span className="ml-2">Back to Bills</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Bill #{bill.billNumber}</h1>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 bg-gray-100 shadow-md p-3 print:hidden mb-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-start gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <PrintIcon /> <span className="ml-1.5">Print</span>
            </button>
            <button
              // onClick={handleDownloadPDF}
              // disabled={true}
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <DownloadIcon /> <span className="ml-1.5">Download PDF</span>
            </button>
            <button
              onClick={openDeleteDialog}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50"
            >
              <DeleteIcon /> <span className="ml-1.5">Delete</span>
            </button>
        </div>
      </div>

      {error && (
         <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pb-4">
            <div className="p-4 bg-red-100 text-sm text-red-700 rounded-lg">
                {error}
            </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-md p-6 sm:p-8 print:shadow-none print:p-0" id="bill-content-for-display">
        <div className="text-center mb-4 print:mb-2">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-800">Tax Invoice</h2>
        </div>

        <div className="text-center text-sm text-gray-600 mb-6 print:mb-3">
            <span className="font-semibold text-gray-700">Invoice No:</span> {bill.billNumber}
            <span className="mx-3">|</span>
            <span className="font-semibold text-gray-700">Date:</span> {format(new Date(bill.billDate), "dd MMMM yyyy")}
            <span className="mx-3">|</span>
            <span className="font-semibold text-gray-700">Tax Type:</span> {bill?.isIGST ? "IGST" : "CGST/SGST"}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4 print:mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Billed By:</h3>
            {profile ? (
              <>
                <p className="text-gray-800 font-medium text-md">{profile.firmName}</p>
                <p className="text-gray-600 text-sm whitespace-pre-line">{profile.address}</p>
                <p className="text-gray-600 text-sm">GSTIN: {profile.gstNo}</p>
                {profile.phoneNo && <p className="text-gray-600 text-sm">Phone: {profile.phoneNo}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading profile...</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Billed To:</h3>
            <p className="text-gray-800 font-medium text-md">{bill.customer.name}</p>
            <p className="text-gray-600 text-sm whitespace-pre-line">{bill.customer.address}</p>
            <p className="text-gray-600 text-sm">GSTIN: {bill.customer.gstNo}</p>
          </div>
        </div>

        {bill.deliveryAddress && (
          <div className="mb-8 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Delivery Address:</h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">{bill.deliveryAddress}</p>
          </div>
        )}

        <div className="mb-8 print:mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Items:</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 print:border-none print:overflow-visible">
            <table className="min-w-full divide-y divide-gray-200 print:divide-y-0">
              <thead className="bg-gray-50 print:bg-transparent">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">S.No</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">Item Description</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">HSN</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">Qty</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">Rate (₹)</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">Amount (₹)</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">Tax %</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-1">Tax Amt (₹)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 print:bg-transparent print:divide-y-0">
                {bill.items.map((item, index) => (
                  <tr key={item.id} className="print:border-b print:border-gray-300">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 print:px-1 print:py-1">{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 print:px-1 print:py-1">{item.item.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 print:px-1 print:py-1">{item.item.hsnCode}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center print:px-1 print:py-1">{item.quantity}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right print:px-1 print:py-1">{item.price.toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right print:px-1 print:py-1">{item.amount.toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center print:px-1 print:py-1">{item.item.taxRate}%</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right print:px-1 print:py-1">{item.taxAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 print:grid-cols-3 print:gap-4 print:mb-4">
            <div className="md:col-span-2">
                <h3 className="text-md font-semibold text-gray-700 mb-1">Amount in words:</h3>
                <p className="text-sm text-gray-600 capitalize">{NumberToWords(bill.total)}</p>
                
                {profile && profile.bankDetails && (
                <div className="mt-6 print:mt-3">
                    <h3 className="text-md font-semibold text-gray-700 mb-1">Bank Details:</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{profile.bankDetails}</p>
                </div>
                )}
            </div>

            <div className="text-sm">
                <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800 font-medium">₹{bill.subtotal.toFixed(2)}</span>
                </div>
                {bill.isIGST ? (
                    <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-600">IGST ({bill.items.length > 0 ? bill.items[0].item.taxRate : 0}%):</span>
                    <span className="text-gray-800 font-medium">₹{bill.igst.toFixed(2)}</span>
                    </div>
                ) : (
                    <>
                    <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-600">CGST ({bill.items.length > 0 ? bill.items[0].item.taxRate / 2 : 0}%):</span>
                        <span className="text-gray-800 font-medium">₹{bill.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-600">SGST ({bill.items.length > 0 ? bill.items[0].item.taxRate / 2 : 0}%):</span>
                        <span className="text-gray-800 font-medium">₹{bill.sgst.toFixed(2)}</span>
                    </div>
                    </>
                )}
                <div className="flex justify-between py-2 mt-1">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-lg font-bold text-gray-900">₹{bill.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 print:mt-6 print:pt-3">
          <p>This is a system-generated invoice.</p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Bill"
        message={`Are you sure you want to delete bill #${bill.billNumber}? This action cannot be undone.`}
        confirmButtonText={isDeleting ? "Deleting..." : "Delete"}
        confirmButtonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
} 