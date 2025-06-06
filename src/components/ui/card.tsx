"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        'bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => {
  return (
    <div 
      className={cn(
        'px-4 py-5 sm:px-6 border-b border-gray-200',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ className, children, ...props }: CardContentProps) => {
  return (
    <div 
      className={cn(
        'px-4 py-5 sm:p-6',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }: CardFooterProps) => {
  return (
    <div 
      className={cn(
        'bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}; 