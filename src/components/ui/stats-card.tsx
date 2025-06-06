"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  linkText?: string;
  iconBgColor?: string;
  className?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  href, 
  linkText,
  iconBgColor = 'bg-slate-100',
  className 
}: StatsCardProps) => {
  return (
    <div className={cn(
      'bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200',
      className
    )}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className={cn(
              'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
              iconBgColor
            )}>
              {icon}
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {title}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {value}
              </p>
            </div>
          </div>
          {href && (
            <Link href={href} className="flex-shrink-0 text-slate-500 hover:text-slate-700 transition-colors ml-2">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
      {href && linkText && (
        <div className="bg-gray-50 px-4 py-2 sm:px-6 sm:py-3 border-t border-gray-200">
          <Link href={href} className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            {linkText} →
          </Link>
        </div>
      )}
    </div>
  );
}; 