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
      setBills(data);
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
    <div className="min-h-screen bg-gray-50">
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

      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
            <Link
              href="/dashboard/bills/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AddIcon className="-ml-1 mr-2 h-5 w-5" />
              Create Bill
            </Link>
          </div>
        </div>
      </header>

      {actionMessage && (
        <div 
          className={`p-4 mb-4 rounded-md ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          role="alert"
        >
          {actionMessage.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 p-4 bg-white shadow rounded-lg print:hidden">
          {/* Desktop Filters */}
          <div className="hidden md:block"> {/* Wrapper for desktop filters and their clear button */}
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 md:grid-cols-4 items-end">
              <div>
                <label htmlFor="billNumberSearchDesktop" className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                  <input ref={billNumberInputRef} type="text" name="billNumberSearchDesktop" id="billNumberSearchDesktop" placeholder="Search Bill #" value={billNumberSearch} onChange={(e) => setBillNumberSearch(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="customerNameDesktop" className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input ref={customerNameInputRef} type="text" name="customerNameDesktop" id="customerNameDesktop" placeholder="Filter by Customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="startDateDesktop" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" name="startDateDesktop" id="startDateDesktop" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="endDateDesktop" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" name="endDateDesktop" id="endDateDesktop" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
            <div className="mt-4 flex justify-end"> {/* Clear button for desktop */}
              <button onClick={() => { handleClearFilters(); }} type="button" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <ClearFilterIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />Clear All Filters
              </button>
            </div>
          </div>

          {/* Mobile Filter Header & Toggle */}
          <div className="md:hidden mt-4">
            <div className="mb-2">
              <label htmlFor="billNumberSearchMobile" className="block text-sm font-medium text-gray-700 mb-1">Search Bill Number</label>
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400"/></div>
                <input type="text" name="billNumberSearchMobile" id="billNumberSearchMobile" placeholder="Enter Bill No." value={billNumberSearch} onChange={(e) => setBillNumberSearch(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
            <button onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)} className="w-full flex items-center justify-center mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FilterIcon className="mr-2 h-5 w-5 text-gray-400" />{isMobileFiltersOpen ? "Hide Advanced Filters" : "Show Advanced Filters"}{isMobileFiltersOpen ? <ChevronUpIcon className="ml-2 h-5 w-5" /> : <ChevronDownIcon className="ml-2 h-5 w-5" />}
            </button>
          </div>
          
          {/* Collapsible Mobile Filters Panel */}
          <Transition show={isMobileFiltersOpen} as={Fragment} enter="transition ease-out duration-200 transform" enterFrom="opacity-0 -translate-y-5" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150 transform" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-5">
            <div className="mt-4 md:hidden border-t border-gray-200 pt-4 space-y-4">
              <div>
                <label htmlFor="customerNameMobile" className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input type="text" name="customerNameMobile" id="customerNameMobile" placeholder="Filter by Customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="startDateMobile" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" name="startDateMobile" id="startDateMobile" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="endDateMobile" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" name="endDateMobile" id="endDateMobile" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div className="flex justify-end"> {/* Clear button for mobile */}
                <button onClick={() => { handleClearFilters(); if(isMobileFiltersOpen) setIsMobileFiltersOpen(false); }} type="button" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <ClearFilterIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />Clear All Filters
                </button>
              </div>
            </div>
          </Transition>
        </div>

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
          <div> {/* Wrapper for Desktop Table and Mobile Card List */}
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md sm:rounded-lg overflow-x-auto print:shadow-none print:rounded-none">
              <table className="min-w-full divide-y divide-gray-200 print:divide-none">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="p-3 sm:p-4 text-left"> {/* Adjusted padding */}
                      <input
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                        onChange={handleSelectAll}
                        disabled={filteredBills.length === 0}
                      />
                    </th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Type</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className={`${selectedBills.includes(bill.id) ? 'bg-indigo-50' : ''} hover:bg-gray-50`}>
                      <td className="p-3 sm:p-4 whitespace-nowrap"> {/* Adjusted padding */}
                        <input
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={selectedBills.includes(bill.id)}
                          onChange={() => handleSelectBill(bill.id)}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        <Link href={`/dashboard/bills/${bill.id}`}>{bill.billNumber}</Link>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(bill.billDate), "dd MMM yyyy")}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-normal break-words text-sm text-gray-500">{bill.customer.name}</td> {/* Added whitespace-normal and break-words */} 
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{bill.isIGST ? "IGST" : "CGST/SGST"}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{bill.total.toFixed(2)}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link href={`/dashboard/bills/${bill.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3" title="View Bill">
                          <SearchIcon className="h-5 w-5 inline"/>
                        </Link>
                        <button onClick={() => openDeleteDialog(bill.id)} className="text-red-600 hover:text-red-900" title="Delete Bill">
                          <DeleteIcon className="h-5 w-5 inline"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden bg-white shadow sm:rounded-lg">
              {/* Mobile List Header */}
              <div className="flex items-center p-4 border-b border-gray-200">
                <div className="mr-3 flex-shrink-0 w-4">{/* Spacer for checkbox alignment */}</div>
                {/* Updated to flex with specific widths */}
                <div className="flex flex-1 items-center">
                  <span className="w-1/4 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Bill #</span>
                  <span className="w-1/3 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Date</span>
                  <span className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider truncate">Customer</span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className={`p-4 ${selectedBills.includes(bill.id) ? 'bg-indigo-50' : 'bg-white'} hover:bg-gray-50`}>
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        <input
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={selectedBills.includes(bill.id)}
                          onChange={() => handleSelectBill(bill.id)}
                        />
                      </div>
                      {/* Updated to flex with specific widths aligning with header */}
                      <div className="flex flex-1 items-center">
                        <Link href={`/dashboard/bills/${bill.id}`} className="w-1/4 pr-2 text-sm font-medium text-indigo-600 hover:text-indigo-900 truncate">
                          {bill.billNumber}
                        </Link>
                        <span className="w-1/3 pr-2 text-sm text-gray-500 truncate">{format(new Date(bill.billDate), "dd MMM yy")}</span>
                        <span className="flex-1 text-sm text-gray-500 truncate">{bill.customer.name}</span>
                      </div>
                      {/* Actions can be added here if needed, e.g., a Kebab menu */}
                    </div>
                    <div className="mt-2 pl-7"> {/* Aligned with data, under checkbox area */}
                        <p className="text-sm text-gray-700 font-semibold">Total: <span className="font-normal text-gray-600">₹{bill.total.toFixed(2)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 