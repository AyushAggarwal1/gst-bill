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
    <div className="min-h-screen bg-gray-50">
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

      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Items</h1>
            <Link
              href="/dashboard/items/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AddIcon />
              Add Item
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
              placeholder="Search items by name or HSN code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="px-4 py-0 sm:px-0"> {/* Adjusted py-6 to py-0 here as search bar has mb-6 */}
          {deleteSuccess && (
            <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-green-100 via-green-50 to-green-100 border-l-4 border-green-500 text-green-800 rounded-lg shadow-lg animate-fade-in relative">
              <div className="flex items-center">
                <SuccessIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="font-medium text-green-900">{deleteSuccess}</span>
              </div>
              <button
                className="absolute top-2 right-2 text-green-700 hover:text-green-900 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Dismiss success message"
                onClick={handleDismissSuccess}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : filteredItems.length === 0 ? (
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No Items Found' : 'No Items Yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms or add a new item.' : 'Get started by adding a new item.'}
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard/items/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <AddIcon />
                  Add Item
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
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN Code</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate (%)</th>
                      <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th scope="col" className="relative px-1 py-3 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.hsnCode || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.taxRate}%
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(item.createdAt), 'dd MMM yyyy')}
                        </td>
                        <td className="px-1 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                          >
                            <KebabMenuIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          {openMenuId === item.id && (
                            <div
                              className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`menu-button-table-${item.id}`}
                              onMouseLeave={() => setOpenMenuId(null)}
                            >
                              <div className="py-1" role="none">
                                <Link
                                  href={`/dashboard/items/edit/${item.id}`}
                                  className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-4 py-2 text-sm w-full text-left"
                                  role="menuitem"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <EditIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => { openDeleteDialog(item.id); setOpenMenuId(null); }}
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
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-grow pr-2">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        {item.hsnCode && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">HSN:</span> {item.hsnCode}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Tax:</span> {item.taxRate}%
                        </p>
                      </div>
                      <div className="flex-shrink-0 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                        >
                          <KebabMenuIcon className="h-5 w-5 text-gray-500" />
                        </button>
                        {openMenuId === item.id && (
                          <div
                            className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby={`menu-button-card-${item.id}`}
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <div className="py-1" role="none">
                              <Link
                                href={`/dashboard/items/edit/${item.id}`}
                                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-4 py-2 text-sm w-full text-left"
                                role="menuitem"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <EditIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                Edit
                              </Link>
                              <button
                                onClick={() => { openDeleteDialog(item.id); setOpenMenuId(null); }}
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