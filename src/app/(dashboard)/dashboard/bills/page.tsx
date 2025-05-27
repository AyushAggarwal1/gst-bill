"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [creatingPDF, setCreatingPDF] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBills();
  }, [startDate, endDate, customerName]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      let url = "/api/bills";
      
      // Add filter parameters if they exist
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (customerName) params.append("customerName", customerName);
      
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
      const res = await fetch("/api/bills/pdf-merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billIds: selectedBills }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create PDF");
      }

      // Convert the response to a blob and download it
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get filename from response headers or create a default one
      const contentDisposition = res.headers.get('content-disposition');
      let filename = 'bills.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error creating PDF:", error);
      alert("Failed to create PDF. Please try again.");
    } finally {
      setCreatingPDF(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setBillToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
            <div className="flex space-x-3">
              {selectedBills.length > 0 && (
                <>
                  <button
                    onClick={handleCreatePDF}
                    disabled={creatingPDF || exporting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {creatingPDF ? "Creating PDF..." : `Create PDF (${selectedBills.length})`}
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={exporting || creatingPDF}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {exporting ? "Exporting..." : `Export Excel (${selectedBills.length})`}
                  </button>
                </>
              )}
              <Link
                href="/dashboard/bills/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Bill
              </Link>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-4 flex flex-col sm:flex-row items-end sm:space-x-4 space-y-4 sm:space-y-0">
            {/* Customer Name Filter */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                placeholder="Search by customer"
              />
            </div>
            
            {/* Existing Date filters */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 placeholder-gray-500"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 placeholder-gray-500"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setCustomerName("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center">
              <p className="text-gray-500">Loading bills...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No bills found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {startDate || endDate || customerName 
                  ? "No bills found for the selected filters."
                  : "Get started by creating a new bill."}
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/bills/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create Bill
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {bills.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedBills.length === bills.length}
                      onChange={handleSelectAll}
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      {selectedBills.length === 0 
                        ? 'Select all' 
                        : `${selectedBills.length} of ${bills.length} selected`}
                    </span>
                  </div>
                </div>
              )}
              <ul className="divide-y divide-gray-200">
                {bills.map((bill) => (
                  <li key={bill.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 flex items-center sm:px-6">
                      <div className="mr-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedBills.includes(bill.id)}
                          onChange={() => handleSelectBill(bill.id)}
                        />
                      </div>
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex text-sm">
                            <p className="font-medium text-indigo-600 truncate">
                              Bill #{bill.billNumber}
                            </p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                              {format(new Date(bill.billDate), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500 mr-4">
                              <p>Customer: {bill.customer.name}</p>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <p>
                                Tax Type: {bill.isIGST ? "IGST" : "CGST/SGST"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500 mr-4">
                              <p>
                                Total: ₹{bill.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex-shrink-0 sm:mt-0">
                          <div className="flex space-x-4">
                            <Link
                              href={`/dashboard/bills/${bill.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => openDeleteDialog(bill.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 