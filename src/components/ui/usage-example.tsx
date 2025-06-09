"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { showToast } from './toast-provider';
import { LoadingSpinner } from './loading-spinner';

export const UsageExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const handleButtonClick = async () => {
    setIsLoading(true);
    showToast.success('Action started');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    showToast.success('Action completed successfully!');
  };

  const handleErrorClick = () => {
    showToast.error('Something went wrong. Please try again.');
  };

  const handlePageLoading = async () => {
    setIsPageLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPageLoading(false);
    showToast.success('Page data loaded successfully!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {isPageLoading && <LoadingSpinner />}
      
      <h2 className="text-xl font-semibold mb-4">UI/UX Improvements Demo</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Loading Button</h3>
          <Button 
            onClick={handleButtonClick} 
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Toast Notifications</h3>
          <div className="flex space-x-4">
            <Button 
              onClick={() => showToast.success('Item saved successfully!')}
              variant="primary"
            >
              Success Toast
            </Button>
            
            <Button 
              onClick={handleErrorClick}
              variant="danger"
            >
              Error Toast
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Full Page Loading</h3>
          <Button 
            onClick={handlePageLoading}
            variant="secondary"
          >
            Load Page Data
          </Button>
        </div>
      </div>
    </div>
  );
}; 