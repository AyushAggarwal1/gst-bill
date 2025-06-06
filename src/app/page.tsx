"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// Import dashboard image directly
import dashboardImage from "../../public/images/dashboard.png";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-success-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative flex flex-col items-center space-y-8">
          {/* Enhanced loading spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-600 border-t-transparent absolute top-0 left-0"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          {/* Loading text with better typography */}
          <div className="text-center space-y-2">
            <p className="text-primary-700 font-semibold text-lg">Loading GST Bill Maker</p>
            <p className="text-primary-600/70 text-sm">Preparing your billing solution...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-gradient-to-br from-primary-200/30 to-primary-300/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
            <div className="w-80 h-80 bg-gradient-to-br from-success-200/20 to-warning-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-primary-400 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute top-32 right-20 w-3 h-3 bg-success-400 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-20 w-2 h-2 bg-warning-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 right-10 w-6 h-6 border-2 border-primary-300 rotate-45 opacity-30 animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>

                <div className="relative pt-16 pb-20 sm:pb-24 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center px-6 py-3 mb-8 text-sm bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 rounded-full border border-primary-200 shadow-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                <span className="font-semibold">✨ GST Compliance Made Simple</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
                <span className="block mb-2">GST Bill Maker</span>
                <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent animate-gradient">
                  Simplified Billing Solution
                </span>
              </h1>
              
              <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                Create <span className="font-semibold text-primary-600">GST-compliant invoices</span> efficiently. 
                Manage customers, products, and bills all in one place with our 
                <span className="font-semibold text-primary-600"> intuitive platform</span>.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/login"
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get Started
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </Link>
                
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl border-2 border-primary-200 hover:border-primary-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Account
                  </span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Free to Start</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">GST Compliant</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Enhanced App Screenshot Section */}
        <div className="relative py-20 sm:py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 mb-8 text-sm bg-gray-900/10 backdrop-blur-sm text-gray-700 rounded-full border border-gray-200/50 shadow-lg">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                <span className="font-semibold">LIVE PREVIEW</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                See it in 
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"> action</span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
                Experience our intuitive dashboard designed for modern businesses. Everything you need at your fingertips.
              </p>
            </div>
            
            <div className="relative group">
              {!imageError ? (
                <div className="relative">
                  {/* Enhanced glowing background effect */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-primary-600/30 via-primary-500/20 to-primary-400/30 rounded-3xl blur-3xl opacity-60 group-hover:opacity-90 transition-all duration-700"></div>
                  
                  {/* Main image container */}
                  <div className="relative">
                    <Image
                      className="relative rounded-2xl shadow-2xl ring-1 ring-gray-900/10 transform group-hover:scale-[1.02] transition-all duration-700 backdrop-blur-sm"
                      src={dashboardImage}
                      alt="GST Bill Maker Dashboard"
                      priority
                      onError={() => setImageError(true)}
                    />
                    
                    {/* Enhanced floating UI elements */}
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-success-500 to-success-600 text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl animate-pulse border border-white/20">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        ✅ Live Dashboard
                      </div>
                    </div>
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm text-gray-800 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl border border-gray-200/50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-spin"></div>
                        🔄 Real-time Updates
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl border border-white/20">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        📊 Analytics Ready
                      </div>
                    </div>
                    <div className="absolute bottom-6 right-6 bg-gradient-to-r from-warning-500 to-warning-600 text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl border border-white/20">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        🚀 Fast & Secure
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl shadow-2xl p-20 text-center ring-1 ring-gray-200/50 group-hover:shadow-3xl transition-all duration-500">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-14 h-14 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM1 15a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm12-10a2 2 0 00-2 2v11a3 3 0 106 0V7a2 2 0 00-2-2h-2zM11 17a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-extrabold text-gray-900 mb-6">Powerful Dashboard</h3>
                  <p className="text-gray-600 text-xl leading-relaxed max-w-lg mx-auto">Experience the power of streamlined billing with our intuitive and feature-rich interface</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

            {/* Enhanced Features Section */}
      <div className="bg-gray-900 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-success-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-28 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm bg-primary-900/50 text-primary-300 rounded-full border border-primary-700/50 backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></span>
              CORE FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Everything you need for 
              <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent"> GST billing</span>
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
              Streamline your billing process with our comprehensive set of tools designed specifically for Indian businesses and GST compliance.
            </p>
          </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                title: "Customer Management",
                description: "Easily add and manage customer information including business details, delivery address, and GST numbers with smart validation.",
                features: ["Smart GST Validation", "Contact Management", "Business Profiles"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                ),
                title: "Product Inventory",
                description: "Maintain a comprehensive catalog of your products with HSN codes and applicable tax rates for lightning-fast billing.",
                features: ["HSN Code Database", "Tax Rate Management", "Quick Product Search"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
                title: "GST-Compliant Billing",
                description: "Generate professional bills with automatic tax calculations for CGST, SGST, and IGST as per the latest GST requirements.",
                features: ["Auto Tax Calculation", "Compliance Verification", "Professional Templates"]
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                {/* Glowing border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-2xl blur opacity-20 group-hover:opacity-60 transition-all duration-500"></div>
                
                <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 h-full hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50 group-hover:border-primary-500/50">
                  {/* Icon with animated background */}
                  <div className="relative mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {feature.icon}
                      </svg>
                    </div>
                    <div className="absolute -inset-2 bg-primary-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Feature list */}
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <div className="w-1.5 h-1.5 bg-success-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced More Features Section */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-primary-50 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-success-100/20 rounded-full blur-2xl"></div>
          {/* Floating shapes */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-primary-300 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-success-300 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 right-32 w-4 h-4 bg-warning-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-28 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 mb-8 text-sm bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 rounded-full border border-primary-200 shadow-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold">ADDITIONAL FEATURES</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Powerful tools for 
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"> modern businesses</span>
            </h2>
            
            <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Discover advanced features designed to streamline your workflow and boost productivity. 
              Everything you need to manage your business efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: "Invoice History",
                description: "Access your complete billing history with advanced search, filtering, and sorting capabilities.",
                features: ["Advanced Search", "Date Range Filters", "Export Options"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                title: "Professional Templates",
                description: "Create stunning invoices with customizable templates that reflect your brand identity.",
                features: ["Custom Branding", "Multiple Layouts", "Logo Integration"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ),
                title: "Easy Export & Share",
                description: "Seamlessly export invoices as PDF, print directly, or share via email with your customers.",
                features: ["PDF Export", "Direct Printing", "Email Integration"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                title: "Business Analytics",
                description: "Get insights into your business performance with comprehensive reports and analytics.",
                features: ["Revenue Tracking", "Customer Insights", "Performance Metrics"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: "Secure & Reliable",
                description: "Your business data is protected with enterprise-grade security and automatic backups.",
                features: ["Data Encryption", "Auto Backups", "99.9% Uptime"]
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                ),
                title: "Mobile Optimized",
                description: "Access your billing system anywhere, anytime with our fully responsive mobile interface.",
                features: ["Mobile App", "Offline Access", "Cross-platform"]
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                {/* Card with enhanced styling */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-primary-300/50 group-hover:-translate-y-2">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Icon with enhanced design */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {feature.icon}
                      </svg>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute -inset-2 bg-primary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="relative text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="relative text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Feature highlights */}
                  <ul className="relative space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-success-400 to-success-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

            {/* Enhanced CTA Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
        {/* Enhanced background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-white/20 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-white/30 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-32 w-4 h-4 bg-white/20 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-24 sm:px-6 lg:py-28 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 mb-8 text-sm bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30 shadow-lg">
              <div className="w-2 h-2 bg-success-400 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold">JOIN THOUSANDS OF BUSINESSES</span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight">
              Ready to 
              <span className="block bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                streamline your GST billing?
              </span>
            </h2>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-primary-100 leading-relaxed">
              Start creating professional GST-compliant invoices today. Join thousands of businesses 
              that trust our platform to manage their billing efficiently.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group relative px-10 py-5 bg-white text-primary-600 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center text-lg">
                  <svg className="w-6 h-6 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started Free
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </Link>
              
              <Link
                href="/login"
                className="group px-10 py-5 text-white font-bold rounded-2xl border-2 border-white/30 hover:border-white/60 backdrop-blur-sm hover:bg-white/15 transform hover:-translate-y-2 transition-all duration-500 text-lg"
              >
                <span className="flex items-center">
                  <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </span>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-100">
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-success-500/20 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Free to start</span>
              </div>
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-success-500/20 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-success-500/20 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Setup in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* Enhanced Footer */}
      <footer className="bg-gray-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-success-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="text-center mb-12">
            {/* Brand Section */}
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">GST Bill Maker</span>
            </div>
            <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto">
              Simplifying GST billing for businesses across India. Create professional invoices and stay compliant with ease.
            </p>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-gray-400">
                  &copy; {new Date().getFullYear()} GST Bill Maker. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm">
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-primary-400 transition-colors">Privacy Policy</Link>
                  <Link href="/terms-of-service" className="text-gray-400 hover:text-primary-400 transition-colors">Terms of Service</Link>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-400">
                  Crafted with ❤️ by <a href="https://github.com/AyushAggarwal1" target="_blank" rel="noopener noreferrer" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">Ayush Aggarwal</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
