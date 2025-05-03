"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  address: string;
  deliveryAddress: string;
  gstNo: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Failed to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete customer");
        }

        setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      } catch (error) {
        console.error("Error deleting customer:", error);
        setError("Failed to delete customer. Please try again.");
      }
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <Link
            href="/dashboard/customers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Customer
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center">
              <p className="text-gray-500">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          ) : customers.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No customers
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new customer.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/customers/new"
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
                  Add Customer
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <li key={customer.id}>
                    <div className="px-4 py-4 flex items-center sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex text-sm">
                            <p className="font-medium text-indigo-600 truncate">
                              {customer.name}
                            </p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                              {customer.gstNo}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <p>{customer.address}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex-shrink-0 sm:mt-0">
                          <div className="flex space-x-4">
                            <Link
                              href={`/dashboard/customers/edit/${customer.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(customer.id)}
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