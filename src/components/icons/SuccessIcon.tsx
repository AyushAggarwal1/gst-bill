import React from 'react';

interface IconProps {
  className?: string;
}

const SuccessIcon: React.FC<IconProps> = ({ className = "h-5 w-5 text-green-600 mr-2 flex-shrink-0" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

export default SuccessIcon; 