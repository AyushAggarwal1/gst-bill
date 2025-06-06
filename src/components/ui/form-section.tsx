"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({ 
  title, 
  description, 
  children,
  className 
}: FormSectionProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}; 