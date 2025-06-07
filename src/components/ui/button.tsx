"use client";

import React from 'react';
import { Spinner } from './spinner';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md focus:ring-primary-500',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md focus:ring-primary-500',
    success: 'bg-success-600 hover:bg-success-700 active:bg-success-800 text-white shadow-sm hover:shadow-md focus:ring-success-500',
    warning: 'bg-warning-600 hover:bg-warning-700 active:bg-warning-800 text-white shadow-sm hover:shadow-md focus:ring-warning-500',
    danger: 'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-sm hover:shadow-md focus:ring-danger-500',
    ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-primary-500',
    outline: 'bg-transparent border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100 text-primary-600 hover:text-primary-700 focus:ring-primary-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner className="mr-2" />
      )}
      {children}
    </button>
  );
}; 