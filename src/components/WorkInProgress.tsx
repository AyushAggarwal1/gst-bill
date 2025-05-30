"use client";

import React from 'react';

const ConstructionIcon = ({ className = "h-12 w-12 text-yellow-500" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {/* A simple construction cone icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

interface WorkInProgressProps {
  pageName?: string;
  message?: string;
}

const WorkInProgress: React.FC<WorkInProgressProps> = ({ pageName, message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center p-6 bg-white rounded-lg shadow-xl m-4">
      <ConstructionIcon className="h-20 w-20 text-yellow-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        {pageName ? `${pageName} is Coming Soon!` : "Page Under Construction"}
      </h1>
      <p className="text-xl text-gray-600 mb-3">
        {message || "Our team is working hard to bring this feature to you."}
      </p>
      <p className="text-lg text-gray-500">
        Please check back later!
      </p>
    </div>
  );
};

export default WorkInProgress; 