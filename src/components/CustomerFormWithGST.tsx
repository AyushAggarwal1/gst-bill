'use client';

import { useState } from 'react';
import { useGSTValidation } from '@/hooks/useGSTValidation';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  gstin: string;
  address: string;
  businessType: string;
}

export default function CustomerFormWithGST() {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    businessType: ''
  });

  const {
    gstin,
    setGstin,
    validationResult,
    isValidating,
    validate,
    isValid,
    errors
  } = useGSTValidation({
    enableOnlineVerification: false, // Set to true when you have API key
    apiKey: '', // Add your API key here
    provider: 'knowyourgst', // or 'cashfree', 'decentro'
    autoValidate: true
  });

  const handleGSTINChange = (value: string) => {
    setGstin(value);
    setFormData(prev => ({ ...prev, gstin: value }));
  };

  // Auto-fill form when GST validation succeeds
  const handleGSTValidation = () => {
    if (validationResult && validationResult.isValid) {
      setFormData(prev => ({
        ...prev,
        name: validationResult.legalName || prev.name,
        address: validationResult.address || prev.address,
        businessType: validationResult.businessType || prev.businessType
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid && formData.gstin) {
      alert('Please verify the GST number before submitting');
      return;
    }

    console.log('Customer data:', {
      ...formData,
      gstVerificationResult: validationResult
    });
    
    // Here you would typically send the data to your API
    alert('Customer added successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Customer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GST Number Field */}
        <div>
          <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-2">
            GST Number (GSTIN) *
          </label>
          <div className="flex gap-2">
            <input
              id="gstin"
              type="text"
              value={gstin}
              onChange={(e) => handleGSTINChange(e.target.value.toUpperCase())}
              placeholder="Enter 15-digit GST number"
              className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                gstin && isValid 
                  ? 'border-green-500 bg-green-50' 
                  : gstin && errors.length > 0 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300'
              }`}
              maxLength={17}
            />
            <button
              type="button"
              onClick={() => {
                validate();
                handleGSTValidation();
              }}
              disabled={isValidating || !gstin.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          
          {/* GST Validation Status */}
          {gstin && (
            <div className="mt-2">
              {isValid && validationResult && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ Valid GST Number
                  {validationResult.legalName && (
                    <div className="mt-1">
                      <strong>Business:</strong> {validationResult.legalName}
                      {validationResult.tradeName && validationResult.tradeName !== validationResult.legalName && (
                        <span> (Trading as: {validationResult.tradeName})</span>
                      )}
                    </div>
                  )}
                  {validationResult.stateName && (
                    <div><strong>State:</strong> {validationResult.stateName}</div>
                  )}
                </div>
              )}
              
              {errors.length > 0 && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  ❌ {errors[0]}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Business Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter business name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {validationResult?.legalName && formData.name !== validationResult.legalName && (
            <p className="mt-1 text-sm text-blue-600">
              💡 GST records show: {validationResult.legalName}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter business address"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {validationResult?.address && formData.address !== validationResult.address && (
            <p className="mt-1 text-sm text-blue-600">
              💡 GST records show: {validationResult.address}
            </p>
          )}
        </div>

        {/* Business Type Field */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          <select
            id="businessType"
            value={formData.businessType}
            onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select business type</option>
            <option value="Private Limited Company">Private Limited Company</option>
            <option value="Public Limited Company">Public Limited Company</option>
            <option value="Partnership Firm">Partnership Firm</option>
            <option value="LLP">Limited Liability Partnership (LLP)</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="HUF">Hindu Undivided Family (HUF)</option>
            <option value="Trust">Trust</option>
            <option value="Society">Society</option>
            <option value="Government">Government</option>
            <option value="Other">Other</option>
          </select>
          {validationResult?.businessType && formData.businessType !== validationResult.businessType && (
            <p className="mt-1 text-sm text-blue-600">
              💡 GST records show: {validationResult.businessType}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                         disabled={!!(formData.gstin && !isValid)}
          >
            Add Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                gstin: '',
                address: '',
                businessType: ''
              });
              setGstin('');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Clear
          </button>
        </div>
      </form>

      {/* API Setup Notice */}
      {!validationResult?.verificationMethod?.includes('api') && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            🔧 Enable Online Verification
          </h3>
          <p className="text-sm text-yellow-700">
            To automatically fetch business names and details, set up an API key in the component props. 
            Currently showing format validation only.
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Visit <code>/gst-demo</code> to see online verification in action.
          </p>
        </div>
      )}
    </div>
  );
} 