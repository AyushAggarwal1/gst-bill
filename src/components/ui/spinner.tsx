"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
};

export const Spinner = ({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-4 border-primary-200',
          sizeClasses[size]
        )}></div>
        <div className={cn(
          'animate-spin rounded-full border-4 border-primary-600 border-t-transparent absolute top-0 left-0',
          sizeClasses[size]
        )}></div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}; 