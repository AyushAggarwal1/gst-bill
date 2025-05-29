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
  allRoles,
  allPermissions
}: EditUserModalProps) {
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEditingRole, setCurrentEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setIsAdmin(user.isAdmin);
      // Deep copy roles to avoid direct state mutation issues
      setSelectedRoles(user.roles ? JSON.parse(JSON.stringify(user.roles)) : []); 
    } else {
      setName('');
      setIsAdmin(false);
      setSelectedRoles([]);
    }
  }, [user]);

  const handleRoleChange = (index: number, newRoleEnum: Role) => {
    const updatedRoles = [...selectedRoles];
    // Prevent duplicate roles being assigned
    if (!updatedRoles.find((r, i) => i !== index && r.role === newRoleEnum)) {
        updatedRoles[index].role = newRoleEnum;
        // Optional: Reset permissions when role changes, or try to map existing ones if applicable
        // updatedRoles[index].permissions = []; 
        setSelectedRoles(updatedRoles);
    }
  };

  const handlePermissionChange = (roleIndex: number, permission: Permission) => {
    const updatedRoles = [...selectedRoles];
    const currentPermissions = updatedRoles[roleIndex].permissions || [];
    if (currentPermissions.includes(permission)) {
      updatedRoles[roleIndex].permissions = currentPermissions.filter(p => p !== permission);
    } else {
      updatedRoles[roleIndex].permissions = [...currentPermissions, permission];
    }
    setSelectedRoles(updatedRoles);
  };

  const addRole = () => {
    // Add a default role, ensure it's not a duplicate of an existing role type if possible
    const existingRoleTypes = selectedRoles.map(r => r.role);
    const availableRoleToAdd = allRoles.find(r => !existingRoleTypes.includes(r));
    
    if (selectedRoles.length < allRoles.length) { // Only add if there are roles available to be added
        setSelectedRoles([...selectedRoles, { role: availableRoleToAdd || allRoles[0], permissions: [] }]);
    }
  };

  const removeRole = (index: number) => {
    const updatedRoles = selectedRoles.filter((_, i) => i !== index);
    setSelectedRoles(updatedRoles);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await onSave(user.id, { 
        name: name === user.name ? undefined : name, // Send only if changed
        isAdmin: isAdmin === user.isAdmin ? undefined : isAdmin, // Send only if changed
        // Always send roles for full replacement strategy on backend
        // Or implement more granular role update if backend supports it
        roles: selectedRoles 
      });
      // onClose(); // Parent handles closing and messages
    } catch (error) {
      console.error("Error saving user from modal:", error);
      // Optionally, display error in modal
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

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
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="isAdmin" className="ml-2 block text-sm font-medium text-gray-700">System Administrator</label>
                    </div>

                    {/* Roles and Permissions Section */}
                    <div>
                        <h4 className="text-md font-medium text-gray-800 mb-2">Roles & Permissions</h4>
                        {selectedRoles.map((userRole, roleIndex) => (
                            <div key={roleIndex} className="mb-4 p-3 border rounded-md bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <select 
                                        value={userRole.role}
                                        onChange={(e) => handleRoleChange(roleIndex, e.target.value as Role)}
                                        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {allRoles.map(r => (
                                            <option key={r} value={r} disabled={selectedRoles.some((sr, sri) => sr.role === r && sri !== roleIndex)}>
                                                {r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => removeRole(roleIndex)} 
                                        className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 text-sm"
                                     >
                                      Remove Role
                                   </button>
                                </div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Permissions for {userRole.role}:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                                    {allPermissions.map(permission => (
                                        <div key={permission} className="flex items-center">
                                            <input 
                                                id={`perm-${roleIndex}-${permission}`}
                                                type="checkbox" 
                                                checked={userRole.permissions.includes(permission)}
                                                onChange={() => handlePermissionChange(roleIndex, permission)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`perm-${roleIndex}-${permission}`} className="ml-2 text-sm text-gray-700">
                                                {permission.split('_').map(s=>s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(' ')}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {selectedRoles.length < allRoles.length && (
                            <button 
                                onClick={addRole} 
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-500 hover:bg-indigo-50 px-3 py-1 rounded-md"
                            >
                                + Add Role
                            </button>
                        )}
                    </div>

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