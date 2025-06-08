'use client';

import { useState } from 'react';
import { validateGSTINFormat, verifyGSTINOnline, formatGSTIN, getGSTINBusinessInfo, GSTVerificationResponse } from '@/lib/gst-validator';

interface GSTValidatorProps {
  onValidation?: (result: GSTVerificationResponse) => void;
  showBusinessInfo?: boolean;
  enableOnlineVerification?: boolean;
  apiKey?: string;
  provider?: 'format-only' | 'knowyourgst' | 'cashfree' | 'decentro' | 'official';
  className?: string;
}

export default function GSTValidator({
  onValidation,
  showBusinessInfo = true,
  enableOnlineVerification = false,
  apiKey,
  provider = 'format-only',
  className = ''
}: GSTValidatorProps) {
  const [gstin, setGstin] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<GSTVerificationResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleValidation = async () => {
    if (!gstin.trim()) {
      setValidationResult({
        isValid: false,
        errors: ['Please enter a GSTIN number']
      });
      return;
    }

    setIsValidating(true);
    
    try {
      let result: GSTVerificationResponse;

      if (enableOnlineVerification && apiKey) {
        // Online verification
        result = await verifyGSTINOnline(gstin, apiKey);
      } else {
        // Format validation only
        const formatValidation = validateGSTINFormat(gstin);
        result = {
          isValid: formatValidation.isValid,
          gstin: formatValidation.isValid ? gstin.replace(/\s/g, '').toUpperCase() : undefined,
          stateCode: formatValidation.stateCode,
          stateName: formatValidation.stateName,
          panNumber: formatValidation.panNumber,
          entityNumber: formatValidation.entityNumber,
          checksum: formatValidation.checksum,
          errors: formatValidation.errors,
          verificationMethod: 'format-validation-only'
        };
      }

      setValidationResult(result);
      onValidation?.(result);
      
    } catch (error) {
      const errorResult: GSTVerificationResponse = {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
      setValidationResult(errorResult);
      onValidation?.(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setGstin(value);
    setValidationResult(null);
  };

  const businessInfo = validationResult?.isValid && validationResult.gstin 
    ? getGSTINBusinessInfo(validationResult.gstin) 
    : null;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-4">
        <label htmlFor="gstin-input" className="block text-sm font-medium text-gray-700 mb-2">
          GST Number (GSTIN)
        </label>
        <div className="flex gap-2">
          <input
            id="gstin-input"
            type="text"
            value={gstin}
            onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
            placeholder="Enter 15-digit GST number (e.g., 27AAACI1681G1Z0)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={17} // Allow for spaces
          />
          <button
            onClick={handleValidation}
            disabled={isValidating || !gstin.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Format: 2-digit state code + 10-digit PAN + 1-digit entity + 1-digit Z + 1-digit checksum
        </p>
      </div>

      {validationResult && (
        <div className="mt-4">
          <div className={`p-4 rounded-md ${
            validationResult.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                validationResult.isValid ? 'text-green-400' : 'text-red-400'
              }`}>
                {validationResult.isValid ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.isValid ? 'Valid GST Number' : 'Invalid GST Number'}
                </h3>
                {validationResult.gstin && (
                  <p className={`text-sm ${
                    validationResult.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatGSTIN(validationResult.gstin)}
                  </p>
                )}
              </div>
            </div>

            {validationResult.errors && validationResult.errors.length > 0 && (
              <div className="mt-2">
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.message && (
              <p className="mt-2 text-sm text-blue-700">
                {validationResult.message}
              </p>
            )}

            {validationResult.verificationMethod && (
              <p className="mt-2 text-xs text-gray-500">
                Verification method: {validationResult.verificationMethod}
              </p>
            )}
          </div>

          {/* Business Information */}
          {validationResult.isValid && showBusinessInfo && (businessInfo || validationResult.legalName) && (
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <span>Business Details</span>
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform ${
                    showDetails ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDetails && (
                <div className="mt-3 bg-gray-50 rounded-md p-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    {validationResult.legalName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
                        <dd className="text-sm text-gray-900">{validationResult.legalName}</dd>
                      </div>
                    )}
                    {validationResult.tradeName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Trade Name</dt>
                        <dd className="text-sm text-gray-900">{validationResult.tradeName}</dd>
                      </div>
                    )}
                    {businessInfo && (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">State</dt>
                          <dd className="text-sm text-gray-900">{businessInfo.stateName} ({businessInfo.stateCode})</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
                          <dd className="text-sm text-gray-900">{businessInfo.entityType}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">PAN Number</dt>
                          <dd className="text-sm text-gray-900">{businessInfo.panNumber}</dd>
                        </div>
                      </>
                    )}
                    {validationResult.registrationDate && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                        <dd className="text-sm text-gray-900">{validationResult.registrationDate}</dd>
                      </div>
                    )}
                    {validationResult.status && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            validationResult.status.toLowerCase() === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {validationResult.status}
                          </span>
                        </dd>
                      </div>
                    )}
                    {validationResult.address && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="text-sm text-gray-900">{validationResult.address}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 