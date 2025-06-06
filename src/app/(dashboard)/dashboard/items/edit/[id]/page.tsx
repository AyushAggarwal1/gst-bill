"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/Spinner";

interface ItemParams {
  params: {
    id: string;
  };
}

export default function EditItemPage({ params }: ItemParams) {
  const router = useRouter();
  const { id } = params;
  const [item, setItem] = useState({
    name: "",
    hsnCode: "",
    taxRate: "",
  });
  const [originalItem, setOriginalItem] = useState({
    name: "",
    hsnCode: "",
    taxRate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch item");
        }
        const data = await res.json();
        const itemData = {
          name: data.name || "",
          hsnCode: data.hsnCode || "",
          taxRate: data.taxRate !== null && data.taxRate !== undefined ? String(data.taxRate) : "",
        };
        setItem(itemData);
        setOriginalItem(itemData);
      } catch (err) {
        console.error("Error fetching item:", err);
        setError(err instanceof Error ? err.message : "Failed to load item. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError("");
    const taxRateFloat = parseFloat(item.taxRate);
    if (isNaN(taxRateFloat)) {
      setError("Tax Rate must be a valid number");
      setSaveLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, taxRate: taxRateFloat }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update item");
      }
      router.push("/dashboard/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setSaveLoading(false);
    }
  };

  // Check for changes
  const hasChanges = JSON.stringify(item) !== JSON.stringify(originalItem);
  const isValid = item.name.trim() && item.hsnCode.trim() && item.taxRate.trim() && !isNaN(parseFloat(item.taxRate));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <Spinner />
          <p className="mt-4 text-sm text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100">
      {/* Enhanced Header with Amber Theme */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Item</h1>
                <p className="text-sm text-gray-600 mt-1">Modify product information</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline font-medium">Unsaved Changes</span>
                  <span className="sm:hidden font-medium">Unsaved</span>
                </div>
              )}
              {isValid && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline font-medium">Valid Data</span>
                  <span className="sm:hidden font-medium">Valid</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Form Header with Amber Theme */}
            <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-amber-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 bg-amber-100 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Item Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">Update item details and specifications</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900">Validation Error</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Item Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    Item Name
                    <span className="text-red-500">*</span>
                    {item.name !== originalItem.name && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={item.name}
                    onChange={handleChange}
                    placeholder="Enter descriptive item name (e.g., Premium Laptop, Steel Chair)"
                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all duration-200 text-base sm:text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enter a clear, descriptive name for easy identification
                  </p>
                </div>

                {/* HSN Code */}
                <div>
                  <label htmlFor="hsnCode" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <div className="w-5 h-5 bg-yellow-50 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    HSN/SAC Code
                    <span className="text-red-500">*</span>
                    {item.hsnCode !== originalItem.hsnCode && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="hsnCode"
                    id="hsnCode"
                    required
                    value={item.hsnCode}
                    onChange={handleChange}
                    placeholder="8471"
                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all duration-200 text-base sm:text-sm font-mono"
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    4-8 digit HSN or SAC classification code
                  </p>
                </div>

                {/* Tax Rate */}
                <div>
                  <label htmlFor="taxRate" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <div className="w-5 h-5 bg-green-50 rounded-md flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">%</span>
                    </div>
                    Tax Rate (%)
                    <span className="text-red-500">*</span>
                    {item.taxRate !== originalItem.taxRate && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="taxRate"
                    id="taxRate"
                    required
                    value={item.taxRate}
                    onChange={handleChange}
                    placeholder="18"
                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all duration-200 text-base sm:text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Common GST rates: 0, 5, 12, 18, 28%
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons with Amber Theme */}
            <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
              <Link
                href="/dashboard/items"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Items</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <button
                type="submit"
                disabled={saveLoading || !hasChanges || !isValid}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {saveLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Updating Item...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Update Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 