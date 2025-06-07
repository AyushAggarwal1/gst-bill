"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, LoadingSpinner } from "@/components/ui";

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
  const [saving, setSaving] = useState(false);
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
        setError("Failed to load item. Please try again or go back to the list.");
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
    setSaving(true);
    setError("");
    const taxRateFloat = parseFloat(item.taxRate);
    if (isNaN(taxRateFloat)) {
      setError("Tax Rate must be a valid number");
      setSaving(false);
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
      setSaving(false);
    }
  };

  // Check for changes
  const hasChanges = () => {
    return JSON.stringify(item) !== JSON.stringify(originalItem);
  };

  // Validation helpers
  const isValidHSN = item.hsnCode.length >= 4 && item.hsnCode.length <= 8;
  const isValidTaxRate = item.taxRate && !isNaN(parseFloat(item.taxRate)) && parseFloat(item.taxRate) >= 0 && parseFloat(item.taxRate) <= 100;
  const isValid = item.name.trim() && isValidHSN && isValidTaxRate;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner text="Loading item details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Edit Item"
        description="Update product information and specifications"
        icon={
          <svg className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        }
      >
        <div className="flex items-center gap-3">
          {hasChanges() && (
            <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
              <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <span className="text-sm font-medium text-orange-700">Unsaved Changes</span>
            </div>
          )}
          <Link
            href="/dashboard/items"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Items
          </Link>
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                      <p className="text-sm text-gray-600">Update essential product details</p>
                    </div>
                    {item.name !== originalItem.name && (
                      <div className="bg-orange-100 px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-orange-800">Modified</span>
                      </div>
                    )}
                  </div>

                  {/* Item Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={item.name}
                        onChange={handleChange}
                        placeholder="Enter descriptive item name (e.g., Premium Laptop, Steel Chair)"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                      />
                    </div>
                    {item.name && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Valid item name
                      </div>
                    )}
                  </div>
                </div>

                {/* Classification & Tax Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">Classification & Tax</h2>
                      <p className="text-sm text-gray-600">Update HSN/SAC code and tax rate information</p>
                    </div>
                    {(item.hsnCode !== originalItem.hsnCode || item.taxRate !== originalItem.taxRate) && (
                      <div className="bg-orange-100 px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-orange-800">Modified</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* HSN Code */}
                    <div className="space-y-2">
                      <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700">
                        HSN/SAC Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="hsnCode"
                          id="hsnCode"
                          required
                          value={item.hsnCode}
                          onChange={handleChange}
                          placeholder="8471"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-500 transition-colors tracking-wider"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-gray-500">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          4-8 digit classification code
                        </div>
                        <div className={`flex items-center ${isValidHSN ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="font-medium">{item.hsnCode.length}/8</span>
                        </div>
                      </div>
                      {isValidHSN && (
                        <div className="flex items-center text-xs text-green-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Valid HSN/SAC code length
                        </div>
                      )}
                      {item.hsnCode && !isValidHSN && (
                        <div className="flex items-center text-xs text-amber-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                          </svg>
                          HSN/SAC code should be 4-8 digits
                        </div>
                      )}
                    </div>

                    {/* Tax Rate */}
                    <div className="space-y-2">
                      <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                        Tax Rate (%) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 font-bold text-sm">%</span>
                        </div>
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
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-gray-500">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Common rates: 0, 5, 12, 18, 28%
                        </div>
                        {item.taxRate && (
                          <div className={`flex items-center ${isValidTaxRate ? 'text-green-600' : 'text-amber-600'}`}>
                            <span className="font-medium">{item.taxRate}%</span>
                          </div>
                        )}
                      </div>
                      {isValidTaxRate && (
                        <div className="flex items-center text-xs text-green-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Valid tax rate
                        </div>
                      )}
                      {item.taxRate && !isValidTaxRate && (
                        <div className="flex items-center text-xs text-amber-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                          </svg>
                          Tax rate must be between 0 and 100
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-xl">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                <Link
                  href="/dashboard/items"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !item.name || !isValidHSN || !isValidTaxRate || !hasChanges()}
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 group"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Item...
                    </>
                  ) : (
                    <>
                       <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                       </svg>
                       Update Item
                    </>
                  )}
                </button>
              </div>
              
              {/* Changes Summary */}
              {hasChanges() && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Unsaved Changes</span>
                    <span>
                      {Object.keys(item).filter(key => 
                        item[key as keyof typeof item] !== originalItem[key as keyof typeof originalItem]
                      ).length} field(s) modified
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-full" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 