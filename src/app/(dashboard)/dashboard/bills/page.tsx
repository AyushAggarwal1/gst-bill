"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";
import { format } from "date-fns";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Transition } from "@headlessui/react";
import Spinner from "@/components/Spinner";
import { 
    SearchIcon, 
    ClearFilterIcon, 
    FilterIcon, 
    ChevronDownIcon, 
    ChevronUpIcon, 
    AddIcon, 
    EditIcon,
    DeleteIcon,
    DownloadIcon,
    TableIcon,
    KebabMenuIcon,
    ViewIcon,
    SuccessIcon,
} from "@/components/icons";

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  customer: {
    name: string;
  };
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isIGST: boolean;
  createdAt: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [billNumberSearch, setBillNumberSearch] = useState("");
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [creatingPDF, setCreatingPDF] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const billNumberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBills();
  }, [startDate, endDate, customerName, billNumberSearch]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");
      let url = "/api/bills";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (customerName) params.append("customerName", customerName);
      if (billNumberSearch) params.append("billNumber", billNumberSearch);
      if (params.toString()) { url += `?${params.toString()}`; }
      const res = await fetch(url);
      if (!res.ok) { throw new Error("Failed to fetch bills"); }
      const data = await res.json();
      // Sort bills by billNumber (descending) Add commentMore actions
      const sortedBills = data.sort((a: Bill, b: Bill) => {
        // Assuming billNumber is a string that represents a number.
        // If billNumber can have non-numeric prefixes/suffixes, this might need adjustment for natural sort.
        return parseInt(b.billNumber, 10) - parseInt(a.billNumber, 10);
      });

      setBills(sortedBills);
      setSelectedBills([]);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError(error instanceof Error ? error.message : "Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bills/${id}`, { method: "DELETE" });
      if (!res.ok) { throw new Error("Failed to delete bill"); }
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      setSelectedBills((prev) => prev.filter((billId) => billId !== id));
      closeDeleteDialog();
      setDeleteSuccess("Bill deleted successfully.");
      setTimeout(() => setDeleteSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting bill:", error);
      setError(error instanceof Error ? error.message : "Failed to delete bill. Please try again.");
    }
  };

  const handleSelectBill = (id: string) => {
    setSelectedBills((prev) =>
      prev.includes(id)
        ? prev.filter((billId) => billId !== id)
        : [...prev, id]
    );
  };

  const handleDismissSuccess = () => {
    setDeleteSuccess("");
  };
  
  const handleSelectAll = () => {
    if (selectedBills.length === bills.length && bills.length > 0) {
      setSelectedBills([]);
    } else {
      setSelectedBills(bills.map((bill) => bill.id));
    }
  };
  
  const handleCreatePDF = async () => {
    if (selectedBills.length === 0) {
      setActionMessage({ type: 'error', text: "Please select at least one bill to create PDF." });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    setCreatingPDF(true);
    setActionMessage(null);

    try {
      // 1. Fetch array of fully populated HTML strings for each selected bill
      const htmlResponse = await fetch("/api/bills/bulk-htmls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: selectedBills }),
      });

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json().catch(() => ({ error: "Failed to fetch bill HTMLs"}));
        throw new Error(errorData.error || "Failed to fetch bill HTMLs");
      }
      const { htmls: billHtmlsArray, companyName: companyNameForTitle } = await htmlResponse.json();

      if (!billHtmlsArray || billHtmlsArray.length === 0) {
        throw new Error("No HTML content received for selected bills.");
      }

      // 2. Fetch the base template to extract <head> content
      let templateHeadContent = '';
      try {
        const templateResponse = await fetch('/templates/billFormat.html');
        if (!templateResponse.ok) {
          console.error('Failed to fetch bill template for head. Status:', templateResponse.status);
          setActionMessage({ type: 'error', text: 'Error: Could not load bill template styles.'});
          setTimeout(() => setActionMessage(null), 5000);
          // Potentially throw error or return if template is crucial
        } else {
          const templateFullHtml = await templateResponse.text();
          const headMatch = templateFullHtml.match(/<head>([\s\S]*?)<\/head>/);
          if (headMatch && headMatch[1]) {
            let rawHeadContent = headMatch[1];
            templateHeadContent = rawHeadContent.replace(/<title>[\s\S]*?<\/title>/i, '');
          }
        }
      } catch (templateError) {
        console.error('Error fetching bill template for head:', templateError);
        setActionMessage({ type: 'error', text: 'Error: Could not fetch bill template for styles.'});
        setTimeout(() => setActionMessage(null), 5000);
         // Potentially throw error or return
      }
      
      // 3. Construct the full HTML for the new window
      let combinedBillsBodyContent = '';
      const parser = new DOMParser();
      billHtmlsArray.forEach((fullBillHtml: string) => {
        const doc = parser.parseFromString(fullBillHtml, 'text/html');
        const invoiceContainer = doc.querySelector('.invoice-container');
        if (invoiceContainer) {
            combinedBillsBodyContent += `<div class="bill-page">${invoiceContainer.outerHTML}</div>`;
        } else {
            const bodyContent = doc.body.innerHTML;
            if (bodyContent) {
                 combinedBillsBodyContent += `<div class="bill-page">${bodyContent}</div>`;
            }
        }
      });

      const finalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          ${templateHeadContent}
          <title>${companyNameForTitle || 'Invoices'}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .bill-page {
              page-break-after: always;
            }
            .bill-page:last-child {
              page-break-after: auto;
            }
            @media print {
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
               @page {
                size: A4;
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          ${combinedBillsBodyContent}
        </body>
        </html>
      `;

      // 4. Open in new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(finalHtml);
        printWindow.document.close();
        
        printWindow.onload = function() {
          printWindow.focus();
          printWindow.print();
          // printWindow.close(); // Optional: close after print
        };
        setActionMessage({ type: 'success', text: `Generated ${selectedBills.length} bill(s) for printing.` });
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        throw new Error('Failed to open print window. Check pop-up blocker.');
      }

    } catch (error) {
      console.error("Error creating PDF for printing:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setActionMessage({ type: 'error', text: `Failed to create PDF: ${errorMessage}` });
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setCreatingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (selectedBills.length === 0) {
      alert("Please select at least one bill to export to Excel.");
      return;
    }
    setExporting(true);
    try {
      const res = await fetch("/api/bills/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: selectedBills }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to export bills" }));
        throw new Error(errorData.error || "Failed to export bills to Excel");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bills-export.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setActionMessage({ type: "success", text: "Successfully exported selected bills to Excel." });
    } catch (error) {
      console.error("Error exporting bills to Excel:", error);
      setActionMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to export bills to Excel. Please try again." });
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCustomerName("");
    setBillNumberSearch("");
    if (billNumberInputRef.current) {
      billNumberInputRef.current.focus();
    } else if (customerNameInputRef.current) {
      customerNameInputRef.current.focus();
    }
  };

  const openDeleteDialog = (id: string) => {
    setBillToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setBillToDelete(null);
    setDeleteDialogOpen(false);
  };

  const filteredBills = bills;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => {
          if (billToDelete) handleDelete(billToDelete);
        }}
        title="Delete Bill"
        message="Are you sure you want to delete this bill? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />

      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20 print:hidden sticky top-0 z-30">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bills Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage and track all your billing records</p>
              </div>
            </div>
            <Link
              href="/dashboard/bills/new"
              className="inline-flex items-center px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:via-indigo-800 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 group min-w-[140px] justify-center"
            >
              <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="hidden sm:inline group-hover:tracking-wide transition-all duration-300">Create New Bill</span>
              <span className="sm:hidden group-hover:tracking-wide transition-all duration-300">Create Bill</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-3 sm:px-6 lg:px-8">
        {/* Statistics Widgets */}
        <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Bills Widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-indigo-600">Total Bills</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{bills.length}</p>
              </div>
            </div>
          </div>

          {/* Total Revenue Widget */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-emerald-600">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.total.toString()), 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Average Bill Value Widget */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-600">Avg Bill Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  ₹{bills.length > 0 ? (bills.reduce((sum, bill) => sum + parseFloat(bill.total.toString()), 0) / bills.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Bills Widget */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-purple-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-600">This Month</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bills.filter(bill => {
                    const billDate = new Date(bill.billDate);
                    const now = new Date();
                    return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Widgets */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tax Breakdown Widget */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tax Collection</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CGST + SGST</span>
                <span className="font-semibold text-gray-900">
                  ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.cgst.toString()) + parseFloat(bill.sgst.toString()), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">IGST</span>
                <span className="font-semibold text-gray-900">
                  ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.igst.toString()), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total Tax</span>
                  <span className="font-bold text-rose-600">
                    ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.cgst.toString()) + parseFloat(bill.sgst.toString()) + parseFloat(bill.igst.toString()), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Widget */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link 
                href="/dashboard/bills/new" 
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-700">Create New Bill</span>
              </Link>
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group w-full"
              >
                <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Performance Insights Widget */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unique Customers</span>
                <span className="font-semibold text-gray-900">
                  {new Set(bills.map(bill => bill.customer.name)).size}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">IGST Bills</span>
                <span className="font-semibold text-gray-900">
                  {bills.filter(bill => bill.isIGST).length}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Selected</span>
                  <span className="font-bold text-teal-600">{selectedBills.length} bills</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div 
          className={`p-4 mb-4 rounded-md ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          role="alert"
        >
          {actionMessage.text}
        </div>
      )}

      {deleteSuccess && (
        <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-green-100 via-green-50 to-green-100 border-l-4 border-green-500 text-green-800 rounded-lg shadow-lg animate-fade-in relative">
          <div className="flex items-center">
            <SuccessIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <span className="font-medium text-green-900">{deleteSuccess}</span>
          </div>
          <button
            className="absolute top-2 right-2 text-green-700 hover:text-green-900 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Dismiss success message"
            onClick={handleDismissSuccess}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

        {/* Enhanced Search and Filter Section */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-5 h-5 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <input 
                    type="text"
                    placeholder="Search bills by number or customer name..."
                    value={billNumberSearch || customerName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d/.test(value)) {
                        setBillNumberSearch(value);
                        setCustomerName("");
                      } else {
                        setCustomerName(value);
                        setBillNumberSearch("");
                      }
                    }}
                    className="block w-full pl-12 pr-12 py-3 bg-gradient-to-r from-white to-indigo-50/30 border border-indigo-200/50 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-sm"
                  />
                  {(billNumberSearch || customerName) && (
                    <button
                      onClick={() => {
                        setBillNumberSearch("");
                        setCustomerName("");
                      }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>{filteredBills.length} bills found</span>
                </div>
                {(startDate || endDate) && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Date filtered</span>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <input 
                  type="date" 
                  id="startDate"
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="block w-full px-4 py-3 bg-gradient-to-r from-white to-gray-50/30 border border-gray-200/50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <input 
                  type="date" 
                  id="endDate"
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="block w-full px-4 py-3 bg-gradient-to-r from-white to-gray-50/30 border border-gray-200/50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-sm"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-end">
                <button 
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Filters
                                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* NEW Export Actions Bar - Appears when bills are selected */}
        {selectedBills.length > 0 && (
          <div className="my-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={loading || filteredBills.length === 0}
                >
                  {selectedBills.length === filteredBills.length && filteredBills.length > 0 ? "Deselect All" : "Select All"}
                </button>
                <p className="text-sm text-gray-700">Selected: {selectedBills.length} / {filteredBills.length}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                    onClick={handleCreatePDF}
                    disabled={creatingPDF || loading || selectedBills.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creatingPDF ? (
                        <Spinner spinnerClassName="animate-spin h-5 w-5 text-white" className="-ml-1 mr-2" showText={false} />
                    ) : (
                        <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
                    )}
                    Export to PDF ({selectedBills.length})
                </button>
                <button
                    onClick={handleExportExcel}
                    disabled={exporting || loading || selectedBills.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <Spinner spinnerClassName="animate-spin h-5 w-5 text-white" className="-ml-1 mr-2" showText={false} />
                    ) : (
                        <TableIcon className="-ml-1 mr-2 h-5 w-5" />
                    )}
                    Export to Excel ({selectedBills.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20"><Spinner /></div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg"><p>{error}</p></div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Bills Found</h3>
            <p className="mt-1 text-sm text-gray-500">Adjust your filters or create a new bill.</p>
            <div className="mt-6">
              <Link href="/dashboard/bills/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <AddIcon className="-ml-1 mr-2 h-5 w-5" />Create New Bill
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Desktop Table View */}
            <div className="hidden lg:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden print:shadow-none print:rounded-none">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <tr>
                      <th scope="col" className="p-4 text-left">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                            onChange={handleSelectAll}
                            disabled={filteredBills.length === 0}
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bill #</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-amber-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</span>
                          <div className="w-5 h-5 bg-rose-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status</span>
                        </div>
                      </th>
                      <th scope="col" className="relative px-6 py-4 print:hidden">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</span>
                      </th>
                    </tr>
                  </thead>
                <tbody className="bg-white divide-y divide-gray-200 print:divide-none">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className={`${selectedBills.includes(bill.id) ? 'bg-indigo-50' : ''} hover:bg-gray-50 print:bg-transparent`}>
                      <td className="p-3 sm:p-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={selectedBills.includes(bill.id)}
                          onChange={() => handleSelectBill(bill.id)}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/dashboard/bills/${bill.id}`} className="text-indigo-600 hover:text-indigo-900">
                          {bill.billNumber}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(bill.billDate), "dd MMM yyyy")}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.customer.name}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{parseFloat(bill.total.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center print:hidden">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Generated {/* You might want a dynamic status here */}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                        <div className="flex items-center justify-end space-x-3">
                           <Link href={`/dashboard/bills/${bill.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Bill">
                            <ViewIcon className="h-5 w-5"/>
                          </Link>
                          <button onClick={() => openDeleteDialog(bill.id)} className="text-red-600 hover:text-red-900" title="Delete Bill">
                            <DeleteIcon className="h-5 w-5"/>
                          </button>
                          {/* Simple Kebab Menu for more actions if needed */}
                          {/* <Menu as="div" className="relative inline-block text-left">
                            <div>
                              <Menu.Button className="text-gray-400 hover:text-gray-600">
                                <KebabMenuIcon className="h-5 w-5" />
                              </Menu.Button>
                            </div>
                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <a href="#" className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm`}>
                                        Download PDF
                                      </a>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <a href="#" className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm`}>
                                        View Details
                                      </a>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            {/* Enhanced Mobile Card List View */}
            <div className="block lg:hidden"> {/* Show on small/medium screens, hide on lg and up */}
              <div className="space-y-4 px-2 py-2 sm:px-3"> {/* Adjusted padding */}
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3"> {/* items-start for better baseline align with checkbox, mb-3 */}
                      <div className="flex items-center"> {/* Group checkbox and Bill # */}
                        <input
                            type="checkbox"
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded mr-3" // Added mr-3
                            checked={selectedBills.includes(bill.id)}
                            onChange={() => handleSelectBill(bill.id)}
                          />
                        <Link href={`/dashboard/bills/${bill.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate">
                          Bill #{bill.billNumber}
                        </Link>
                      </div>
                       <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 whitespace-nowrap"> {/* Added py-0.5 and whitespace-nowrap */}
                        Generated {/* Dynamic status */}
                      </span>
                    </div>
                    
                    <div className="mb-1">
                      <p className="text-sm text-gray-500">Date: {format(new Date(bill.billDate), "dd MMM yyyy")}</p>
                      <p className="text-sm text-gray-800 font-medium truncate">To: {bill.customer.name}</p>
                    </div>
                    
                    <p className="text-md font-semibold text-gray-900 mb-3">
                      Amount: ₹{parseFloat(bill.total.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    
                    <div className="flex justify-end items-center space-x-2 border-t pt-3 mt-3"> {/* Reduced space-x, added mt-3 */}
                      <Link 
                        href={`/dashboard/bills/${bill.id}`} 
                        className="flex items-center text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150" 
                        title="View Bill"
                      >
                        <ViewIcon className="h-5 w-5"/>
                        <span className="ml-1.5 text-xs font-medium">View</span>
                      </Link>
                      <button 
                        onClick={() => openDeleteDialog(bill.id)} 
                        className="flex items-center text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors duration-150" 
                        title="Delete Bill"
                      >
                        <DeleteIcon className="h-5 w-5"/> 
                        <span className="ml-1.5 text-xs font-medium">Delete</span>
                      </button>
                       {/* Add other actions like Download PDF as needed */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    // </div>
  );
} 