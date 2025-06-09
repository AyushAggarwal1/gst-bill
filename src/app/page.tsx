"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
 
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();


  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="text-center space-y-2">
            <p className="text-gray-700 font-semibold text-base sm:text-lg">Loading GST Bill Maker</p>
            <p className="text-gray-500 text-sm">Preparing your billing solution...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-blue-50 text-blue-800 rounded-full border border-blue-200 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">GST Compliance Made Simple</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
              <span className="block mb-2">GST Bill Maker</span>
              <span className="block text-blue-600">
                Simplified Billing Solution
              </span>
            </h1>
            
            <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
              Create <span className="font-semibold text-blue-600">GST-compliant invoices</span> efficiently. 
              Manage customers, products, and bills all in one place with our 
              <span className="font-semibold text-blue-600"> intuitive platform</span>.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Go to Dashboard
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Get Started
                    </span>
                  </Link>
                  
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Account
                    </span>
                  </Link>
                </>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/search-gst"
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search GST No.
                  </span>
                </Link>
                
                <Link
                  href="/search-hsn"
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Search HSN Codes
                  </span>
                </Link>
              </div>
            </div>

            {/* Welcome message for logged-in users */}
            {status === "authenticated" && session?.user && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 font-medium">
                    Welcome back, {session.user.name || session.user.email}!
                  </p>
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
              <div className="flex items-center">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-3 sm:w-4 h-3 sm:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Free to Start</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">GST Compliant</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full border border-blue-200 shadow-sm">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">SEE IT IN ACTION</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Watch how <span className="text-blue-600">easy</span> it is to create GST bills
            </h2>
            
            <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
              See our intuitive interface in action. Create professional GST-compliant invoices 
              in just a few clicks with our streamlined workflow.
            </p>
          </div>

          {/* Demo GIF Container */}
          <div className="max-w-5xl mx-auto px-2 sm:px-0">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-6 lg:p-8 border border-blue-200">
              {/* Browser-like header */}
              <div className="flex items-center space-x-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-100 rounded-full px-3 py-1.5 text-xs sm:text-sm text-gray-600 text-center">
                    GST Bill Maker - Create Invoice
                  </div>
                </div>
              </div>
              
              {/* Demo Video with GIF Fallback */}
              <div className="relative overflow-hidden rounded-xl bg-gray-100">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-contain max-w-full block mx-auto"
                  style={{
                    minHeight: '200px',
                    maxHeight: '600px',
                    maxWidth: '100%'
                  }}
                  poster="/images/gst_bill_demo.gif"
                >
                  <source src="/images/gst_bill_demo.mp4" type="video/mp4" />
                  {/* Fallback to GIF for browsers that don't support video */}
                  Your browser does not support the video tag.
                </video>
                
                {/* GIF fallback for browsers without video support */}
                <noscript>
                  <img
                    src="/images/gst_bill_demo.gif"
                    alt="GST Bill Maker Demo - Creating professional GST invoices"
                    className="w-full h-auto object-contain max-w-full block mx-auto"
                    style={{
                      minHeight: '200px',
                      maxHeight: '600px',
                      maxWidth: '100%'
                    }}
                  />
                </noscript>
                
                {/* Play indicator overlay */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 flex items-center space-x-1 sm:space-x-2">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">LIVE DEMO</span>
                </div>
              </div>
              
              {/* Demo highlights */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Quick Setup</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Add customers and products in seconds</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Auto Calculations</h4>
                  <p className="text-xs sm:text-sm text-gray-600">GST, totals calculated automatically</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Export & Share</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Download PDF or share instantly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action below demo */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Ready to streamline your billing process?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Go to Dashboard
                  </span>
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Try It Now - Free
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20 xl:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 text-xs sm:text-sm bg-blue-50 text-blue-800 rounded-full border border-blue-200">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></span>
              CORE FEATURES
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Everything you need for <span className="text-blue-600">GST billing</span>
            </h2>
            <p className="mt-2 sm:mt-4 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
              Streamline your billing process with our comprehensive set of tools designed specifically for Indian businesses and GST compliance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                title: "Customer Management",
                description: "Easily add and manage customer information including business details, delivery address, and GST numbers with smart validation.",
                features: ["Smart GST Validation", "Contact Management", "Business Profiles"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                ),
                title: "Product Inventory",
                description: "Maintain a comprehensive catalog of your products with HSN codes and applicable tax rates for lightning-fast billing.",
                features: ["HSN Code Database", "Tax Rate Management", "Quick Product Search"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
                title: "GST-Compliant Billing",
                description: "Generate professional bills with automatic tax calculations for CGST, SGST, and IGST as per the latest GST requirements.",
                features: ["Auto Tax Calculation", "Compliance Verification", "Professional Templates"]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                {/* Icon */}
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <svg className="h-6 sm:h-7 w-6 sm:w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {feature.icon}
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
                  {feature.description}
                </p>
                
                {/* Feature list */}
                <ul className="space-y-2 sm:space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-xs sm:text-sm text-gray-500">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 xl:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-blue-50 text-blue-800 rounded-full border border-blue-200 shadow-sm">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">ADDITIONAL FEATURES</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Powerful tools for <span className="text-blue-600">modern businesses</span>
            </h2>
            
            <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
              Discover advanced features designed to streamline your workflow and boost productivity. 
              Everything you need to manage your business efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: "Invoice History",
                description: "Access your complete billing history with advanced search, filtering, and sorting capabilities.",
                features: ["Advanced Search", "Date Range Filters", "Export Options"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                title: "Professional Templates",
                description: "Create stunning invoices with customizable templates that reflect your brand identity.",
                features: ["Custom Branding", "Multiple Layouts", "Logo Integration"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ),
                title: "Easy Export & Share",
                description: "Seamlessly export invoices as PDF, print directly, or share via email with your customers.",
                features: ["PDF Export", "Direct Printing", "Email Integration"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                title: "Business Analytics",
                description: "Get insights into your business performance with comprehensive reports and analytics.",
                features: ["Revenue Tracking", "Customer Insights", "Performance Metrics"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: "Secure & Reliable",
                description: "Your business data is protected with enterprise-grade security and automatic backups.",
                features: ["Data Encryption", "Auto Backups", "99.9% Uptime"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                ),
                title: "Mobile Optimized",
                description: "Access your billing system anywhere, anytime with our fully responsive mobile interface.",
                features: ["Mobile App", "Offline Access", "Cross-platform"]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                {/* Icon */}
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <svg className="h-7 sm:h-8 w-7 sm:w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {feature.icon}
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
                  {feature.description}
                </p>
                
                {/* Feature highlights */}
                <ul className="space-y-2 sm:space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-xs sm:text-sm text-gray-500">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GST Search CTA Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 shadow-sm">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">FREE GST TOOL</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Verify any <span className="text-emerald-600">GST number</span> instantly
            </h2>
            
            <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0 mb-8 sm:mb-12">
              Use our free GST search tool to verify business details, check GST status, and get complete information 
              about any registered business in India. No registration required!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-emerald-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left side - Features */}
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Verification</h3>
                      <p className="text-gray-600">Get real-time GST status and business information from official government database</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Business Details</h3>
                      <p className="text-gray-600">Access legal name, trade name, address, jurisdiction, and business nature information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Free & Secure</h3>
                      <p className="text-gray-600">No registration required. Your searches are secure and not stored on our servers</p>
                    </div>
                  </div>
                </div>

                {/* Right side - CTA */}
                <div className="text-center lg:text-left">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">Try GST Search Now</h3>
                    <p className="text-emerald-100 mb-6 leading-relaxed">
                      Enter any GST number and get instant verification with complete business details. 
                      Perfect for due diligence and business verification.
                    </p>
                    
                    <div className="space-y-4">
                      <Link
                        href="/search-gst"
                        className="w-full inline-flex items-center justify-center px-6 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search GST Numbers
                      </Link>
                      
                      <p className="text-xs text-emerald-200">
                        ✨ No account needed • Instant results • Free forever
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional benefits */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-gray-600 text-sm">Get results in seconds with our optimized search engine</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Accurate Data</h4>
              <p className="text-gray-600 text-sm">Official government database ensures 100% accurate information</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h4>
              <p className="text-gray-600 text-sm">Search GST numbers on any device, anywhere, anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* HSN Search CTA Section */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-orange-100 text-orange-800 rounded-full border border-orange-200 shadow-sm">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">FREE HSN TOOL</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Find <span className="text-orange-600">HSN codes</span> instantly
            </h2>
            
            <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0 mb-8 sm:mb-12">
              Search for HSN (Harmonized System of Nomenclature) codes for any product or service. 
              Get accurate tax rates and classification details for GST compliance.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-orange-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left side - Features */}
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart HSN Search</h3>
                      <p className="text-gray-600">Find HSN codes by product name, description, or category with intelligent search</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Rate Information</h3>
                      <p className="text-gray-600">Get CGST, SGST, IGST rates and cess details for accurate billing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Always Updated</h3>
                      <p className="text-gray-600">Latest HSN codes and tax rates as per government notifications</p>
                    </div>
                  </div>
                </div>

                {/* Right side - CTA */}
                <div className="text-center lg:text-left">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">Search HSN Codes</h3>
                    <p className="text-orange-100 mb-6 leading-relaxed">
                      Find the right HSN code for your products and services. Get tax rates, 
                      descriptions, and ensure GST compliance with ease.
                    </p>
                    
                    <div className="space-y-4">
                      <Link
                        href="/search-hsn"
                        className="w-full inline-flex items-center justify-center px-6 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Find HSN Codes
                      </Link>
                      
                      <p className="text-xs text-orange-200">
                        🔍 Smart search • Tax rates included • Free to use
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional benefits */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Database</h4>
              <p className="text-gray-600 text-sm">Access to complete HSN code directory with detailed descriptions</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Tax Rate Calculator</h4>
              <p className="text-gray-600 text-sm">Automatic calculation of applicable GST rates for each HSN code</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-orange-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Easy Integration</h4>
              <p className="text-gray-600 text-sm">Seamlessly integrate HSN codes into your billing workflow</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 xl:py-28 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-white/20 text-white rounded-full border border-white/30 shadow-lg">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">JOIN THOUSANDS OF BUSINESSES</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-6 sm:mb-8 tracking-tight px-4 sm:px-0">
              Ready to 
              <span className="block text-blue-100">
                streamline your GST billing?
              </span>
            </h2>
            
            <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed px-4 sm:px-0">
              Start creating professional GST-compliant invoices today. Join thousands of businesses 
              that trust our platform to manage their billing efficiently.
            </p>
            
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white text-blue-600 font-bold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200"
              >
                <span className="flex items-center justify-center text-base sm:text-lg">
                  <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started Free
                </span>
              </Link>
              
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-white font-bold rounded-xl sm:rounded-2xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 text-base sm:text-lg"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </span>
              </Link>
            </div>
            
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-blue-100 px-4 sm:px-0">
              <div className="flex items-center">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-sm sm:text-base">Free to start</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-sm sm:text-base">No credit card required</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-sm sm:text-base">Setup in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            {/* Brand Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
              <div className="h-12 sm:h-16 w-12 sm:w-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-3 sm:mb-0">
                <svg className="h-6 sm:h-9 w-6 sm:w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="sm:ml-4 text-2xl sm:text-3xl font-bold text-white">GST Bill Maker</span>
            </div>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
              Simplifying GST billing for businesses across India. Create professional invoices and stay compliant with ease.
            </p>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
                <p className="text-gray-400 text-sm sm:text-base">
                  &copy; {new Date().getFullYear()} GST Bill Maker. All rights reserved.
                </p>
                <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</Link>
                  <Link href="/terms-of-service" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</Link>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs sm:text-sm text-gray-400">
                  Crafted with ❤️ by <a href="https://github.com/AyushAggarwal1" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">Ayush Aggarwal</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
