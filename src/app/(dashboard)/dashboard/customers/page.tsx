"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { format } from 'date-fns';
import ConfirmDialog from "@/components/ConfirmDialog";
import Spinner from "@/components/Spinner";
import { AddIcon, EditIcon, DeleteIcon, KebabMenuIcon, SuccessIcon } from "@/components/icons";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    if (initialLoad) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized access");
        }
        throw new Error("Failed to fetch customers");
      }
      const data = await res.json();
      // Sort customers alphabetically by name
      const sortedCustomers = data.sort((a: Customer, b: Customer) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setCustomers(sortedCustomers);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(error instanceof Error ? error.message : "Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
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
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      setDeleteSuccess("Customer deleted successfully.");
      setTimeout(() => setDeleteSuccess(""), 3000);
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

  const handleDismissSuccess = () => {
    setDeleteSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
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

      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 print:hidden sticky top-0 z-30">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm text-gray-600">Manage your customer database</p>
              </div>
            </div>
            <Link
              href="/dashboard/customers/new"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Customer
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Enhanced Statistics Widgets */}
        <div className="px-4 mb-6 sm:px-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Total Customers Widget */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-700">Total</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{customers.length}</p>
                  <p className="text-xs text-blue-600 mt-1">Customers</p>
                </div>
              </div>
            </div>

            {/* GST Registered Customers Widget */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-emerald-700">With GST</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-900">{customers.filter(c => c.gstNo).length}</p>
                  <p className="text-xs text-emerald-600 mt-1">Registered</p>
                </div>
              </div>
            </div>

            {/* Complete Profile Widget */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-amber-700">Complete</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-900">
                    {customers.filter(c => c.name && c.address && c.gstNo).length}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Profiles</p>
                </div>
              </div>
            </div>

            {/* Recent Customers Widget */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-purple-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-700">Recent</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-purple-900">
                    {customers.filter(customer => {
                      const customerDate = new Date(customer.createdAt);
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      return customerDate > sevenDaysAgo;
                    }).length}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Last 7 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Analytics Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Customer Distribution Widget */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Customer Distribution</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">GST Registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ 
                          width: customers.length > 0 
                            ? `${(customers.filter(c => c.gstNo).length / customers.length) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{customers.filter(c => c.gstNo).length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">No GST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full transition-all duration-500" 
                        style={{ 
                          width: customers.length > 0 
                            ? `${(customers.filter(c => !c.gstNo).length / customers.length) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{customers.filter(c => !c.gstNo).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Completeness Widget */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Data Quality</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-emerald-700">Complete</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-900">
                    {customers.filter(c => c.name && c.address).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm font-medium text-amber-700">Missing Info</span>
                  </div>
                  <span className="text-sm font-bold text-amber-900">
                    {customers.filter(c => !c.address || !c.name).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Widget */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link
                  href="/dashboard/customers/new"
                  className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Add Customer</p>
                    <p className="text-xs text-blue-600">Create new entry</p>
                  </div>
                </Link>
                <button
                  onClick={() => setSearchTerm("")}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group w-full text-left"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Clear Search</p>
                    <p className="text-xs text-gray-600">Reset filters</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="px-4 mb-6 sm:px-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Search customers by Name, GST No, or Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-200 text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-0">
          {/* Enhanced Success Message */}
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

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
                <Spinner />
                <p className="mt-4 text-sm text-gray-600">Loading customers...</p>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No Customers Found' : 'No Customers Yet'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms or add a new customer.' : 'Get started by adding your first customer to the system.'}
                </p>
                <Link
                  href="/dashboard/customers/new"
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Customer
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Enhanced Desktop Table View */}
              <div className="hidden lg:block bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Customer Details
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          GST Number
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="relative px-6 py-4">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCustomers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 bg-gradient-to-br ${
                                customer.gstNo ? 'from-emerald-600 to-emerald-700' : 'from-blue-600 to-blue-700'
                              } rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <span className="text-white font-semibold text-sm">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <Link 
                                  href={`/dashboard/customers/edit/${customer.id}`}
                                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  {customer.name}
                                </Link>
                                <div className="text-xs text-gray-500">Customer #{index + 1}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {customer.gstNo ? (
                              <div className="text-sm text-gray-900 font-mono">{customer.gstNo}</div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Not provided
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {customer.address ? (
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={customer.address}>
                                {customer.address}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Not provided
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            >
                              <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {openMenuId === customer.id && (
                              <div
                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-100"
                                role="menu"
                                onMouseLeave={() => setOpenMenuId(null)}
                              >
                                <div className="py-2" role="none">
                                  <Link
                                    href={`/dashboard/customers/edit/${customer.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    role="menuitem"
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Customer
                                  </Link>
                                  <button
                                    onClick={() => { openDeleteDialog(customer.id); setOpenMenuId(null); }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    role="menuitem"
                                  >
                                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Customer
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
              </div>

              {/* Enhanced Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {filteredCustomers.map((customer, index) => (
                  <div key={customer.id} className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4 flex-grow">
                        <div className={`w-12 h-12 bg-gradient-to-br ${
                          customer.gstNo ? 'from-emerald-600 to-emerald-700' : 'from-blue-600 to-blue-700'
                        } rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <Link 
                            href={`/dashboard/customers/edit/${customer.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-sm text-gray-500">Customer #{index + 1}</p>
                        </div>
                      </div>
                      <div className="relative flex-shrink-0 ml-4">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {openMenuId === customer.id && (
                          <div
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-gray-100"
                            role="menu"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <div className="py-2" role="none">
                              <Link
                                href={`/dashboard/customers/edit/${customer.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                role="menuitem"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Customer
                              </Link>
                              <button
                                onClick={() => { openDeleteDialog(customer.id); setOpenMenuId(null); }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                role="menuitem"
                              >
                                <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Customer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      {customer.gstNo && (
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-gray-600 font-medium mr-2">GST:</span>
                          <span className="text-gray-900">{customer.gstNo}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <span className="text-gray-600 font-medium">Address:</span>
                            <p className="text-gray-900 mt-1 leading-relaxed">{customer.address}</p>
                          </div>
                        </div>
                      )}
                      {!customer.gstNo && !customer.address && (
                        <div className="text-sm text-gray-400 italic">
                          No additional details provided
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Count */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredCustomers.length} of {customers.length} customers
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 