"use client";
import React from 'react';

interface IconProps { 
  className?: string; 
}

const TableIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    {/* Simple grid representing a table/spreadsheet */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M3.75 10.5h16.5M3.75 6h16.5M3.75 15h16.5" /> 
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5v16.5H3.75z" />
  </svg>
);

export default TableIcon; 