"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  iconBgColor?: string;
  className?: string;
}

export const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  href,
  onClick,
  iconBgColor = 'bg-blue-50',
  className 
}: QuickActionCardProps) => {
  const cardContent = (
    <div className="flex items-center">
      <div className={cn(
        'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:bg-opacity-80 transition-colors',
        iconBgColor
      )}>
        {icon}
      </div>
      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-gray-700 truncate">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  const baseClassName = cn(
    'group relative bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200',
    className
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClassName, 'w-full text-left cursor-pointer')}
      >
        {cardContent}
      </button>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={baseClassName}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={baseClassName}>
      {cardContent}
    </div>
  );
}; 