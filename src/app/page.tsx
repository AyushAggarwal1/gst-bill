"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
 
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videoError, setVideoError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

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
            </div>

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

      {/* App Screenshot Section */}
      <div className="py-12 sm:py-16 lg:py-20 xl:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
              <span className="font-semibold">LIVE PREVIEW</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              Watch it in <span className="text-blue-600">action</span>
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
              See our GST Bill Maker in action with this comprehensive demo video. Discover how easy it is to create professional bills and manage your business.
            </p>
          </div>
          
          <div className="relative">
            {!videoError ? (
              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl sm:rounded-4xl shadow-2xl border-2 border-white/60 flex items-center justify-center">
                    <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl p-10 shadow-2xl border-2 border-blue-200/50 ring-4 ring-white/30">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <div className="absolute inset-0 w-20 h-20 border-2 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                      </div>
                      <p className="text-gray-800 text-base font-semibold mb-2">Loading demo animation...</p>
                      <p className="text-gray-600 text-sm">Large file - please wait</p>
                      <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl sm:rounded-4xl shadow-2xl border-2 border-white/60">
                  {/* Multiple border layers */}
                  <div className="relative p-3 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-2xl sm:rounded-3xl border border-blue-200/70 shadow-lg">
                    <div className="relative p-2 bg-white/80 rounded-xl sm:rounded-2xl border-2 border-gradient-to-r from-blue-300 to-purple-300 shadow-md">
                      <div className="relative overflow-hidden rounded-lg sm:rounded-xl ring-4 ring-blue-200/60 shadow-xl border-2 border-white/90">
                        <img
                          src="/images/gst_bill_demo.gif"
                          alt="GST Bill Maker Demo - See the application in action"
                          className="w-full h-auto"
                          onError={() => {
                            console.error('Failed to load GIF');
                            setVideoError(true);
                            setImageLoading(false);
                          }}
                          onLoad={() => {
                            console.log('GIF loaded successfully');
                            setImageLoading(false);
                          }}
                        />
                        
                        {/* Enhanced decorative corner elements */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-6 border-l-6 border-blue-500 rounded-tl-2xl opacity-80"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-6 border-r-6 border-purple-500 rounded-tr-2xl opacity-80"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-6 border-l-6 border-green-500 rounded-bl-2xl opacity-80"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-6 border-r-6 border-orange-500 rounded-br-2xl opacity-80"></div>
                        
                        {/* Additional corner accents */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-3 border-l-3 border-blue-300 rounded-tl-lg"></div>
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-3 border-r-3 border-purple-300 rounded-tr-lg"></div>
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-3 border-l-3 border-green-300 rounded-bl-lg"></div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-3 border-r-3 border-orange-300 rounded-br-lg"></div>
                        
                        {/* Side accent lines */}
                        <div className="absolute top-1/4 left-0 w-1 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full"></div>
                        <div className="absolute top-1/4 right-0 w-1 h-16 bg-gradient-to-b from-purple-400 to-purple-600 rounded-l-full"></div>
                        <div className="absolute bottom-1/4 left-0 w-1 h-16 bg-gradient-to-b from-green-400 to-green-600 rounded-r-full"></div>
                        <div className="absolute bottom-1/4 right-0 w-1 h-16 bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-full"></div>
                        
                        {/* Top and bottom accent lines */}
                        <div className="absolute top-0 left-1/4 h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-b-full"></div>
                        <div className="absolute top-0 right-1/4 h-1 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-b-full"></div>
                        <div className="absolute bottom-0 left-1/4 h-1 w-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-t-full"></div>
                        <div className="absolute bottom-0 right-1/4 h-1 w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-t-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Multiple outer glow effects */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl sm:rounded-4xl opacity-15 blur-xl -z-20"></div>
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-300 via-purple-300 to-orange-300 rounded-4xl opacity-10 blur-2xl -z-30"></div>
                  
                  {/* Animated border pulse */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl sm:rounded-4xl opacity-30 blur-sm animate-pulse -z-10"></div>
                </div>
                
                {/* Floating UI elements - Mobile optimized */}
                <div className="absolute top-2 sm:top-4 lg:top-6 left-2 sm:left-4 lg:left-6 bg-green-500 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold shadow-lg">
                  <div className="flex items-center">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">🎥 Live Demo</span>
                    <span className="sm:hidden">🎥 Demo</span>
                  </div>
                </div>
                <div className="absolute top-2 sm:top-4 lg:top-6 right-2 sm:right-4 lg:right-6 bg-white text-gray-800 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold shadow-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">🔄 Real-time Updates</span>
                    <span className="sm:hidden">🔄 Updates</span>
                  </div>
                </div>
                <div className="absolute bottom-2 sm:bottom-4 lg:bottom-6 left-2 sm:left-4 lg:left-6 bg-blue-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold shadow-lg">
                  <div className="flex items-center">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">📊 Analytics Ready</span>
                    <span className="sm:hidden">📊 Analytics</span>
                  </div>
                </div>
                <div className="absolute bottom-2 sm:bottom-4 lg:bottom-6 right-2 sm:right-4 lg:right-6 bg-yellow-500 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold shadow-lg">
                  <div className="flex items-center">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">🚀 Fast & Secure</span>
                    <span className="sm:hidden">🚀 Secure</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-20 text-center ring-1 ring-gray-200">
                <div className="w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <svg className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">Demo Animation</h3>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg mx-auto mb-6">Watch our comprehensive demo to see GST Bill Maker in action and discover all its powerful features</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <p><strong>Demo animation not available.</strong> The GIF file could not be loaded. Please check if the file exists in the correct location.</p>
                </div>
              </div>
            )}
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
