"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";
import { format } from "date-fns";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Transition } from "@headlessui/react";

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
  const [exporting, setExporting] = useState(false);
  const [creatingPDF, setCreatingPDF] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Add a ref for the customer name input to focus after clearing
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const billNumberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBills();
  }, [startDate, endDate, customerName, billNumberSearch]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      let url = "/api/bills";
      
      // Add filter parameters if they exist
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (customerName) params.append("customerName", customerName);
      if (billNumberSearch) params.append("billNumber", billNumberSearch);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch bills");
      }
      const data = await res.json();
      setBills(data);
      // Clear selected bills when filter changes
      setSelectedBills([]);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete bill");
      }

      setBills((prev) => prev.filter((bill) => bill.id !== id));
      setSelectedBills((prev) => prev.filter((billId) => billId !== id));
    } catch (error) {
      console.error("Error deleting bill:", error);
      setError("Failed to delete bill. Please try again.");
    }
  };

  const handleSelectBill = (id: string) => {
    setSelectedBills((prev) => {
      if (prev.includes(id)) {
        return prev.filter((billId) => billId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(bills.map((bill) => bill.id));
    }
  };

  const handleExportExcel = async () => {
    if (selectedBills.length === 0) {
      alert("Please select at least one bill to export");
      return;
    }

    try {
      setExporting(true);
      const res = await fetch("/api/bills/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: selectedBills }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to export bills");
      }

      // Convert the response to a blob and download it
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bills-export.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting bills:", error);
      alert("Failed to export bills. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // @ayushaggarwal1 -- function used to create pdf of the multi selected bills
  const handleCreatePDF = async () => {
    if (selectedBills.length === 0) {
      alert("Please select at least one bill to create PDF");
      return;
    }

    try {
      setCreatingPDF(true);

      // 1. Fetch array of fully populated HTML strings for each selected bill
      const htmlResponse = await fetch("/api/bills/bulk-htmls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: selectedBills }),
      });

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json();
        throw new Error(errorData.error || "Failed to fetch bill HTMLs");
      }
      const { htmls: billHtmlsArray, companyName: companyNameForTitle } = await htmlResponse.json();

      if (!billHtmlsArray || billHtmlsArray.length === 0) {
        throw new Error("No HTML content received for selected bills.");
      }

      // 2. Fetch the base template to extract <head> content (styles, meta, title)
      let templateHeadContent = '';
      try {
        const templateResponse = await fetch('/templates/billFormat.html'); // Adjusted path
        if (!templateResponse.ok) {
          console.error('Failed to fetch bill template for head. Status:', templateResponse.status);
          alert('Error: Could not load the bill template styles.');
          // Fallback or decide how to proceed if template head is crucial
        } else {
          const templateFullHtml = await templateResponse.text();
          const headMatch = templateFullHtml.match(/<head>([\s\S]*?)<\/head>/);
          if (headMatch && headMatch[1]) {
            let rawHeadContent = headMatch[1];
            // Remove any existing <title>...</title> tag from the raw head content
            templateHeadContent = rawHeadContent.replace(/<title>[\s\S]*?<\/title>/i, '');
          }
        }
      } catch (error) {
        console.error('Error fetching bill template for head:', error);
        alert('Error: Could not fetch the bill template for styles.');
      }
      
      // 3. Construct the full HTML for the new window
      // Extract only the .invoice-container (or body content) from each billHTML
      let combinedBillsBodyContent = '';
      const parser = new DOMParser();
      billHtmlsArray.forEach((fullBillHtml: string) => {
        const doc = parser.parseFromString(fullBillHtml, 'text/html');
        const invoiceContainer = doc.querySelector('.invoice-container');
        if (invoiceContainer) {
            combinedBillsBodyContent += `<div class="bill-page">${invoiceContainer.outerHTML}</div>`;
        } else {
            // Fallback if .invoice-container is not found, maybe add the whole body
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
            /* Add styles for page breaks if not already in templateHeadContent or to ensure they are applied */
            body {
              /* Ensure Inter font is loaded if not already handled by template styles */
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .bill-page {
              page-break-after: always;
            }
            .bill-page:last-child {
              page-break-after: auto;
            }
            /* Ensure @media print styles from original template are effective */
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
      } else {
        alert('Failed to open print window. Please check your browser\'s pop-up blocker settings.');
      }

    } catch (error) {
      console.error("Error creating PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Failed to create PDF: ${errorMessage}`);
    } finally {
      setCreatingPDF(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCustomerName("");
    setBillNumberSearch("");
    if(billNumberInputRef.current) {
      billNumberInputRef.current.focus();
    } else if (customerNameInputRef.current) {
      customerNameInputRef.current.focus();
    }
    // fetchBills() will be called by the useEffect due to state changes
  };

  const openDeleteDialog = (id: string) => {
    setBillToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setBillToDelete(null);
        }}
        onConfirm={() => {
          if (billToDelete) {
            handleDelete(billToDelete);
          }
        }}
        title="Delete Bill"
        message="Are you sure you want to delete this bill? This action cannot be undone."
      />

      {/* Page Header */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
            <Link
              href="/dashboard/bills/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Bill
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="bg-white shadow sm:rounded-lg p-4 md:p-6 mb-6 print:hidden">
          <h2 className="text-lg font-medium text-gray-900 mb-4 md:block hidden">Filters</h2>
          
          {/* Mobile Filter Header - Bill No Search and Toggle Button */}
          <div className="md:hidden mb-4">
            <label htmlFor="billNumberSearchMobile" className="block text-sm font-medium text-gray-700 mb-1">
              Search Bill Number
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  ref={billNumberInputRef}
                  type="text"
                  name="billNumberSearchMobile"
                  id="billNumberSearchMobile"
                  placeholder="Enter Bill No."
                  value={billNumberSearch}
                  onChange={(e) => setBillNumberSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button 
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                aria-label="Toggle more filters"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75m-9.75 6h9.75M3.75 6.75h1.5M3.75 12h1.5m-2.25 5.25h1.5M6 6l-1.5-1.5M6 12l-1.5-1.5M6 18l-1.5-1.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Filters Grid - Hidden on small screens by default then shown by md:grid */}
          <div className="hidden md:grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 md:grid-cols-4 items-end">
            {/* Bill Number Filter - For Desktop */}
            <div className="sm:col-span-1 md:col-span-1">
              <label htmlFor="billNumberSearchDesktop" className="block text-sm font-medium text-gray-700 mb-1">
                Bill Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="billNumberSearchDesktop"
                  id="billNumberSearchDesktop"
                  placeholder="Search by bill no."
                  value={billNumberSearch}
                  onChange={(e) => setBillNumberSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            {/* Customer, Date, Clear Filters for Desktop... (rest of the desktop filters) */}
            {/* Customer Name Filter */}
            <div className="sm:col-span-1 md:col-span-1">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  ref={customerNameInputRef}
                  type="text"
                  name="customerName"
                  id="customerName"
                  placeholder="Search by customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Start Date Filter */}
            <div className="sm:col-span-1 md:col-span-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* End Date Filter */}
            <div className="sm:col-span-1 md:col-span-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Clear Filters Button - Desktop */}
             <div className="sm:col-span-4 md:col-span-4 flex items-end justify-end pt-2">
                <button
                    onClick={handleClearFilters}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Clear All Filters
                </button>
            </div>
          </div>

          {/* Collapsible Mobile Filters Panel */}
          <Transition
            show={isMobileFiltersOpen}
            as={Fragment}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 -translate-y-5"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150 transform"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-5"
          >
            <div className="mt-4 md:hidden border-t border-gray-200 pt-4 space-y-4">
              {/* Customer Name Filter - Mobile */}
              <div>
                <label htmlFor="customerNameMobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                       <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                     </svg>
                   </div>
                  <input
                    type="text"
                    name="customerNameMobile"
                    id="customerNameMobile"
                    placeholder="Search by customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Start Date Filter - Mobile */}
              <div>
                <label htmlFor="startDateMobile" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="startDateMobile"
                  id="startDateMobile"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* End Date Filter - Mobile */}
              <div>
                <label htmlFor="endDateMobile" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="endDateMobile"
                  id="endDateMobile"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Clear Filters Button - Mobile */}
              <div className="flex justify-end pt-2">
                  <button
                      onClick={() => { handleClearFilters(); setIsMobileFiltersOpen(false); }}
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Clear All Filters
                  </button>
              </div>
            </div>
          </Transition>
        </div>

        {/* Bills List / Empty State */}
        <div className="px-4 py-0 sm:px-0">
          {loading ? (
            <div className="text-center py-10">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading bills...</p>
            </div>
          ) : error ? (
            <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-16">
              <svg 
                className="mx-auto h-16 w-16 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h2m-2 2h2m-2 2h2M9 9h2m-2 2h2m-2 2h2" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-800">
                {customerName || startDate || endDate || billNumberSearch ? 'No Bills Found Matching Filters' : 'No Bills Yet'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {customerName || startDate || endDate || billNumberSearch ? 'Try adjusting your search criteria or clear the filters.' : 'Get started by creating a new bill.'}
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard/bills/new"
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Bill
                </Link>
              </div>
            </div>
          ) : (
            // Bills Table will go here
            <div className="bg-white shadow-md sm:rounded-lg overflow-x-auto print:shadow-none print:rounded-none">
              {/* Action buttons for selected bills - only show if bills exist */}
              {bills.length > 0 && (
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-start gap-3 print:hidden">
                   <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={loading || bills.length === 0}
                  >
                    {selectedBills.length === bills.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={selectedBills.length === 0 || exporting || loading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting ? (
                        <><svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Exporting...</>
                    ) : (
                        <><svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 3a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V4a1 1 0 00-1-1h-1z" /><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>Export Selected (Excel)</>
                    )}
                  </button>
                  <button
                    onClick={handleCreatePDF}
                    disabled={selectedBills.length === 0 || creatingPDF || loading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingPDF ? (
                       <><svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating PDF...</>
                    ) : (
                        <><svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm0 2h10v3H5V4zm0 5h10v2H5V9zm0 4h10v2H5v-2z" clipRule="evenodd" /></svg>Create Selected (PDF)</>
                    )}
                  </button>
                  {selectedBills.length > 0 && (
                    <p className="text-xs text-gray-600 ml-auto">{selectedBills.length} bill(s) selected</p>
                  )}
                </div>
              )}

              <table className="min-w-full divide-y divide-gray-200 print:divide-none">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(bill.billDate), "dd/MM/yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.isIGST ? "IGST" : "CGST/SGST"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{bill.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/bills/${bill.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openDeleteDialog(bill.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 