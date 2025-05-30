"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { format } from 'date-fns';
import ConfirmDialog from "@/components/ConfirmDialog";
import Spinner from "@/components/Spinner";
import { AddIcon, EditIcon, DeleteIcon, KebabMenuIcon } from "@/components/icons";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await res.json();
      // Sort customers alphabetically by name
      const sortedCustomers = data.sort((a: Customer, b: Customer) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setCustomers(sortedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.gstNo && customer.gstNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openDeleteDialog = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={() => {
          if (customerToDelete) {
            handleDelete(customerToDelete);
          }
        }}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone and will also delete all associated bills."
      />

      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <Link
              href="/dashboard/customers/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AddIcon />
              Add Customer
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="px-4 mb-6 sm:px-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Search customers by name, GST No, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="px-4 py-0 sm:px-0"> {/* Adjusted py-6 to py-0 here as search bar has mb-6 */}
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
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
                {searchTerm ? 'No Customers Found' : 'No Customers Yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms or add a new customer.' : 'Get started by adding a new customer.'}
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard/customers/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <AddIcon />
                  Add Customer
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block bg-white shadow-md sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST No</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th scope="col" className="relative px-1 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.name}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.gstNo || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-normal text-sm text-gray-500 break-words">
                          {customer.address || 'N/A'}
                        </td>
                        <td className="px-1 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                          >
                            <KebabMenuIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          {openMenuId === customer.id && (
                            <div
                              className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="menu-button"
                              onMouseLeave={() => setOpenMenuId(null)}
                            >
                              <div className="py-1" role="none">
                                <Link
                                  href={`/dashboard/customers/edit/${customer.id}`}
                                  className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-4 py-2 text-sm w-full text-left"
                                  role="menuitem"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <EditIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => { openDeleteDialog(customer.id); setOpenMenuId(null); }}
                                  className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-4 py-2 text-sm w-full text-left"
                                  role="menuitem"
                                >
                                  <DeleteIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                  Delete
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

              {/* Mobile Card View - Hidden on md and up */}
              <div className="block md:hidden space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white shadow rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
                        {customer.gstNo && (
                           <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">GST:</span> {customer.gstNo}
                          </p>
                        )}
                        {customer.address && (
                          <p className="text-sm text-gray-600 mt-1">
                             <span className="font-medium">Address:</span> {customer.address}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                          className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                        >
                          <KebabMenuIcon className="h-5 w-5 text-gray-500" />
                        </button>
                        {openMenuId === customer.id && (
                          <div
                            className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20" // Increased z-index
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby={`menu-button-${customer.id}`}
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <div className="py-1" role="none">
                              <Link
                                href={`/dashboard/customers/edit/${customer.id}`}
                                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-4 py-2 text-sm w-full text-left"
                                role="menuitem"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <EditIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                Edit
                              </Link>
                              <button
                                onClick={() => { openDeleteDialog(customer.id); setOpenMenuId(null); }}
                                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-4 py-2 text-sm w-full text-left"
                                role="menuitem"
                              >
                                <DeleteIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 