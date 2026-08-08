"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui";
import { PrintIcon, DownloadIcon, DeleteIcon } from "@/components/icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import NumberToWords from "@/components/NumberToWords";
import { buildUpiBlockHtml, buildUpiUri, generateUpiQrDataUrl } from "@/lib/upi";

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
  params: Promise<{
    id: string;
  }>;
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
  profilePhoto: string | null;
  upiId: string | null;
}

export default function BillDetailPage({ params }: BillParams) {
  const router = useRouter();
  const { id } = React.use(params);
  const [bill, setBill] = useState<Bill | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

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
      // Fetch the user's profile to get default template
      let userTemplate = 'billFormat.html';
      try {
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          userTemplate = profileData.defaultTemplate || 'billFormat.html';
        }
      } catch (profileError) {
        console.error('Error fetching user profile for template:', profileError);
      }

      const templateResponse = await fetch(`/api/templates/serve?template=${encodeURIComponent(userTemplate)}`);
      if (!templateResponse.ok) throw new Error('Failed to load template');
      let htmlTemplate = await templateResponse.text();
    const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;
      const itemsTableHTML = bill?.items.map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.item.name}</td>
                  <td>${item.item.hsnCode}</td>
                  <td class="text-center">${item.quantity.toFixed(2)}</td>
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
      
      // Handle profile photo - only include if profile photo exists
      const profilePhotoHTML = profile?.profilePhoto ?
        `<img src="${profile.profilePhoto}" alt="Business Logo" class="profile-photo" />` : '';

      // UPI payment QR (only when the profile has a UPI ID configured)
      let upiQrHTML = '';
      if (profile?.upiId && bill?.total) {
        const upiUri = buildUpiUri({
          payeeVpa: profile.upiId,
          payeeName: profile.firmName || '',
          amount: bill.total,
          note: `Bill ${bill.billNumber}`,
        });
        const qrDataUrl = await generateUpiQrDataUrl(upiUri);
        upiQrHTML = buildUpiBlockHtml(qrDataUrl, profile.upiId, bill.total);
      }

      let printContent = htmlTemplate
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
        .replace(/{{PROFILE_PHOTO}}/g, profilePhotoHTML)
        .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
        .replace(/{{SUBTOTAL}}/g, bill?.subtotal.toFixed(2) || '0.00')
        .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
        .replace(/{{TOTAL}}/g, bill?.total.toFixed(2) || '0.00')
        .replace(/{{AMOUNT_IN_WORDS}}/g, NumberToWords(bill?.total || 0))
        .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);
      if (printContent.includes('{{UPI_QR}}')) {
        printContent = printContent.replace(/{{UPI_QR}}/g, upiQrHTML);
      } else if (upiQrHTML) {
        printContent = printContent.replace(/<\/body>/i, `${upiQrHTML}</body>`);
      }
    printWindow.document.write(printContent);
    printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 800);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load print template. Please try again.');
      if (printWindow) printWindow.close();
    }
  };

  // Mint (or reuse) the public share link for this bill
  const ensureShareUrl = async (): Promise<string | null> => {
    if (shareUrl) return shareUrl;
    setSharing(true);
    try {
      const res = await fetch(`/api/bills/${id}/share`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to create share link");
      const data = await res.json();
      setShareUrl(data.url);
      return data.url;
    } catch (err) {
      toast.error("Could not create share link. Please try again.");
      return null;
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const url = await ensureShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invoice link copied to clipboard");
    } catch {
      toast(url, { duration: 10000 });
    }
  };

  const handleWhatsAppShare = async () => {
    const url = await ensureShareUrl();
    if (!url || !bill) return;
    const message = `Invoice ${bill.billNumber} from ${profile?.firmName || "us"} for ₹${bill.total.toFixed(2)}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bill</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/dashboard/bills"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Bills
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bill Data</h2>
            <p className="text-gray-600 mb-6">The bill information could not be displayed.</p>
            <Link
              href="/dashboard/bills"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Bills
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/dashboard/bills" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                                 <span className="group-hover:underline">Back to Bills</span>
              </Link>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{`Invoice #${bill.billNumber}`}</h1>
                  <p className="text-sm text-gray-600">View and manage invoice details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
              </div>
              <div className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                {bill.isIGST ? "IGST" : "CGST/SGST"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Bill Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-lg font-semibold text-gray-900">{format(new Date(bill.billDate), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-lg font-semibold text-gray-900">{bill.customer.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Items</p>
                <p className="text-lg font-semibold text-gray-900">{bill.items.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900">₹{bill.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage this invoice</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyLink}
                disabled={sharing}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm transition-colors border border-gray-300 disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="ml-2">{sharing ? "Creating link..." : "Copy Link"}</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                disabled={sharing}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm transition-colors disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="ml-2">WhatsApp</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm transition-colors border border-gray-300"
              >
                <PrintIcon />
                <span className="ml-2">Print Invoice</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm transition-colors border border-gray-300"
              >
                <DownloadIcon />
                <span className="ml-2">Download PDF</span>
              </button>
              <button
                onClick={openDeleteDialog}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm transition-colors border border-red-200"
              >
                <DeleteIcon /> 
                <span className="ml-2">Delete Bill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" id="bill-content-for-display">
          {/* Invoice Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Tax Invoice</h2>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                <span><span className="font-semibold">Invoice No:</span> {bill.billNumber}</span>
                <span className="text-gray-400">|</span>
                <span><span className="font-semibold">Date:</span> {format(new Date(bill.billDate), "dd MMMM yyyy")}</span>
                <span className="text-gray-400">|</span>
                <span><span className="font-semibold">Tax Type:</span> {bill.isIGST ? "IGST" : "CGST/SGST"}</span>
      </div>
            </div>
        </div>

          <div className="p-6">
            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Billed By</h3>
            {profile ? (
                  <div className="space-y-2">
                    <p className="text-gray-900 font-semibold">{profile.firmName}</p>
                <p className="text-gray-600 text-sm whitespace-pre-line">{profile.address}</p>
                    <p className="text-gray-600 text-sm"><span className="font-medium">GSTIN:</span> {profile.gstNo}</p>
                    {profile.phoneNo && <p className="text-gray-600 text-sm"><span className="font-medium">Phone:</span> {profile.phoneNo}</p>}
                  </div>
            ) : (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
            )}
          </div>

          <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Billed To</h3>
                <div className="space-y-2">
                  <p className="text-gray-900 font-semibold">{bill.customer.name}</p>
            <p className="text-gray-600 text-sm whitespace-pre-line">{bill.customer.address}</p>
                  <p className="text-gray-600 text-sm"><span className="font-medium">GSTIN:</span> {bill.customer.gstNo}</p>
                </div>
          </div>
        </div>

            {/* Delivery Address */}
        {bill.deliveryAddress && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Delivery Address</h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">{bill.deliveryAddress}</p>
          </div>
        )}

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item Description</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">HSN</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Rate (₹)</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (₹)</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Tax %</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Tax Amt (₹)</th>
                </tr>
              </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                {bill.items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.item.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.item.hsnCode}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.quantity.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right font-medium">₹{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">₹{item.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {item.item.taxRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right font-medium">₹{item.taxAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
            {/* Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Amount in Words</h4>
                  <p className="text-sm text-gray-600 capitalize bg-gray-50 p-4 rounded-lg">{NumberToWords(bill.total)}</p>
                </div>
                
                {profile && profile.bankDetails && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Bank Details</h4>
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-line">{profile.bankDetails}</div>
                </div>
                )}
            </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">₹{bill.subtotal.toFixed(2)}</span>
                </div>
                  
                {bill.isIGST ? (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">IGST ({bill.items.length > 0 ? bill.items[0].item.taxRate : 0}%)</span>
                      <span className="text-sm font-medium text-gray-900">₹{bill.igst.toFixed(2)}</span>
                    </div>
                ) : (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">CGST ({bill.items.length > 0 ? bill.items[0].item.taxRate / 2 : 0}%)</span>
                        <span className="text-sm font-medium text-gray-900">₹{bill.cgst.toFixed(2)}</span>
                    </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">SGST ({bill.items.length > 0 ? bill.items[0].item.taxRate / 2 : 0}%)</span>
                        <span className="text-sm font-medium text-gray-900">₹{bill.sgst.toFixed(2)}</span>
                    </div>
                    </>
                )}
                  
                  <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-lg font-bold text-blue-600">₹{bill.total.toFixed(2)}</span>
                  </div>
                </div>
            </div>
        </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">This is a system-generated invoice.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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