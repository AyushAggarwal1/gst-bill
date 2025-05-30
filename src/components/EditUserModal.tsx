"use client";

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Role, Permission } from '@/generated/prisma';

export interface UserRoleData {
  role: Role;
  permissions: Permission[];
}

export interface UserDataForModal {
  id: string;
  email: string; // Display only, not editable here
  name: string | null;
  isAdmin: boolean;
  roles: UserRoleData[]; 
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDataForModal | null;
  onSave: (userId: string, updatedData: Partial<Pick<UserDataForModal, 'name' | 'isAdmin' | 'roles'>>) => Promise<void>;
  allRoles: Role[]; // e.g., [Role.USER, Role.MANAGER]
  allPermissions: Permission[]; // e.g., [Permission.CREATE_BILLS, Permission.READ_CUSTOMERS]
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
  allRoles, // Should ideally not include ADMIN if isAdmin toggle handles it
  allPermissions
}: EditUserModalProps) {
  const [name, setName] = useState('');
  const [isAdminFlag, setIsAdminFlag] = useState(false); // Renamed to avoid conflict
  const [selectedRoleData, setSelectedRoleData] = useState<UserRoleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [currentEditingRole, setCurrentEditingRole] = useState<Role | null>(null); // No longer needed for single role

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setIsAdminFlag(user.isAdmin);
      if (user.isAdmin) {
        // If admin, set role to ADMIN and grant all permissions
        setSelectedRoleData({ role: Role.ADMIN, permissions: [...allPermissions] });
      } else if (user.roles && user.roles.length > 0) {
        // If not admin, use the first role assigned (assuming one primary role)
        // Deep copy to avoid direct state mutation
        const primaryRole = user.roles[0];
        setSelectedRoleData({ role: primaryRole.role, permissions: [...primaryRole.permissions] });
      } else {
        // Default to USER role with no permissions if not admin and no roles defined
        setSelectedRoleData({ role: Role.USER, permissions: [] });
      }
    } else {
      // Reset state if no user
      setName('');
      setIsAdminFlag(false);
      setSelectedRoleData({ role: Role.USER, permissions: [] }); // Default for new/cleared user
    }
  }, [user, allPermissions]); // Add allPermissions to dependency array

  const handleIsAdminChange = (checked: boolean) => {
    setIsAdminFlag(checked);
    if (checked) {
      // When isAdmin is true, set role to ADMIN and all permissions
      setSelectedRoleData({ role: Role.ADMIN, permissions: [...allPermissions] });
    } else {
      // When isAdmin is false, revert to USER role (or a default non-admin role)
      // and clear permissions or set to a default set for USER.
      // Here, defaulting to USER with no permissions.
      // Consider keeping previous non-admin role if that's desired UX.
      setSelectedRoleData({ role: Role.USER, permissions: [] });
    }
  };

  const handleRoleChange = (newRoleEnum: Role) => {
    // This function is now for non-admin roles only.
    // ADMIN role is handled by isAdminFlag.
    if (!isAdminFlag && newRoleEnum !== Role.ADMIN) {
      setSelectedRoleData(prev => ({
        ...(prev || { role: newRoleEnum, permissions: [] }), // Ensure prev is not null
        role: newRoleEnum,
        // Reset permissions when role changes if desired, or keep them if applicable
        permissions: [] 
      }));
    }
  };

  const handlePermissionChange = (permission: Permission) => {
    // Only allow permission changes if not isAdmin and a role is selected
    if (!isAdminFlag && selectedRoleData) {
      const currentPermissions = selectedRoleData.permissions || [];
      let updatedPermissions;
      if (currentPermissions.includes(permission)) {
        updatedPermissions = currentPermissions.filter(p => p !== permission);
      } else {
        updatedPermissions = [...currentPermissions, permission];
      }
      setSelectedRoleData(prev => prev ? { ...prev, permissions: updatedPermissions } : null);
    }
  };

  const handleSelectAllPermissionsForRole = (isChecked: boolean) => {
    if (!isAdminFlag && selectedRoleData) {
      if (isChecked) {
        setSelectedRoleData(prev => prev ? { ...prev, permissions: [...allPermissions] } : null);
      } else {
        setSelectedRoleData(prev => prev ? { ...prev, permissions: [] } : null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedRoleData) return; // Ensure selectedRoleData is not null
    setIsLoading(true);
    try {
      const rolesToSave: UserRoleData[] = [];
      if (isAdminFlag) {
        // If isAdmin is true, ensure role is ADMIN with all permissions
        rolesToSave.push({ role: Role.ADMIN, permissions: [...allPermissions] });
      } else if (selectedRoleData.role !== Role.ADMIN) {
         // If not admin, save the selected role and its permissions
        rolesToSave.push({ role: selectedRoleData.role, permissions: selectedRoleData.permissions || [] });
      } else {
        // Edge case: if somehow isAdmin is false but role is ADMIN, default to USER.
        // This shouldn't happen with the current logic but good for safety.
        rolesToSave.push({ role: Role.USER, permissions: selectedRoleData.permissions || []});
      }

      await onSave(user.id, { 
        name: name === user.name ? undefined : name,
        isAdmin: isAdminFlag, // Directly use the state for isAdmin
        roles: rolesToSave // Send the structured roles array
      });
      // onClose(); // Parent handles this
    } catch (error) {
      console.error("Error saving user from modal:", error);
      // Optionally, display error in modal
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  // Filter out ADMIN from selectable roles if isAdmin toggle handles it
  const selectableRoles = allRoles.filter(r => r !== Role.ADMIN);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}> {/* Ensure z-index is higher than ConfirmDialog if they can overlap */}
        {/* ... (Transition.Child for overlay - same as EditInvitationModal) ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* ... (Transition.Child for panel - same as EditInvitationModal) ... */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"> {/* Wider modal if needed */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Edit User: {user.email}
                  </Dialog.Title>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Name</label>
                      <input 
                        type="text" 
                        id="userName" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <input 
                        id="isAdmin" 
                        type="checkbox" 
                        checked={isAdminFlag}
                        onChange={(e) => handleIsAdminChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="isAdmin" className="ml-2 block text-sm font-medium text-gray-700">System Administrator</label>
                    </div>

                    {/* Roles and Permissions Section - Conditional rendering based on isAdmin */}
                    {!isAdminFlag && selectedRoleData && (
                      <div>
                          <h4 className="text-md font-medium text-gray-800 mb-2">Role & Permissions</h4>
                          <div className="mb-4 p-3 border rounded-md bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                  <select 
                                      value={selectedRoleData.role}
                                      onChange={(e) => handleRoleChange(e.target.value as Role)}
                                      disabled={isAdminFlag} // Disable if admin
                                      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                                  >
                                      {/* Show only non-ADMIN roles here */}
                                      {selectableRoles.map(r => (
                                          <option key={r} value={r}>
                                              {r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()}
                                          </option>
                                      ))}
                                  </select>
                                  {/* Remove role button is not needed if we manage a single role */}
                              </div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Permissions for {selectedRoleData.role}:</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                                  {allPermissions.map(permission => (
                                      <div key={permission} className="flex items-center">
                                          <input 
                                              id={`perm-${permission}`}// Simpler ID
                                              type="checkbox" 
                                              checked={selectedRoleData.permissions.includes(permission)}
                                              onChange={() => handlePermissionChange(permission)}
                                              disabled={isAdminFlag} // Disable if admin
                                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-200"
                                          />
                                          <label htmlFor={`perm-${permission}`} className={`ml-2 text-sm ${isAdminFlag ? 'text-gray-400' : 'text-gray-700'}`}>
                                              {permission.split('_').map(s=>s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(' ')}
                                          </label>
                                      </div>
                                  ))}
                              </div>
                              {/* Select All for non-admin role permissions */}
                              {!isAdminFlag && selectedRoleData && allPermissions.length > 0 && (
                                <div className="mt-3 flex items-center">
                                  <input 
                                    id="user-role-select-all-permissions"
                                    type="checkbox"
                                    checked={selectedRoleData.permissions.length === allPermissions.length}
                                    onChange={(e) => handleSelectAllPermissionsForRole(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label 
                                    htmlFor="user-role-select-all-permissions" 
                                    className="ml-2 text-sm font-medium text-gray-700"
                                  >
                                    Select All Permissions for {selectedRoleData.role}
                                  </label>
                                </div>
                              )}
                          </div>
                      </div>
                    )}
                    {isAdminFlag && (
                        <div className="p-3 border rounded-md bg-indigo-50 text-indigo-700">
                            <p className="text-sm font-medium">
                                As a System Administrator, this user has the <span className="font-bold">ADMIN</span> role and all permissions.
                            </p>
                            <p className="text-xs mt-1">To assign a different role or specific permissions, uncheck "System Administrator".</p>
                        </div>
                    )}
                    {/* Remove "Add Role" button as we manage a single role or admin status */}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    onClick={handleSubmit}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 