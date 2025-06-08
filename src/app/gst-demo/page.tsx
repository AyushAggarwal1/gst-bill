'use client';

import { useState } from 'react';
import GSTValidator from '@/components/GSTValidator';
import { GSTVerificationResponse } from '@/lib/gst-validator';

export default function GSTDemoPage() {
  const [validationResults, setValidationResults] = useState<GSTVerificationResponse[]>([]);

  const handleValidation = (result: GSTVerificationResponse) => {
    setValidationResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  const sampleGSTINs = [
    { gstin: '27AAACI1681G1Z0', description: 'Valid GSTIN (Maharashtra)' },
    { gstin: '09AAACI1681G1Z5', description: 'Valid GSTIN (Uttar Pradesh)' },
    { gstin: '29AAACI1681G1Z8', description: 'Valid GSTIN (Karnataka)' },
    { gstin: '12345678901234', description: 'Invalid GSTIN (wrong format)' },
    { gstin: '99AAACI1681G1Z0', description: 'Invalid GSTIN (invalid state code)' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GST Number Validation Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Validate GST numbers using format validation and optional online verification. 
            This demo shows both client-side validation and API integration capabilities.
          </p>
        </div>

        {/* Main Validator */}
        <div className="mb-8">
          <GSTValidator
            onValidation={handleValidation}
            showBusinessInfo={true}
            enableOnlineVerification={false}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Sample GSTINs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sample GST Numbers for Testing
            </h2>
            <div className="space-y-3">
              {sampleGSTINs.map((sample, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <code className="text-sm font-mono text-blue-600">{sample.gstin}</code>
                    <p className="text-xs text-gray-500 mt-1">{sample.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      const input = document.getElementById('gstin-input') as HTMLInputElement;
                      if (input) {
                        input.value = sample.gstin;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Try
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Integration Guide */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              API Integration Guide
            </h2>
            
            <div className="space-y-6">
              {/* Format Validation API */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  1. Format Validation (GET)
                </h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <code className="text-sm">
                    GET /api/gst/verify?gstin=27AAACI1681G1Z0
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Validates GSTIN format, checksum, and extracts basic information without requiring API keys.
                </p>
              </div>

              {/* Online Verification API */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  2. Online Verification (POST)
                </h3>
                                 <div className="bg-gray-50 rounded-md p-4">
                   <pre className="text-sm">
{`POST /api/gst/verify
Content-Type: application/json

{
  "gstin": "27AAACI1681G1Z0",
  "provider": "knowyourgst",
  "apiKey": "your-api-key"
}

// For Cashfree (requires both client ID and secret):
{
  "gstin": "27AAACI1681G1Z0",
  "provider": "cashfree",
  "apiKey": "client_id:client_secret"
}`}
                   </pre>
                 </div>
                <p className="text-sm text-gray-600 mt-2">
                  Performs online verification using third-party services. Requires API key from the verification provider.
                </p>
              </div>

              {/* Response Format */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  3. Response Format
                </h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <pre className="text-sm">
{`{
  "isValid": true,
  "gstin": "27AAACI1681G1Z0",
  "stateCode": "27",
  "stateName": "Maharashtra",
  "panNumber": "AAACI1681G",
  "entityNumber": "1",
  "checksum": "0",
  "legalName": "Company Name",
  "tradeName": "Trade Name",
  "registrationDate": "2017-07-01",
  "status": "Active",
  "verificationMethod": "format-validation-only"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Validations */}
        {validationResults.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Validations
              </h2>
              <div className="space-y-3">
                {validationResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-md border ${
                    result.isValid 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <code className="text-sm font-mono">
                          {result.gstin || 'Invalid GSTIN'}
                        </code>
                        {result.stateName && (
                          <span className="ml-2 text-sm text-gray-600">
                            ({result.stateName})
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        result.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600">
                          {result.errors[0]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Format Validation Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                15-digit format validation
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                State code verification
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Checksum validation
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Entity type extraction
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No API key required
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Online Verification Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time verification
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Business name retrieval
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Registration status
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Address information
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Requires API key
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            This demo uses client-side validation and can be extended with third-party verification services.
            For production use, consider implementing rate limiting and caching for API calls.
          </p>
        </div>
      </div>
    </div>
  );
} 