"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  error?: boolean;
}

interface OptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

export const Select = ({ className, error, children, ...props }: SelectProps) => {
  return (
    <select
      className={cn(
        'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
        error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const Option = ({ children, ...props }: OptionProps) => {
  return (
    <option {...props}>
      {children}
    </option>
  );
}; 