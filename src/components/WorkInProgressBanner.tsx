"use client";

import React, { useState } from 'react';

const ConstructionIcon = ({ className = "h-8 w-8 text-red-600 animate-bounce" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

interface WorkInProgressBannerProps {
  pageName?: string;
  message?: string;
}

const WorkInProgressBanner: React.FC<WorkInProgressBannerProps> = ({ pageName, message }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="w-full bg-gradient-to-r from-red-100 via-rose-50 to-red-100 border-l-4 border-red-500 text-red-800 p-5 mb-8 rounded-lg shadow-lg relative animate-fade-in" role="alert">
      <button
        className="absolute top-2 right-2 text-red-700 hover:text-red-900 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Dismiss banner"
        onClick={() => setVisible(false)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center">
        <ConstructionIcon className="h-8 w-8 mr-4 text-red-600 animate-bounce" />
        <div>
          <p className="font-extrabold text-lg tracking-wide">
            {pageName ? `${pageName} is Under Construction` : "Work in Progress"}
          </p>
          <p className="text-sm mt-1">
            {message || "This section is currently being developed. Some features might be unavailable or incomplete."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgressBanner; 