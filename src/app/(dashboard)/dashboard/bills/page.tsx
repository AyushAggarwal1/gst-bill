"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

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

  useEffect(() => {
    fetchBills();
  }, [startDate, endDate]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      let url = "/api/bills";
      
      // Add date range parameters if they exist
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch bills");
      }
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      try {
        const res = await fetch(`/api/bills/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete bill");
        }

        setBills((prev) => prev.filter((bill) => bill.id !== id));
      } catch (error) {
        console.error("Error deleting bill:", error);
        setError("Failed to delete bill. Please try again.");
      }
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
            <Link
              href="/dashboard/bills/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Bill
            </Link>
          </div>
          
          {/* Date Range Filter */}
          <div className="mt-4 flex flex-col sm:flex-row items-end sm:space-x-4 space-y-4 sm:space-y-0">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
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
                {startDate || endDate 
                  ? "No bills found for the selected date range."
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
              <ul className="divide-y divide-gray-200">
                {bills.map((bill) => (
                  <li key={bill.id}>
                    <div className="px-4 py-4 flex items-center sm:px-6">
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
                              onClick={() => handleDelete(bill.id)}
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