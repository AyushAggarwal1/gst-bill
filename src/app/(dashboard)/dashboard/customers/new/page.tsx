"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui";

export default function NewCustomerPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    deliveryAddress: "",
    gstNo: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingGST, setFetchingGST] = useState(false);
  const [error, setError] = useState("");
  const [gstFetched, setGstFetched] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset GST fetched status if GST number is changed
    if (name === "gstNo" && gstFetched) {
      setGstFetched(false);
    }
  };

  const handleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCustomer((prev) => ({
        ...prev,
        deliveryAddress: prev.address,
      }));
    }
  };

  const handleManualToggle = () => {
    setManualEntry(!manualEntry);
    setError("");
    setGstFetched(false);
    // Clear GST number if switching to manual entry
    if (!manualEntry) {
      setCustomer((prev) => ({
        ...prev,
        gstNo: "",
      }));
    }
  };

  const fetchGSTDetails = async () => {
    if (!customer.gstNo || customer.gstNo.length !== 15) {
      setError("Please enter a valid 15-digit GST number");
      return;
    }

    setFetchingGST(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/gst/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gstin: customer.gstNo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch GST details");
      }

      if (data.success && data.data) {
        // Auto-fill customer name and address
        setCustomer((prev) => ({
          ...prev,
          name: data.data.legalName || data.data.tradeName || "",
          address: data.data.principalPlaceOfBusiness?.address || "",
        }));
        setGstFetched(true);
        setError("");
      } else {
        throw new Error("GST details not found");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch GST details"
      );
      setGstFetched(false);
    } finally {
      setFetchingGST(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create customer");
      }

      router.push("/dashboard/customers");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = !manualEntry && (!customer.gstNo || customer.gstNo.length !== 15);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Add New Customer"
        description="Create a new customer profile for your business"
        icon={
          <svg className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
        }
      >
            <Link
              href="/dashboard/customers"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
            >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
          Back to Customers
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
                Choose how you want to add customer details
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="gst-mode"
                  name="entry-mode"
                  type="radio"
                  checked={!manualEntry}
                  onChange={() => setManualEntry(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="gst-mode" className="ml-2 text-sm font-medium text-gray-700">
                  GST Auto-fill
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
                      <span className="font-medium">GST Auto-fill:</span> Enter GST number to automatically fetch customer name and address from government records.
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Manual Entry:</span> Enter all customer details manually including GST number.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                {/* GST Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9 16H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V6h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">GST Information</h2>
                      <p className="text-sm text-gray-600">
                        {!manualEntry ? 'Enter GST number to fetch customer details' : 'GST registration details'}
                      </p>
                    </div>
                  </div>

                  {/* GST Number */}
                  <div className="space-y-2">
                    <label htmlFor="gstNo" className="block text-sm font-medium text-gray-700">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                            </svg>
                        </div>
                        <input
                          type="text"
                          name="gstNo"
                          id="gstNo"
                          required
                          pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                          title="Please enter a valid GST Number (e.g., 22AAAAA0000A1Z5)"
                          value={customer.gstNo}
                          onChange={handleChange}
                          placeholder="22AAAAA0000A1Z5"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-500 transition-colors tracking-wider"
                        />
                      </div>
                      {!manualEntry && customer.gstNo && customer.gstNo.length === 15 && (
                        <button
                          type="button"
                          onClick={fetchGSTDetails}
                          disabled={fetchingGST}
                          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {fetchingGST ? (
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
                        Format: 22AAAAA0000A1Z5 (15 characters)
                      </div>
                      <div className={`flex items-center ${customer.gstNo.length === 15 ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="font-medium">{customer.gstNo.length}/15</span>
                      </div>
                    </div>
                    {!manualEntry && customer.gstNo && customer.gstNo.length === 15 && !gstFetched && (
                      <div className="flex items-center text-xs text-blue-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Click "Fetch Details" to auto-fill customer information
                      </div>
                    )}
                    {gstFetched && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        GST details fetched successfully
                      </div>
                    )}
                    {customer.gstNo && customer.gstNo.length === 15 && manualEntry && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Valid GST number format
                      </div>
                    )}
                    {customer.gstNo && customer.gstNo.length > 0 && customer.gstNo.length !== 15 && (
                      <div className="flex items-center text-xs text-amber-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        GST number must be exactly 15 characters
                    </div>
                    )}
                  </div>
                </div>

                {/* Customer Information Section */}
                <div className={`space-y-6 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 9h-6v13h-2v-6h-2v6H9V11H3V9h18v2z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                      <p className="text-sm text-gray-600">
                        {isFormDisabled ? 'Enter GST number first to enable this section' : 'Basic details about the customer'}
                      </p>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={customer.name}
                        onChange={handleChange}
                        disabled={isFormDisabled}
                        placeholder="Enter customer name or business name"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {customer.name && !isFormDisabled && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Valid customer name
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information Section */}
                <div className={`space-y-6 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
                      <p className="text-sm text-gray-600">
                        {isFormDisabled ? 'Enter GST number first to enable this section' : 'Business and delivery locations'}
                      </p>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Business Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                          </svg>
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows={4}
                        required
                        value={customer.address}
                        onChange={handleChange}
                        disabled={isFormDisabled}
                        placeholder="Enter complete business address including street, city, state, and pincode"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none placeholder-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {customer.address && !isFormDisabled && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Address provided
                      </div>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">
                        Delivery Address <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                        <input
                          id="sameAsBusiness"
                          name="sameAsBusiness"
                          type="checkbox"
                          onChange={handleSameAddress}
                          disabled={isFormDisabled}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                        />
                        <label htmlFor="sameAsBusiness" className="ml-2 text-sm font-medium text-blue-700">
                          Same as business address
                        </label>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 8l-8 5-8-5V6l8 5 8-5v2zm0-2H4l8 4.99L20 6z"/>
                          </svg>
                      </div>
                      <textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        rows={4}
                        value={customer.deliveryAddress}
                        onChange={handleChange}
                        disabled={isFormDisabled}
                        placeholder="Enter delivery address if different from business address"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none placeholder-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

                        {/* Action Buttons */}
            <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-xl">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                <Link
                  href="/dashboard/customers"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || !customer.name || !customer.address || !customer.gstNo || customer.gstNo.length !== 15}
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Customer...
                    </>
                  ) : (
                    <>
                       <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                      </svg>
                       Create Customer
                    </>
                  )}
                </button>
              </div>
              
              {/* Form Progress Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Form Completion</span>
                  <span>{Math.round(((customer.name ? 1 : 0) + (customer.address ? 1 : 0) + (customer.gstNo && customer.gstNo.length === 15 ? 1 : 0)) / 3 * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${((customer.name ? 1 : 0) + (customer.address ? 1 : 0) + (customer.gstNo && customer.gstNo.length === 15 ? 1 : 0)) / 3 * 100}%` }}
                  />
                </div>
              </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
} 