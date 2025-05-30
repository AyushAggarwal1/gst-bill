"use client";

import React from 'react';

const ConstructionIcon = ({ className = "h-8 w-8 text-yellow-600" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

interface WorkInProgressBannerProps {
  pageName?: string;
  message?: string;
}

const WorkInProgressBanner: React.FC<WorkInProgressBannerProps> = ({ pageName, message }) => {
  return (
    <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
      <div className="flex items-center">
        <ConstructionIcon className="h-6 w-6 mr-3" />
        <div>
          <p className="font-bold">
            {pageName ? `${pageName} is Under Construction` : "Work in Progress"}
          </p>
          <p className="text-sm">
            {message || "This section is currently being developed. Some features might be unavailable or incomplete."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgressBanner; 