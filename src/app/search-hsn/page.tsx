'use client';

import React, { useState } from 'react';
import { PageHeader, Card, CardContent, LoadingSpinner } from '@/components/ui';

interface HSNItem {
  hsnCode: string;
  description: string;
  type: string;
  gstRate: number;
  integratedTax: number;
  centralTax: number;
  stateTax: number;
  cess: string;
  notificationNumber: number;
}

interface APIResponse {
  success: boolean;
  keyword: string;
  totalResults: number;
  data?: HSNItem[];
  source: string;
  retrievedAt: string;
  error?: string;
}

export default function HSNSearchPage() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<APIResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('Please enter an HSN code or item name');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/gst/hsnverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      const data: APIResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search HSN codes');
      }

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getGSTRateColor = (rate: number) => {
    if (rate === 0) return 'text-green-600 bg-green-50';
    if (rate <= 5) return 'text-blue-600 bg-blue-50';
    if (rate <= 12) return 'text-yellow-600 bg-yellow-50';
    if (rate <= 18) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const toggleDescription = (index: number) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDescriptions(newExpanded);
  };

  const formatDescription = (description: string, index: number) => {
    const isLongDescription = description.length > 300;
    const isExpanded = expandedDescriptions.has(index);
    const displayText = isLongDescription && !isExpanded 
      ? description.substring(0, 300) + '...' 
      : description;

    return { displayText, isLongDescription, isExpanded };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a
                href="/"
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </a>
              {/* <a
                href="/search-gst"
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium ml-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                GST No. Search
              </a> */}
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/login"
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title="HSN Code Search"
        description="Search HSN codes by item name or HSN number to get GST rates and tax details"
        icon={
          <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        }
      />

      {/* CTA Banner */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Streamline Your HSN Code Management
                </h2>
                <p className="text-green-100 text-lg max-w-2xl">
                  Create an account to save HSN searches, generate accurate GST bills with correct tax rates, and manage your product catalog efficiently.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center text-green-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save HSN Searches
                  </div>
                  <div className="flex items-center text-green-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Product Catalog
                  </div>
                  <div className="flex items-center text-green-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accurate Tax Rates
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <a
                  href="/register"
                  className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Free Trial
                  </div>
                </a>
                <a
                  href="/login"
                  className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-green-600 transition-all duration-200 text-center"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="mb-8">
          {/* Search Input Card */}
          <div>
            <Card>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN Code or Item Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter HSN code (e.g., 6815) or item name (e.g., bricks)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={isLoading || !keyword.trim()}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search HSN Codes
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Pro Tip CTA */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-amber-800">
                          💡 Pro Tip: Create a free account to save your HSN searches and build your product catalog!
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <a
                            href="/register"
                            className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
                          >
                            Sign Up Free
                          </a>
                          <a
                            href="/login"
                            className="inline-flex items-center px-3 py-1.5 bg-white text-amber-700 text-xs font-medium rounded-md border border-amber-300 hover:bg-amber-50 transition-colors"
                          >
                            Sign In
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {result && result.success && (
          <div className="space-y-6">
            {/* Results Header Card */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Search Results
                      </h2>
                      <p className="text-sm text-gray-600">
                        Found {result.totalResults} HSN code{result.totalResults !== 1 ? 's' : ''} for "{result.keyword}"
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Retrieved from {result.source}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.retrievedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HSN Results */}
            <div className="grid gap-6">
              {result.data?.map((item, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* HSN Code and Description */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            HSN: {item.hsnCode}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.type === 'Goods' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        
                        {/* Enhanced Description Display */}
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Description
                            </h4>
                            {item.description.length > 200 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {item.description.split(' ').length} words
                              </span>
                            )}
                          </div>
                          
                          <div className="text-gray-900 leading-relaxed">
                            {(() => {
                              const { displayText, isLongDescription, isExpanded } = formatDescription(item.description, index);
                              
                              if (displayText.includes('\n') || displayText.includes(';') || displayText.includes('(')) {
                                // Format descriptions with line breaks, semicolons, or parentheses
                                return (
                                  <div className="space-y-2">
                                    {displayText
                                      .split(/[;\n]/)
                                      .filter(part => part.trim())
                                      .map((part, idx) => (
                                        <div key={idx} className="flex items-start">
                                          {displayText.includes(';') && (
                                            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                          )}
                                          <span className="text-gray-800 leading-relaxed">
                                            {part.trim()}
                                          </span>
                                        </div>
                                      ))}
                                    
                                    {/* Expand/Collapse button for long descriptions */}
                                    {isLongDescription && (
                                      <button
                                        onClick={() => toggleDescription(index)}
                                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors duration-200"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                            </svg>
                                            Show Less
                                          </>
                                        ) : (
                                          <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                            Show More
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              } else {
                                // Simple description without special formatting
                                return (
                                  <div>
                                    <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                                      {displayText}
                                    </p>
                                    
                                    {/* Expand/Collapse button for long descriptions */}
                                    {isLongDescription && (
                                      <button
                                        onClick={() => toggleDescription(index)}
                                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors duration-200"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                            </svg>
                                            Show Less
                                          </>
                                        ) : (
                                          <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                            Show More
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Tax Details */}
                      <div className="lg:w-80 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Tax Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">GST Rate:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGSTRateColor(item.gstRate)}`}>
                              {item.gstRate}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">IGST:</span>
                            <span className="font-medium text-gray-900">{item.integratedTax}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">CGST:</span>
                            <span className="font-medium text-gray-900">{item.centralTax}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">SGST:</span>
                            <span className="font-medium text-gray-900">{item.stateTax}%</span>
                          </div>
                          {item.cess !== 'N/A' && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Cess:</span>
                              <span className="font-medium text-gray-900">{item.cess}</span>
                            </div>
                          )}
                          {item.notificationNumber > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Notification No:</span>
                              <span className="font-medium text-gray-900">{item.notificationNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Section - Always visible */}
        <div className="mt-12">
          <Card>
            <CardContent>
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Streamline Your HSN Code Management?
                  </h3>
                  <p className="text-gray-300 mb-8 max-w-3xl mx-auto">
                    Join thousands of businesses using our platform to manage HSN codes, 
                    generate accurate GST invoices, and streamline their tax compliance.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold mb-1">HSN Search</h4>
                      <p className="text-sm text-gray-400">Find HSN codes and tax rates instantly</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold mb-1">GST Search</h4>
                      <p className="text-sm text-gray-400">Verify any GST number instantly</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold mb-1">Invoice Generation</h4>
                      <p className="text-sm text-gray-400">Create professional GST bills</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h4 className="font-semibold mb-1">Product Catalog</h4>
                      <p className="text-sm text-gray-400">Organize your inventory with HSN codes</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/register"
                      className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Get Started Free
                      </div>
                    </a>
                    <a
                      href="/login"
                      className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-gray-900 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        Sign In
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 