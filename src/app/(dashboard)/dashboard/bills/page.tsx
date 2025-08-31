"use client";

import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Transition } from "@headlessui/react";
import { LoadingSpinner } from "@/components/Spinner";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatsCard, QuickActionCard, EmptyState } from "@/components/ui";
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
  const [totalBillsCount, setTotalBillsCount] = useState(0);
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New state for debounced search
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchBillNumber, setSearchBillNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const billNumberInputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback((customerNameValue: string, billNumberValue: string) => {
    // Clear existing timeout
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    // Only search if we have at least 3 characters
    const hasValidSearch = (customerNameValue.length >= 3 || billNumberValue.length >= 3);
    
    if (hasValidSearch) {
      setIsSearching(true);
      const timeout = setTimeout(() => {
        setSearchCustomerName(customerNameValue);
        setSearchBillNumber(billNumberValue);
        setIsSearching(false);
      }, 1000); // 1000ms debounce delay
      
      setSearchDebounceTimeout(timeout);
    } else {
      // Clear search if less than 4 characters
      setSearchCustomerName("");
      setSearchBillNumber("");
      setIsSearching(false);
    }
  }, [searchDebounceTimeout]);

  useEffect(() => {
    fetchBills();
  }, [startDate, endDate, searchCustomerName, searchBillNumber]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
    };
  }, [searchDebounceTimeout]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");
      let url = "/api/bills";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (searchCustomerName) params.append("customerName", searchCustomerName);
      if (searchBillNumber) params.append("billNumber", searchBillNumber);
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

      // Fetch total count if no filters are applied
      if (!startDate && !endDate && !searchCustomerName && !searchBillNumber) {
        setTotalBillsCount(sortedBills.length);
      } else if (totalBillsCount === 0) {
        // If we haven't fetched total count yet, fetch it
        try {
          const totalRes = await fetch("/api/bills");
          if (totalRes.ok) {
            const totalData = await totalRes.json();
            setTotalBillsCount(totalData.length);
          }
        } catch (error) {
          console.error("Error fetching total bills count:", error);
        }
      }
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

  const handleExportTop10Bills = async () => {
    try {
      // Get the top 10 most recent bills
      const top10Bills = bills.slice(0, 10);
      
      if (top10Bills.length === 0) {
        setActionMessage({ type: 'error', text: "No bills available to export." });
        setTimeout(() => setActionMessage(null), 3000);
        return;
      }

      setCreatingPDF(true);
      setActionMessage(null);

      const billIds = top10Bills.map(bill => bill.id);

      // Fetch array of fully populated HTML strings for the top 10 bills
      const htmlResponse = await fetch("/api/bills/bulk-htmls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds }),
      });

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json().catch(() => ({ error: "Failed to fetch bill HTMLs"}));
        throw new Error(errorData.error || "Failed to fetch bill HTMLs");
      }
      const { htmls: billHtmlsArray, companyName: companyNameForTitle } = await htmlResponse.json();

      if (!billHtmlsArray || billHtmlsArray.length === 0) {
        throw new Error("No HTML content received for bills.");
      }

      // Fetch user's default template and profile
      let userTemplate = 'billFormat.html';
      let userProfile = null;
      try {
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          userTemplate = profileData.defaultTemplate || 'billFormat.html';
          userProfile = profileData;
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      // Fetch the base template to extract <head> content
      let templateHeadContent = '';
      try {
        const templateResponse = await fetch(`/api/templates/serve?template=${encodeURIComponent(userTemplate)}`);
        if (!templateResponse.ok) {
          console.error('Failed to fetch bill template for head. Status:', templateResponse.status);
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
      }
      
      // Construct the full HTML for the new window
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

      // Create the final HTML document
      const finalHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Top 10 Bills - ${companyNameForTitle || 'Company'}</title>
          ${templateHeadContent}
          <style>
            .bill-page {
              page-break-after: always;
            }
            .bill-page:last-child {
              page-break-after: auto;
            }
          </style>
        </head>
        <body>
          ${combinedBillsBodyContent}
        </body>
        </html>
      `;

      // Open the new window and write the HTML
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(finalHtml);
        newWindow.document.close();
        
        // Wait for content to load, then trigger print
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        };
        
        setActionMessage({ type: 'success', text: `PDF generation initiated for top ${top10Bills.length} bills.` });
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        throw new Error("Failed to open new window. Please check your popup blocker settings.");
      }
    } catch (error) {
      console.error("Error exporting top 10 bills:", error);
      setActionMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : "Failed to export bills. Please try again." 
      });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setCreatingPDF(false);
    }
  };

  const handleDownloadSingleBill = async (billId: string) => {
    try {
      // Fetch the HTML for the single bill
      const htmlResponse = await fetch("/api/bills/bulk-htmls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: [billId] }),
      });

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json().catch(() => ({ error: "Failed to fetch bill HTML"}));
        throw new Error(errorData.error || "Failed to fetch bill HTML");
      }
      
      const { htmls: billHtmlsArray, companyName: companyNameForTitle } = await htmlResponse.json();

      if (!billHtmlsArray || billHtmlsArray.length === 0) {
        throw new Error("No HTML content received for the bill.");
      }

      // Get the bill HTML
      const billHtml = billHtmlsArray[0];

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

      // Fetch the base template to extract <head> content
      let templateHeadContent = '';
      try {
        const templateResponse = await fetch(`/api/templates/serve?template=${encodeURIComponent(userTemplate)}`);
        if (templateResponse.ok) {
          const templateFullHtml = await templateResponse.text();
          const headMatch = templateFullHtml.match(/<head>([\s\S]*?)<\/head>/);
          if (headMatch && headMatch[1]) {
            let rawHeadContent = headMatch[1];
            templateHeadContent = rawHeadContent.replace(/<title>[\s\S]*?<\/title>/i, '');
          }
        }
      } catch (templateError) {
        console.error('Error fetching bill template for head:', templateError);
      }
      
      // Extract body content from the bill HTML
      let billBodyContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(billHtml, 'text/html');
      const invoiceContainer = doc.querySelector('.invoice-container');
      if (invoiceContainer) {
        billBodyContent = invoiceContainer.outerHTML;
      } else {
        billBodyContent = doc.body.innerHTML;
      }

      // Create the final HTML document
      const finalHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Bill - ${companyNameForTitle || 'Company'}</title>
          ${templateHeadContent}
        </head>
        <body>
          ${billBodyContent}
        </body>
        </html>
      `;

      // Open the new window and write the HTML
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(finalHtml);
        newWindow.document.close();
        
        // Wait for content to load, then trigger print
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        };
      } else {
        throw new Error("Failed to open new window. Please check your popup blocker settings.");
      }
    } catch (error) {
      console.error("Error downloading bill:", error);
      setActionMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : "Failed to download bill. Please try again." 
      });
      setTimeout(() => setActionMessage(null), 3000);
    }
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

      // 4. Create the final HTML document
      const finalHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Bills - ${companyNameForTitle || 'Company'}</title>
          ${templateHeadContent}
          <style>
            .bill-page {
              page-break-after: always;
            }
            .bill-page:last-child {
              page-break-after: auto;
            }
          </style>
        </head>
        <body>
          ${combinedBillsBodyContent}
        </body>
        </html>
      `;

      // 5. Open the new window and write the HTML
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(finalHtml);
        newWindow.document.close();
        
        // Wait for content to load, then trigger print
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        };
        
        setActionMessage({ type: 'success', text: `PDF generation initiated for ${selectedBills.length} bill(s).` });
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        throw new Error("Failed to open new window. Please check your popup blocker settings.");
      }
    } catch (error) {
      console.error("Error creating PDF:", error);
      setActionMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : "Failed to create PDF. Please try again." 
      });
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setCreatingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (selectedBills.length === 0) {
      setActionMessage({ type: 'error', text: "Please select at least one bill to export." });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    setExporting(true);
    setActionMessage(null);

    try {
      const response = await fetch("/api/bills/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: selectedBills }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errorData.error || "Failed to export bills");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `bills-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setActionMessage({ type: 'success', text: `Successfully exported ${selectedBills.length} bill(s) to Excel.` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setActionMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : "Failed to export to Excel. Please try again." 
      });
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCustomerName("");
    setBillNumberSearch("");
    setSearchCustomerName("");
    setSearchBillNumber("");
    setIsSearching(false);
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }
    if (customerNameInputRef.current) customerNameInputRef.current.value = "";
    if (billNumberInputRef.current) billNumberInputRef.current.value = "";
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

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading bills..." />
      </div>
    );
  }

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

      <PageHeader
        title="Bills"
        description="Manage and track all your billing records"
        icon={
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
        }
      >
            <Link
              href="/dashboard/bills/new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
            >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
          Create Bill
            </Link>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        {deleteSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                <p className="ml-3 text-sm font-medium text-emerald-800">{deleteSuccess}</p>
              </div>
              <button
                onClick={handleDismissSuccess}
                className="flex-shrink-0 ml-4 text-emerald-500 hover:text-emerald-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Action Message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-xl shadow-sm ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {actionMessage.type === 'success' ? (
                  <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="ml-3 text-sm font-medium">{actionMessage.text}</p>
              </div>
            </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <StatsCard
            title="Total Bills"
            value={bills.length}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            }
            iconBgColor="bg-blue-100"
          />

          <StatsCard
            title="Total Revenue"
            value={`₹${bills.reduce((sum, bill) => sum + parseFloat(bill.total.toString()), 0).toLocaleString('en-IN')}`}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            }
            iconBgColor="bg-emerald-100"
          />

          <StatsCard
            title="Average Bill Value"
            value={bills.length > 0 ? `₹${(bills.reduce((sum, bill) => sum + parseFloat(bill.total.toString()), 0) / bills.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            iconBgColor="bg-amber-100"
          />

          <StatsCard
            title="This Month"
            value={bills.filter(bill => {
                    const billDate = new Date(bill.billDate);
                    const now = new Date();
                    return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
                  }).length}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBgColor="bg-purple-100"
          />
              </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-xs sm:text-sm text-gray-500">Manage bills efficiently</p>
        </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Create New Bill"
              description="Generate invoice for customers"
              href="/dashboard/bills/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              }
              iconBgColor="bg-blue-50"
            />

            <QuickActionCard
              title="Add New Customer"
              description="Register new customer details"
              href="/dashboard/customers/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              iconBgColor="bg-green-50"
            />

            <div
              onClick={handleExportTop10Bills}
              className="group relative bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:bg-opacity-80 transition-colors bg-purple-50">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-gray-700 truncate">
                    Export Last 10 Bills
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Download last 10 created bills in PDF
                  </p>
                </div>
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
        </div>
      </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <input 
                    type="text"
                    placeholder="Search bills by number or customer name... (min 3 characters)"
                    value={billNumberSearch || customerName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d/.test(value)) {
                        setBillNumberSearch(value);
                        setCustomerName("");
                        debouncedSearch("", value);
                      } else {
                        setCustomerName(value);
                        setBillNumberSearch("");
                        debouncedSearch(value, "");
                      }
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {(billNumberSearch || customerName) && (
                    <button
                      onClick={() => {
                        setBillNumberSearch("");
                        setCustomerName("");
                        setSearchCustomerName("");
                        setSearchBillNumber("");
                        setIsSearching(false);
                        if (searchDebounceTimeout) {
                          clearTimeout(searchDebounceTimeout);
                        }
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{filteredBills.length} bills</span>
                </div>
                {isSearching && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Searching...</span>
                  </div>
                )}
                {(searchCustomerName || searchBillNumber) && !isSearching && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    <span>Filtered</span>
                  </div>
                )}
                {(billNumberSearch || customerName) && (billNumberSearch.length < 4 && customerName.length < 4) && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Type at least 3 characters</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Advanced Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input 
                  type="date" 
                  id="startDate"
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input 
                  type="date" 
                  id="endDate"
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors text-gray-900"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-end">
                <button 
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Filters
                                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions Bar - Appears when bills are selected */}
        {selectedBills.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creatingPDF ? (
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                    ) : (
                          <DownloadIcon className="w-4 h-4 mr-2" />
                    )}
                    Export to PDF ({selectedBills.length})
                </button>
                <button
                    onClick={handleExportExcel}
                    disabled={exporting || loading || selectedBills.length === 0}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                    ) : (
                          <TableIcon className="w-4 h-4 mr-2" />
                    )}
                    Export to Excel ({selectedBills.length})
                </button>
              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bills</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchBills}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        ) : filteredBills.length === 0 ? (
          <EmptyState
            title="No Bills Found"
            description="Get started by creating your first bill or adjust your search filters."
            action={{
              label: "Create Bill",
              onClick: () => window.location.href = "/dashboard/bills/new"
            }}
            icon={
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Card>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Bills Directory
                  </h3>
                </div>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="p-4 text-left">
                          <input
                            type="checkbox"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                            onChange={handleSelectAll}
                            disabled={filteredBills.length === 0}
                          />
                      </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bill Number
                      </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                      </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                      </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                      </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                      </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Download
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.map((bill) => (
                        <tr key={bill.id} className={`${selectedBills.includes(bill.id) ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}>
                          <td className="p-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedBills.includes(bill.id)}
                          onChange={() => handleSelectBill(bill.id)}
                        />
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link href={`/dashboard/bills/${bill.id}`} className="text-blue-600 hover:text-blue-900 transition-colors">
                          {bill.billNumber}
                        </Link>
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(bill.billDate), "dd MMM yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bill.customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            ₹{parseFloat(bill.total.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Generated
                        </span>
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDownloadSingleBill(bill.id)}
                              className="inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Download Bill"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === bill.id ? null : bill.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            >
                              <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {openMenuId === bill.id && (
                              <div
                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-100"
                                role="menu"
                                onMouseLeave={() => setOpenMenuId(null)}
                              >
                                <div className="py-1" role="none">
                                  <Link
                                    href={`/dashboard/bills/${bill.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    role="menuitem"
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Bill
                          </Link>
                                  <button
                                    onClick={() => { openDeleteDialog(bill.id); setOpenMenuId(null); }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    role="menuitem"
                                  >
                                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Bill
                          </button>
                            </div>
                                </div>
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </Card>
          </div>

            {/* Mobile Card List View */}
            <div className="block lg:hidden space-y-4">
                {filteredBills.map((bill) => (
                <Card key={bill.id} className={selectedBills.includes(bill.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-grow min-w-0">
                        <input
                            type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={selectedBills.includes(bill.id)}
                            onChange={() => handleSelectBill(bill.id)}
                          />
                        <div className="flex-grow min-w-0">
                          <Link href={`/dashboard/bills/${bill.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors block truncate">
                          Bill #{bill.billNumber}
                        </Link>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                            Generated
                      </span>
                    </div>
                    </div>
                      <div className="relative flex-shrink-0 ml-2">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === bill.id ? null : bill.id)}
                          className="p-2.5 sm:p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors touch-manipulation"
                        >
                          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {openMenuId === bill.id && (
                          <div
                            className="origin-top-right absolute right-0 mt-2 w-40 sm:w-44 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-gray-100"
                            role="menu"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <div className="py-1" role="none">
                      <Link 
                        href={`/dashboard/bills/${bill.id}`} 
                                className="flex items-center px-3 py-2.5 sm:py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors touch-manipulation"
                                role="menuitem"
                                onClick={() => setOpenMenuId(null)}
                      >
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                      </Link>
                      <button 
                                onClick={() => { openDeleteDialog(bill.id); setOpenMenuId(null); }}
                                className="flex items-center w-full px-3 py-2.5 sm:py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors touch-manipulation"
                                role="menuitem"
                      >
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                      </button>
                    </div>
                  </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 space-y-1">
                      <p className="text-sm text-gray-500">Date: {format(new Date(bill.billDate), "dd MMM yyyy")}</p>
                      <p className="text-sm text-gray-800 font-medium">Customer: {bill.customer.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900">
                          Amount: ₹{parseFloat(bill.total.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <button
                          onClick={() => handleDownloadSingleBill(bill.id)}
                          className="inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Download Bill"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    

                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Results Summary */}
            <div className="mt-4 sm:mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  <span className="hidden sm:inline">Showing </span>
                  <span className="font-bold text-blue-600">{filteredBills.length}</span>
                  <span className="hidden sm:inline"> of </span>
                  <span className="sm:hidden">/</span>
                  <span className="font-bold">{totalBillsCount}</span>
                  <span className="hidden sm:inline"> bills</span>
                  {(billNumberSearch || customerName) && (
                    <span className="ml-1 hidden sm:inline">
                      matching "<span className="font-semibold text-blue-600">{billNumberSearch || customerName}</span>"
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 