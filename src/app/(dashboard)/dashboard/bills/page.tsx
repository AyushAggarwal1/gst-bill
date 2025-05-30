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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
      alert("Please select at least one bill to export to PDF.");
      return;
    }
    setCreatingPDF(true);
    console.log("Selected bill IDs for PDF export:", selectedBills);
    alert(`Selected ${selectedBills.length} bill(s) for PDF export. Actual batch PDF generation is a work in progress.`);
    setTimeout(() => {
      setCreatingPDF(false);
    }, 1000);
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 p-4 bg-white shadow rounded-lg print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="hidden md:block">
              <label htmlFor="billNumberSearchDesktop" className="block text-sm font-medium text-gray-700">Bill Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="billNumberSearchDesktop"
                  id="billNumberSearchDesktop"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search bill #"
                  value={billNumberSearch}
                  onChange={(e) => setBillNumberSearch(e.target.value)}
                  ref={billNumberInputRef}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="customerNameDesktop" className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input type="text" id="customerNameDesktop" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Filter by customer" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" ref={customerNameInputRef}/>
            </div>
            <div>
              <label htmlFor="startDateDesktop" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" id="startDateDesktop" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
            </div>
            <div>
              <label htmlFor="endDateDesktop" className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" id="endDateDesktop" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
            </div>
          </div>
          <div className="md:hidden mt-4">
            <div className="mb-2">
                <label htmlFor="billNumberSearchMobile" className="block text-sm font-medium text-gray-700">Bill Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="billNumberSearchMobile"
                        id="billNumberSearchMobile"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search bill #"
                        value={billNumberSearch}
                        onChange={(e) => setBillNumberSearch(e.target.value)}
                    />
                </div>
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

          <div className={`mt-4 flex flex-col sm:flex-row items-center ${isMobileFiltersOpen || 'md:justify-end'} md:justify-between gap-3`}>
            <button onClick={() => { handleClearFilters(); if(isMobileFiltersOpen) setIsMobileFiltersOpen(false); }} type="button" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <ClearFilterIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />Clear All Filters
            </button>
            <div className="w-full sm:w-auto">
                <button
                    onClick={handleCreatePDF}
                    disabled={selectedBills.length === 0 || creatingPDF || loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creatingPDF ? (
                        <Spinner spinnerClassName="animate-spin h-5 w-5 text-white" className="-ml-1 mr-2" showText={false} />
                    ) : (
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm0 2h10v3H5V4zm0 5h10v2H5V9zm0 4h10v2H5v-2z" clipRule="evenodd" /></svg>
                    )}
                    Export to PDF ({selectedBills.length})
                </button>
            </div>
          </div>
        </div>

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
          <div className="bg-white shadow-md sm:rounded-lg overflow-x-auto print:shadow-none print:rounded-none">
            {filteredBills.length > 0 && (
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-start gap-3 print:hidden">
                   <p className="text-sm text-gray-700">Selected: {selectedBills.length} / {filteredBills.length}</p>
                </div>
            )}
            <table className="min-w-full divide-y divide-gray-200 print:divide-none">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="p-4 text-left">
                    <input
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                      onChange={handleSelectAll}
                      disabled={filteredBills.length === 0}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className={`${selectedBills.includes(bill.id) ? 'bg-indigo-50' : ''} hover:bg-gray-50`}>
                    <td className="p-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleSelectBill(bill.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                      <Link href={`/dashboard/bills/${bill.id}`}>{bill.billNumber}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(bill.billDate), "dd MMM yyyy")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{bill.isIGST ? "IGST" : "CGST/SGST"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{bill.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
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
        )}
      </main>
    </div>
  );
} 