"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {/* Background Elements */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-gradient-to-br from-primary-200/30 to-primary-300/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
            <div className="w-80 h-80 bg-gradient-to-br from-success-200/20 to-warning-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        <div className="relative pt-16 pb-20 sm:pb-24 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-3 mb-8 text-sm bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 rounded-full border border-primary-200 shadow-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                <span className="font-semibold">LEGAL INFORMATION</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
                  Privacy Policy
                </span>
              </h1>
              
              <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use GST Bill Maker.
              </p>

              <div className="mt-8 text-gray-500">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-primary max-w-none">
            {/* Information We Collect */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Information We Collect
              </h2>
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Account Information:</strong> Name, email address, phone number, and business details</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Business Data:</strong> Customer information, product details, invoices, and transaction records</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Usage Data:</strong> Information about how you use our service, including features accessed and time spent</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                How We Use Your Information
              </h2>
              <div className="bg-success-50 rounded-2xl p-8 border border-success-200/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Provision</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Create and manage invoices</li>
                      <li>• Process GST calculations</li>
                      <li>• Store customer and product data</li>
                      <li>• Generate reports and analytics</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Send service updates</li>
                      <li>• Provide customer support</li>
                      <li>• Share important notifications</li>
                      <li>• Respond to inquiries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Data Security & Protection
              </h2>
              <div className="bg-warning-50 rounded-2xl p-8 border border-warning-200/50">
                <p className="text-gray-700 mb-6">We implement industry-standard security measures to protect your data:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-warning-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
                    <p className="text-sm text-gray-600">End-to-end encryption for all data transmission</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-warning-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
                    <p className="text-sm text-gray-600">Data stored on secure, compliant servers</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-warning-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m13 0h-6m-5-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
                    <p className="text-sm text-gray-600">Limited access based on roles and permissions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Your Rights & Choices
              </h2>
              <div className="bg-purple-50 rounded-2xl p-8 border border-purple-200/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Rights</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Access your personal data
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Correct inaccurate information
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Request data deletion
                      </li>
                      <li className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Export your data
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>ayushaggarwal1136@gmail.com</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        To exercise any of these rights, please contact us using the information above. We will respond to your request within 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes to Policy */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                Changes to This Policy
              </h2>
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200/50">
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. 
                  We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Questions about our 
              <span className="block">Privacy Policy?</span>
            </h2>
            
            <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-100 leading-relaxed">
              If you have any questions or concerns about how we handle your data, we're here to help.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="mailto:ayushaggarwal1136@gmail.com"
                className="group relative px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Privacy Team
                </span>
              </Link>
              
              <Link
                href="/"
                className="group px-8 py-4 text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 backdrop-blur-sm hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 