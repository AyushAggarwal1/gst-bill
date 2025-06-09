"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatsCard, LoadingSpinner, EmptyState, QuickActionCard } from "@/components/ui";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Item {
  id: string;
  name: string;
  description?: string;
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

  const exportTop10ItemsToCSV = () => {
    // Get top 10 items (sorted by creation date, most recent first)
    const top10Items = items
      .sort((b, a) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    if (top10Items.length === 0) {
      alert("No items available to export.");
      return;
    }

    // CSV headers
    const headers = ["S.No", "Item Name", "HSN Code", "Tax Rate (%)", "Created Date"];
    
    // Convert items to CSV rows
    const csvRows = top10Items.map((item, index) => [
      index + 1,
      `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in names
      item.hsnCode || "Not Provided",
      item.taxRate,
      new Date(item.createdAt).toLocaleDateString()
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.join(","))
      .join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `top-10-items-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.hsnCode && item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

      <PageHeader
        title="Items"
        description="Manage your inventory and product catalog"
        icon={
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      >
        <Link
          href="/dashboard/items/new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </Link>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <StatsCard
            title="Total Items"
            value={items.length}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            iconBgColor="bg-blue-100"
          />

          <StatsCard
            title="With HSN Codes"
            value={items.filter(item => item.hsnCode && item.hsnCode.trim() !== '').length}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconBgColor="bg-emerald-100"
          />

          <StatsCard
            title="Average Tax Rate"
            value={items.length > 0 ? `${(items.reduce((sum, item) => sum + item.taxRate, 0) / items.length).toFixed(1)}%` : '0%'}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            iconBgColor="bg-amber-100"
          />

          <StatsCard
            title="Recent Items"
            value={items.filter(item => {
              const createdDate = new Date(item.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return createdDate >= weekAgo;
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
            <p className="text-xs sm:text-sm text-gray-500">Manage items efficiently</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Add New Item"
              description="Create new product or service"
              href="/dashboard/items/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              iconBgColor="bg-blue-50"
            />

            <QuickActionCard
              title="Create New Bill"
              description="Generate invoice with items"
              href="/dashboard/bills/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconBgColor="bg-green-50"
            />

            <QuickActionCard
              title="Export Top 10 Items"
              description="Download CSV of recent items"
              onClick={exportTop10ItemsToCSV}
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconBgColor="bg-purple-50"
            />
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
              placeholder="Search items by name or HSN code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          {deleteSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
              <LoadingSpinner text="Loading your items..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <EmptyState
              icon={
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              title={searchTerm ? 'No Items Found' : 'No Items Yet'}
              description={searchTerm ? 'Try adjusting your search terms or add a new item to get started.' : 'Start building your product catalog by adding your first item.'}
              action={{
                label: 'Add Your First Item',
                onClick: () => window.location.href = '/dashboard/items/new'
              }}
            />
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Card>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Items Catalog
                  </h3>
                </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                      </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HSN Code
                      </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tax Rate
                      </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                      </th>
                          <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-700">{(index + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/items/edit/${item.id}`}
                                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                          {item.name}
                              </Link>
                              <p className="text-xs text-gray-500">Product Item</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-mono">{item.hsnCode || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{item.taxRate}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{format(new Date(item.createdAt), 'dd MMM yyyy')}</span>
                        </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          >
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          {openMenuId === item.id && (
                            <div
                                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black/5 focus:outline-none z-20"
                              role="menu"
                              onMouseLeave={() => setOpenMenuId(null)}
                            >
                                  <div className="py-1" role="none">
                                <Link
                                  href={`/dashboard/items/edit/${item.id}`}
                                      className="text-gray-700 hover:bg-gray-100 group flex items-center px-4 py-2 text-sm"
                                  role="menuitem"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                      Edit Item
                                </Link>
                                <button
                                  onClick={() => { openDeleteDialog(item.id); setOpenMenuId(null); }}
                                      className="text-gray-700 hover:bg-gray-100 group flex items-center px-4 py-2 text-sm w-full text-left"
                                  role="menuitem"
                                >
                                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                      Delete Item
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

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {filteredItems.map((item, index) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/dashboard/items/edit/${item.id}`}
                            className="text-base sm:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-2"
                        >
                          {item.name}
                        </Link>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500 font-medium min-w-0 w-16">HSN:</span>
                              <span className="font-mono text-gray-900 truncate">{item.hsnCode || 'N/A'}</span>
                          </div>
                          
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500 font-medium min-w-0 w-16">Tax:</span>
                              <span className="font-semibold text-gray-900">{item.taxRate}%</span>
                          </div>
                          
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500 font-medium min-w-0 w-16">Created:</span>
                              <span className="text-gray-900">{format(new Date(item.createdAt), 'dd MMM yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {openMenuId === item.id && (
                          <div
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black/5 focus:outline-none z-30"
                            role="menu"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                              <div className="py-1" role="none">
                              <Link
                                href={`/dashboard/items/edit/${item.id}`}
                                  className="text-gray-700 hover:bg-gray-100 group flex items-center px-4 py-2 text-sm"
                                role="menuitem"
                                onClick={() => setOpenMenuId(null)}
                              >
                                  <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                   </svg>
                                  Edit Item
                              </Link>
                              <button
                                onClick={() => { openDeleteDialog(item.id); setOpenMenuId(null); }}
                                  className="text-gray-700 hover:bg-gray-100 group flex items-center px-4 py-2 text-sm w-full text-left"
                                role="menuitem"
                              >
                                  <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete Item
                              </button>
                            </div>
                          </div>
                        )}
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
                    <span className="font-bold text-blue-600">{filteredItems.length}</span>
                    <span className="hidden sm:inline"> of </span>
                    <span className="sm:hidden">/</span>
                    <span className="font-bold">{items.length}</span>
                    <span className="hidden sm:inline"> items</span>
                    {searchTerm && (
                      <span className="ml-1 hidden sm:inline">
                        matching "<span className="font-semibold text-blue-600">{searchTerm}</span>"
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 