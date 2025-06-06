"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { format } from 'date-fns';
import ConfirmDialog from "@/components/ConfirmDialog";
import Spinner from "@/components/Spinner";
import { AddIcon, EditIcon, DeleteIcon, KebabMenuIcon, SuccessIcon } from "@/components/icons";

interface Item {
  id: string;
  name: string;
  hsnCode: string;
  taxRate: number;
  createdAt: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await res.json();
      // Sort items alphabetically by name
      const sortedItems = data.sort((a: Item, b: Item) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setItems(sortedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteSuccess("Item deleted successfully.");
      setTimeout(() => setDeleteSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item. Please try again.");
    }
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDismissSuccess = () => {
    setDeleteSuccess("");
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.hsnCode && item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
          }
        }}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone and may affect existing bills."
      />

      {/* Enhanced Header with Blue Theme */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20 print:hidden sticky top-0 z-30">
        <div className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Items & Products</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your inventory and product catalog</p>
              </div>
            </div>
            <Link
              href="/dashboard/items/new"
              className="relative inline-flex items-center justify-center px-4 py-3 sm:px-6 sm:py-3 text-sm sm:text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 overflow-hidden group min-w-[140px] sm:min-w-0"
            >
              {/* Animated background gradient for mobile */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden"></div>
              
              {/* Enhanced icon with rotation animation */}
              <div className="relative z-10 w-5 h-5 sm:w-4 sm:h-4 mr-2 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <svg className="w-3 h-3 sm:w-3 sm:h-3 text-white group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              {/* Enhanced text with better mobile styling */}
              <span className="relative z-10 font-bold tracking-wide">
                <span className="hidden sm:inline">Add New Item</span>
                <span className="sm:hidden">Add Item</span>
              </span>
              
              {/* Subtle shine effect for mobile */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-3 sm:px-6 lg:px-8">
        {/* Statistics Widgets */}
        <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Items Widget */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-700">Total Items</h3>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{items.length}</p>
                <p className="text-xs text-blue-600 mt-1">In catalog</p>
              </div>
            </div>
          </div>

          {/* Items with HSN Widget */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-emerald-700">With HSN</h3>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-900">{items.filter(item => item.hsnCode).length}</p>
                <p className="text-xs text-emerald-600 mt-1">Have HSN codes</p>
              </div>
            </div>
          </div>

          {/* Average Tax Rate Widget */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-bold text-white">%</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-amber-700">Avg Tax</h3>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">
                  {items.length > 0 ? (items.reduce((sum, item) => sum + item.taxRate, 0) / items.length).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-amber-600 mt-1">Tax rate</p>
              </div>
            </div>
          </div>

          {/* Recent Items Widget */}
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
                  {items.filter(item => {
                    const itemDate = new Date(item.createdAt);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return itemDate > sevenDaysAgo;
                  }).length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Last 7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar with Statistics */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Search items by name or HSN code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-200 text-base sm:text-sm"
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
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{filteredItems.length} items</span>
                </div>
                {searchTerm && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    <span>Filtered</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Widgets */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tax Rate Distribution Widget */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Tax Rate Distribution</h3>
            </div>
            <div className="space-y-3">
              {items.length > 0 ? (
                [...new Set(items.map(item => item.taxRate))]
                  .sort((a, b) => b - a)
                  .slice(0, 4)
                  .map(rate => {
                    const count = items.filter(item => item.taxRate === rate).length;
                    const percentage = (count / items.length) * 100;
                    return (
                      <div key={rate} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">{rate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm text-gray-500 italic">No data available</p>
              )}
            </div>
          </div>

          {/* Items Status Overview Widget */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Items Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-700">Complete</span>
                </div>
                <span className="text-sm font-bold text-emerald-900">
                  {items.filter(item => item.hsnCode && item.hsnCode.trim() !== '').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-amber-700">Missing HSN</span>
                </div>
                <span className="text-sm font-bold text-amber-900">
                  {items.filter(item => !item.hsnCode || item.hsnCode.trim() === '').length}
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
                href="/dashboard/items/new"
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Add New Item</p>
                  <p className="text-xs text-blue-600">Create product entry</p>
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
                  <p className="text-sm font-semibold text-gray-900">Refresh View</p>
                  <p className="text-xs text-gray-600">Clear filters</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {deleteSuccess && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Success!</h3>
                    <p className="text-sm text-green-700">{deleteSuccess}</p>
                  </div>
                </div>
                <button
                  className="text-green-700 hover:text-green-900 transition-colors rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                aria-label="Dismiss success message"
                onClick={handleDismissSuccess}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
            <Spinner />
                <p className="mt-4 text-sm text-gray-600">Loading your items...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Items</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                  className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchTerm ? 'No Items Found' : 'No Items Yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms or add a new item to get started.' : 'Start building your product catalog by adding your first item.'}
              </p>
                <Link
                  href="/dashboard/items/new"
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Item
                </Link>
            </div>
          ) : (
            <div>
              {/* Enhanced Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Items Catalog
                  </h3>
                </div>
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Item Name
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          HSN Code
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Tax Rate (%)
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m6 0H6" />
                          </svg>
                          Created At
                        </div>
                      </th>
                      <th scope="col" className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {filteredItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-blue-50/50 transition-all duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-700">{(index + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/items/edit/${item.id}`}
                                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                          {item.name}
                              </Link>
                              <p className="text-xs text-gray-500">Product Item</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 font-mono">{item.hsnCode || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center">
                              <span className="text-xs font-bold text-green-600">%</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{item.taxRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-50 rounded-md flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m6 0H6" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600">{format(new Date(item.createdAt), 'dd MMM yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4 text-gray-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          {openMenuId === item.id && (
                            <div
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white/95 backdrop-blur-sm ring-1 ring-black/5 focus:outline-none z-20 border border-white/20"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`menu-button-table-${item.id}`}
                              onMouseLeave={() => setOpenMenuId(null)}
                            >
                              <div className="py-2" role="none">
                                <Link
                                  href={`/dashboard/items/edit/${item.id}`}
                                  className="text-gray-700 hover:bg-amber-50 hover:text-amber-700 group flex items-center px-4 py-3 text-sm w-full text-left transition-colors"
                                  role="menuitem"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-100">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Edit Item</p>
                                    <p className="text-xs text-gray-500">Modify item details</p>
                                  </div>
                                </Link>
                                <button
                                  onClick={() => { openDeleteDialog(item.id); setOpenMenuId(null); }}
                                  className="text-gray-700 hover:bg-red-50 hover:text-red-700 group flex items-center px-4 py-3 text-sm w-full text-left transition-colors"
                                  role="menuitem"
                                >
                                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100">
                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Delete Item</p>
                                    <p className="text-xs text-gray-500">Remove permanently</p>
                                  </div>
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

              {/* Enhanced Mobile Card View - Hidden on md and up */}
              <div className="block md:hidden space-y-4">
                {filteredItems.map((item, index) => (
                  <div key={item.id} className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-4 border border-white/20 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/dashboard/items/edit/${item.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-3 block"
                        >
                          {item.name}
                        </Link>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">HSN Code</p>
                              <p className="text-sm font-semibold text-gray-900 font-mono">{item.hsnCode || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">%</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Tax Rate</p>
                              <p className="text-sm font-bold text-gray-900">{item.taxRate}%</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m6 0H6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Created</p>
                              <p className="text-sm font-semibold text-gray-900">{format(new Date(item.createdAt), 'dd MMM yyyy')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {openMenuId === item.id && (
                          <div
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white/95 backdrop-blur-sm ring-1 ring-black/5 focus:outline-none z-30 border border-white/20"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby={`menu-button-card-${item.id}`}
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                                                         <div className="py-2" role="none">
                              <Link
                                href={`/dashboard/items/edit/${item.id}`}
                                 className="text-gray-700 hover:bg-amber-50 hover:text-amber-700 group flex items-center px-4 py-3 text-sm w-full text-left transition-colors"
                                role="menuitem"
                                onClick={() => setOpenMenuId(null)}
                              >
                                 <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-100">
                                   <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                   </svg>
                                 </div>
                                 <div>
                                   <p className="font-semibold">Edit Item</p>
                                   <p className="text-xs text-gray-500">Modify item details</p>
                                 </div>
                              </Link>
                              <button
                                onClick={() => { openDeleteDialog(item.id); setOpenMenuId(null); }}
                                className="text-gray-700 hover:bg-red-50 hover:text-red-700 group flex items-center px-4 py-3 text-sm w-full text-left transition-colors"
                                role="menuitem"
                              >
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100">
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold">Delete Item</p>
                                  <p className="text-xs text-gray-500">Remove permanently</p>
                                </div>
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