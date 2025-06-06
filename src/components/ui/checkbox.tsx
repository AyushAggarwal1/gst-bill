"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: boolean;
}

export const Checkbox = ({ 
  className, 
  label, 
  description, 
  error, 
  id,
  ...props 
}: CheckboxProps) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            'h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={checkboxId} className="font-medium text-gray-700">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}; 