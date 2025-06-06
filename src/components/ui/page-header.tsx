"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  icon,
  children, 
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center">
            {icon && (
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 