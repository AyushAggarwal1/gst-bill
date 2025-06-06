"use client";

import React from 'react';

interface SpinnerProps {
  className?: string; // For the outer div
  spinnerClassName?: string; // For the actual spinner element
  textClassName?: string; // For the text
  showText?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  className = "flex justify-center items-center py-10", 
  spinnerClassName = "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500",
  textClassName = "ml-4 text-gray-500",
  showText = true,
}) => (
  <div className={className}>
    <div className={spinnerClassName}></div>
    {showText && <p className={textClassName}></p>}
  </div>
);

export default Spinner; 