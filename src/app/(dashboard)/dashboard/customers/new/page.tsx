"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    deliveryAddress: "",
    gstNo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCustomer((prev) => ({
        ...prev,
        deliveryAddress: prev.address,
      }));
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

  // Form completion progress
  const getCompletionPercentage = () => {
    const fields = [customer.name, customer.address, customer.gstNo];
    const completed = fields.filter(field => field.trim() !== "").length;
    return Math.round((completed / fields.length) * 100);
  };

  const completion = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Mobile-Optimized Header with Progress */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20 print:hidden sticky top-0 z-40">
        <div className="max-w-7xl mx-auto py-3 px-3 sm:py-4 sm:px-6 lg:px-8">
          {/* Mobile Header Layout */}
          <div className="flex items-start justify-between mb-3 sm:mb-0 sm:items-center">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Add New Customer</h1>
                  <div className="flex items-center bg-blue-50 px-2 py-0.5 rounded-full mt-1 sm:mt-0 self-start">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-blue-700">{completion}% Complete</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">Create a new customer profile for your business</p>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/customers"
              className="inline-flex items-center px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm group flex-shrink-0"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Customers</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          
          {/* Mobile-Optimized Progress Bar */}
          <div className="mt-2 sm:mt-3">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-600 mb-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Form Progress</span>
              <span className="sm:hidden">Progress</span>
              <span className="ml-auto font-medium">{completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-4 px-3 sm:py-8 sm:px-6 lg:px-8">
        {/* Mobile-Optimized Form Status Card */}
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Customer Registration</h3>
                <p className="text-xs sm:text-sm text-gray-600">Fill in the required information to add a new customer</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${customer.name ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full ${customer.address ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full ${customer.gstNo ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <span className="text-xs font-medium text-gray-500">3 Required Fields</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl sm:rounded-2xl border border-white/20 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Mobile-Optimized Error Message */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-red-800">Registration Error</h3>
                      <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                {/* Mobile-Optimized Customer Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">Customer Information</h2>
                      <p className="text-xs sm:text-sm text-gray-600">Basic details about the customer</p>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                        Customer Name
                      </label>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Required
                      </span>
                      {customer.name && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="organization"
                        required
                        value={customer.name}
                        onChange={handleChange}
                        placeholder="Enter customer name or business name"
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-200 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile-Optimized Address Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">Address Information</h2>
                      <p className="text-xs sm:text-sm text-gray-600">Business and delivery locations</p>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-900">
                        Business Address
                      </label>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Required
                      </span>
                      {customer.address && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        required
                        value={customer.address}
                        onChange={handleChange}
                        placeholder="Enter customer's complete business address with pincode"
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-200 resize-none text-base sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-gray-900">
                          Delivery Address
                        </label>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Optional
                        </span>
                      </div>
                      <div className="flex items-center bg-blue-50 px-3 py-1 rounded-lg">
                        <input
                          id="sameAsBusiness"
                          name="sameAsBusiness"
                          type="checkbox"
                          onChange={handleSameAddress}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                        />
                        <label htmlFor="sameAsBusiness" className="ml-2 text-xs sm:text-sm font-medium text-blue-700 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Same as business
                        </label>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                          </svg>
                        </div>
                      </div>
                      <textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        rows={3}
                        value={customer.deliveryAddress}
                        onChange={handleChange}
                        placeholder="Enter shipping/delivery address if different from business address"
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-200 resize-none text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile-Optimized Tax Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">Tax Information</h2>
                      <p className="text-xs sm:text-sm text-gray-600">GST registration details</p>
                    </div>
                  </div>

                  {/* GST Number */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="gstNo" className="block text-sm font-semibold text-gray-900">
                        GST Number
                      </label>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Required
                      </span>
                      {customer.gstNo && customer.gstNo.length === 15 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Valid Format
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
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
                        className="block w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-200 font-mono text-base sm:text-lg tracking-wider"
                      />
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <p className="text-xs text-gray-500 flex items-center">
                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Format: 22AAAAA0000A1Z5 (15 digits)
                      </p>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                        </svg>
                        Character count: {customer.gstNo.length}/15
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Action Buttons */}
            <div className="px-4 py-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50/50 to-blue-50/30 border-t border-gray-100">
              {/* Mobile: Stacked buttons with full width */}
              <div className="flex flex-col gap-3 sm:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-6 py-4 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group touch-manipulation"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Customer Profile...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Customer Profile
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard/customers"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-xl text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm group touch-manipulation"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Registration
                </Link>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden sm:flex sm:justify-end gap-3">
                <Link
                  href="/dashboard/customers"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Registration
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      Creating Customer Profile...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Customer Profile
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