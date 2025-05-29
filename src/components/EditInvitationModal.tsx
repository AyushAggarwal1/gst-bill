"use client";

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'; // Using Headless UI for a11y
import { Role, Permission } from '@/generated/prisma';

interface InvitationData {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  // Add other fields if needed for display, but email, role, permissions are key for editing
}

interface EditInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: InvitationData | null;
  onSave: (invitationId: string, newRole: Role, newPermissions: Permission[]) => Promise<void>;
  allRoles: Role[];
  allPermissions: Permission[];
}

export default function EditInvitationModal({
  isOpen,
  onClose,
  invitation,
  onSave,
  allRoles,
  allPermissions
}: EditInvitationModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(Role.USER);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (invitation) {
      setSelectedRole(invitation.role);
      setSelectedPermissions(invitation.permissions || []);
    } else {
      // Reset when no invitation (e.g. modal closed and reopened for a new one, though less likely here)
      setSelectedRole(Role.USER);
      setSelectedPermissions([]);
    }
  }, [invitation]);

  const handlePermissionChange = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async () => {
    if (!invitation) return;
    setIsLoading(true);
    try {
      await onSave(invitation.id, selectedRole, selectedPermissions);
      // onClose(); // Parent will handle closing and potentially showing a message
    } catch (error) {
      // Error handling can be done in the parent or here if needed
      console.error("Error saving invitation from modal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitation) return null; // Should not happen if isOpen is true with a valid invitation

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    {/* Optional: Icon */}
                    {/* <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"> 
                        <PencilIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div> */}
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Edit Invitation for {invitation.email}
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="role-edit" className="block text-sm font-medium text-gray-700">
                            Assign Role
                          </label>
                          <select
                            id="role-edit"
                            name="role-edit"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          >
                            {allRoles.map((role) => (
                              <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Assign Permissions
                          </label>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-1 border rounded-md">
                            {allPermissions.map((permission) => (
                              <div key={permission} className="flex items-center">
                                <input
                                  id={`permission-edit-${permission}`}
                                  name={`permission-edit-${permission}`}
                                  type="checkbox"
                                  checked={selectedPermissions.includes(permission)}
                                  onChange={() => handlePermissionChange(permission)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`permission-edit-${permission}`} className="ml-2 block text-sm text-gray-900">
                                  {permission.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
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