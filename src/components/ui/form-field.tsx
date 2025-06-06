"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField = ({ 
  label, 
  htmlFor, 
  required, 
  error, 
  children,
  className 
}: FormFieldProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 