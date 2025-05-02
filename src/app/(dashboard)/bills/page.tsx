"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlusCircle, FiEye, FiDownload, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

// Define bill type with customer
type Bill = {
  id: string;
  invoiceNo: string;
  date: Date;
  grandTotal: number;
  customer: {
    name: string;
  };
};

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bills");
      
      if (!response.ok) {
        throw new Error("Failed to fetch bills");
      }
      
      const data = await response.json();
      setBills(data.bills || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load bills");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bill");
      }

      // Refresh the list
      fetchBills();
    } catch (error) {
      console.error(error);
      setError("Failed to delete bill");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading bills...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bills</h1>
        <Link
          href="/bills/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlusCircle className="mr-2 -ml-1 h-5 w-5" />
          Create New Bill
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Invoice No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill: Bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{bill.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/bills/${bill.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/bills/${bill.id}/print`}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiDownload className="h-5 w-5" />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(bill.id)}
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">
              No bills found. Create your first bill!
            </p>
            <Link
              href="/bills/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlusCircle className="mr-2 -ml-1 h-5 w-5" />
              Create New Bill
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 