"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui";

export default function NewItemPage() {
  const router = useRouter();
  const [item, setItem] = useState({
    name: "",
    description: "",
    hsnCode: "",
    taxRate: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingHSN, setFetchingHSN] = useState(false);
  const [error, setError] = useState("");
  const [hsnFetched, setHsnFetched] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [hsnResults, setHsnResults] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset HSN fetched status if HSN code is changed
    if (name === "hsnCode" && hsnFetched) {
      setHsnFetched(false);
      setHsnResults([]);
    }
  };

  const handleManualToggle = () => {
    setManualEntry(!manualEntry);
    setError("");
    setHsnFetched(false);
    setHsnResults([]);
  };

  const fetchHSNDetails = async () => {
    if (!item.hsnCode || item.hsnCode.trim().length < 3) {
      setError("Please enter at least 3 characters (HSN code or item name)");
      return;
    }

    setFetchingHSN(true);
    setError("");

    try {
      const response = await fetch("/api/gst/hsnverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: item.hsnCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch HSN details");
      }

      if (data.success && data.data && data.data.length > 0) {
        setHsnResults(data.data);
        setHsnFetched(true);
        setError("");
        
        // Auto-fill with the first result if exact HSN code match
        const exactHSNMatch = data.data.find((result: any) => result.hsnCode === item.hsnCode.trim());
        if (exactHSNMatch) {
          const fullDescription = exactHSNMatch.description || "";
          const splitDescription = fullDescription.split(/[;,]/);
          const itemName = splitDescription[0]?.trim() || "";
          
          setItem((prev) => ({
            ...prev,
            name: itemName || prev.name,
            description: fullDescription || prev.description,
            taxRate: exactHSNMatch.gstRate?.toString() || prev.taxRate,
          }));
        }
      } else {
        throw new Error("No results found for the search term");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch HSN details"
      );
      setHsnFetched(false);
      setHsnResults([]);
    } finally {
      setFetchingHSN(false);
    }
  };

  const selectHSNResult = (result: any) => {
    const fullDescription = result.description || "";
    const splitDescription = fullDescription.split(/[;,]/);
    const itemName = splitDescription[0]?.trim() || "";
    
    setItem((prev) => ({
      ...prev,
      hsnCode: result.hsnCode || prev.hsnCode,
      name: itemName || prev.name,
      description: fullDescription || prev.description,
      taxRate: result.gstRate?.toString() || prev.taxRate,
    }));
    setHsnResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Convert taxRate to number
    const taxRateFloat = parseFloat(item.taxRate);
    if (isNaN(taxRateFloat)) {
      setError("Tax Rate must be a valid number");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          taxRate: taxRateFloat,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create item");
      }

      router.push("/dashboard/items");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create item"
      );
    } finally {
      setLoading(false);
    }
  };

  // Validation helpers
  const isValidHSN = item.hsnCode.length >= 4 && item.hsnCode.length <= 8;
  const isValidTaxRate = item.taxRate && !isNaN(parseFloat(item.taxRate)) && parseFloat(item.taxRate) >= 0 && parseFloat(item.taxRate) <= 100;
  const isFormDisabled = !manualEntry && (!item.hsnCode || item.hsnCode.trim().length < 3);
  const formCompletion = ((item.name ? 1 : 0) + (isValidHSN ? 1 : 0) + (isValidTaxRate ? 1 : 0)) / 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Add New Item"
        description="Create a new product for your inventory catalog"
        icon={
          <svg className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      >
        <Link
          href="/dashboard/items"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Items
        </Link>
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

        {/* Entry Mode Toggle */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Entry Mode</h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose how you want to add item details
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="hsn-mode"
                  name="entry-mode"
                  type="radio"
                  checked={!manualEntry}
                  onChange={() => setManualEntry(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="hsn-mode" className="ml-2 text-sm font-medium text-gray-700">
                  HSN Auto-fill
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="manual-mode"
                  name="entry-mode"
                  type="radio"
                  checked={manualEntry}
                  onChange={() => setManualEntry(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="manual-mode" className="ml-2 text-sm font-medium text-gray-700">
                  Manual Entry
                </label>
              </div>
            </div>
          </div>
          
          {/* Mode Description */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  {!manualEntry ? (
                    <>
                      <span className="font-medium">HSN Auto-fill:</span> Enter HSN code or item name to automatically search and fetch item description and tax rate from government records.
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Manual Entry:</span> Enter all item details manually including HSN code and tax rate.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Progress Indicator */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Form Progress</h3>
            <span className="text-sm text-gray-600">
              {Math.round(((item.name ? 1 : 0) + (item.hsnCode && isValidHSN ? 1 : 0) + (item.taxRate ? 1 : 0)) / 3 * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((item.name ? 1 : 0) + (item.hsnCode && isValidHSN ? 1 : 0) + (item.taxRate ? 1 : 0)) / 3 * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className={item.name ? 'text-green-600 font-medium' : ''}>Item Name</span>
            <span className={item.hsnCode && isValidHSN ? 'text-green-600 font-medium' : ''}>HSN Code</span>
            <span className={item.taxRate ? 'text-green-600 font-medium' : ''}>Tax Rate</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                {/* HSN Classification Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">HSN Classification</h2>
                      <p className="text-sm text-gray-600">
                        {!manualEntry ? 'Enter HSN code or item name to search and fetch details' : 'HSN/SAC code for tax classification'}
                      </p>
                    </div>
                  </div>

                  {/* HSN Code */}
                  <div className="space-y-2">
                    <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700">
                      HSN/SAC Code <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
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
                          placeholder="Search HSN/SAC-8471, Name"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-500 transition-colors tracking-wider"
                        />
                      </div>
                                             {!manualEntry && item.hsnCode && item.hsnCode.trim().length >= 3 && (
                        <button
                          type="button"
                          onClick={fetchHSNDetails}
                          disabled={fetchingHSN}
                          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {fetchingHSN ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Fetching...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Fetch Details
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-500">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        HSN code (4-8 digits) or item name
                      </div>
                      <div className={`flex items-center ${isValidHSN ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="font-medium">{item.hsnCode.length}/8</span>
                      </div>
                    </div>
                                         {!manualEntry && item.hsnCode && item.hsnCode.trim().length >= 3 && !hsnFetched && (
                      <div className="flex items-center text-xs text-blue-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                                                 Click "Fetch Details" to search and auto-fill item information
                      </div>
                    )}
                    {hsnFetched && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                                                 Search results found - select an option below
                      </div>
                    )}
                    {isValidHSN && manualEntry && (
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

                  {/* HSN Results */}
                  {hsnResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Select from search results:</h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {hsnResults.map((result, index) => {
                          const fullDescription = result.description || "";
                          const splitDescription = fullDescription.split(/[;,]/);
                          const itemName = splitDescription[0]?.trim() || "";
                          
                          return (
                            <div
                              key={index}
                              onClick={() => selectHSNResult(result)}
                              className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-900">HSN: {result.hsnCode}</span>
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                      {result.gstRate}% GST
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      <span className="text-xs text-gray-500 uppercase tracking-wide">Name:</span> {itemName}
                                    </p>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      <span className="text-xs text-gray-500 uppercase tracking-wide">Full Description:</span> {fullDescription}
                                    </p>
                                  </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Basic Information Section */}
                <div className={`space-y-6 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                      <p className="text-sm text-gray-600">
                        {isFormDisabled ? 'Enter HSN code first to enable this section' : 'Essential details about the product'}
                      </p>
                    </div>
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
                        disabled={isFormDisabled}
                        placeholder="Enter descriptive item name (e.g., Premium Laptop, Steel Chair)"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {item.name && !isFormDisabled && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Valid item name
                      </div>
                    )}
                  </div>

                  {/* Item Description */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Item Description <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      </div>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={item.description}
                        onChange={handleChange}
                        disabled={isFormDisabled}
                        placeholder="Enter detailed description of the item (optional)"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none placeholder-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Additional details about the item for better identification
                    </div>
                  </div>
                </div>

                {/* Tax Information Section */}
                <div className={`space-y-6 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Tax Information</h2>
                      <p className="text-sm text-gray-600">
                        {isFormDisabled ? 'Enter HSN code first to enable this section' : 'GST rate and tax details'}
                      </p>
                    </div>
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
                        disabled={isFormDisabled}
                        placeholder="18"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-500">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Standard rates: 0%, 5%, 12%, 18%, 28%
                      </div>
                      {isValidTaxRate && (
                        <div className="flex items-center text-green-600">
                          <span className="font-medium">Valid rate</span>
                        </div>
                      )}
                    </div>
                    {isValidTaxRate && !isFormDisabled && (
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
                        Tax rate must be between 0% and 100%
                      </div>
                    )}
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
                  disabled={loading || !item.name || !isValidHSN || !isValidTaxRate}
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Item...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Create Item
                    </>
                  )}
                </button>
              </div>
              

            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 