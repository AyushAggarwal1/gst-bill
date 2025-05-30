"use client";

import { useState } from 'react';
import { Permission } from '@/generated/prisma';

interface PermissionBadgesProps {
  permissions: Permission[];
  initialLimit?: number;
  defaultBadgeColorClass?: string; // Renamed for clarity
}

const getPermissionSpecificBadgeClasses = (permission: Permission): string | null => {
  switch (permission) {
    // Bill Permissions
    case Permission.CREATE_BILLS:
      return 'bg-green-100 text-green-800';
    case Permission.READ_BILLS:
      return 'bg-sky-100 text-sky-800';
    case Permission.UPDATE_BILLS:
      return 'bg-amber-100 text-amber-800';
    case Permission.DELETE_BILLS:
      return 'bg-red-100 text-red-800';
    // Customer Permissions
    case Permission.CREATE_CUSTOMERS:
      return 'bg-green-200 text-green-900'; // Slightly different green
    case Permission.READ_CUSTOMERS:
      return 'bg-sky-200 text-sky-900'; // Slightly different blue
    case Permission.UPDATE_CUSTOMERS:
      return 'bg-amber-200 text-amber-900'; // Slightly different orange
    case Permission.DELETE_CUSTOMERS:
      return 'bg-red-200 text-red-900'; // Slightly different red
    // Item Permissions
    case Permission.CREATE_ITEMS:
      return 'bg-lime-100 text-lime-800';
    case Permission.READ_ITEMS:
      return 'bg-cyan-100 text-cyan-800';
    case Permission.UPDATE_ITEMS:
      return 'bg-yellow-100 text-yellow-800';
    case Permission.DELETE_ITEMS:
      return 'bg-pink-100 text-pink-800';
    // User/Invitation Permissions
    case Permission.INVITE_USERS:
      return 'bg-teal-100 text-teal-800';
    default:
      return null; // Will use defaultBadgeColorClass
  }
};

const PermissionBadges: React.FC<PermissionBadgesProps> = ({ 
  permissions, 
  initialLimit = 2, 
  defaultBadgeColorClass = 'bg-gray-100 text-gray-800' 
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!permissions || permissions.length === 0) {
    return <span className="text-gray-400 italic">N/A</span>;
  }

  const displayedPermissions = showAll ? permissions : permissions.slice(0, initialLimit);
  const remainingCount = permissions.length - initialLimit;

  const formatPermissionName = (permission: Permission) => {
    return permission.split('_').map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(' ');
  };

  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-wrap gap-1 mb-1">
        {displayedPermissions.map(p => {
          const specificColor = getPermissionSpecificBadgeClasses(p);
          return (
            <span 
              key={p} 
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${specificColor || defaultBadgeColorClass}`}
            >
              {formatPermissionName(p)}
            </span>
          );
        })}
      </div>
      {permissions.length > initialLimit && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          {showAll ? 'Show less' : `Show ${remainingCount} more...`}
        </button>
      )}
    </div>
  );
};

export default PermissionBadges; 