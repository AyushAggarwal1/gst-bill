import React from 'react';
interface IconProps { className?: string; }
const FilterIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.3.4-3.2 1L5.2 7.6c-.7.6-1.2 1.4-1.2 2.4v3c0 1 .5 1.9 1.2 2.4l3.6 3.6c.9.8 2 1.2 3.2 1.2s2.3-.4 3.2-1.2l3.6-3.6c.7-.6 1.2-1.4 1.2-2.4v-3c0-1-.5-1.9-1.2-2.4L15.2 4c-.9-.8-2-1.2-3.2-1.2zm0 2c.7 0 1.4.2 2 .5l3.6 3.6c.3.3.5.7.5 1v3c0 .3-.2.7-.5 1l-3.6 3.6c-.6.3-1.3.5-2 .5s-1.4-.2-2-.5L6.3 15c-.3-.3-.5-.7-.5-1v-3c0-.3.2-.7.5-1l3.6-3.6c.6-.3 1.3-.5 2-.5z" />
  </svg>
);
export default FilterIcon; 