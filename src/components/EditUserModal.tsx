"use client";

import { useState, useEffect } from 'react';
import { Role, Permission } from '@/generated/prisma';
import { 
  Modal,
  FormField,
  FormSection,
  Input,
  Toggle,
  Select,
  Option,
  Checkbox,
  Button
} from '@/components/ui';

export interface UserRoleData {
  role: Role;
  permissions: Permission[];
}

export interface UserDataForModal {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  roles: UserRoleData[]; 
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDataForModal | null;
  onSave: (userId: string, updatedData: Partial<Pick<UserDataForModal, 'name' | 'isAdmin' | 'roles'>>) => Promise<void>;
  allRoles: Role[];
  allPermissions: Permission[];
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
  const [isAdminFlag, setIsAdminFlag] = useState(false);
  const [selectedRoleData, setSelectedRoleData] = useState<UserRoleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setIsAdminFlag(user.isAdmin);
      if (user.isAdmin) {
        setSelectedRoleData({ role: Role.ADMIN, permissions: [...allPermissions] });
      } else if (user.roles && user.roles.length > 0) {
        const primaryRole = user.roles[0];
        setSelectedRoleData({ role: primaryRole.role, permissions: [...primaryRole.permissions] });
      } else {
        setSelectedRoleData({ role: Role.USER, permissions: [] });
      }
    } else {
      setName('');
      setIsAdminFlag(false);
      setSelectedRoleData({ role: Role.USER, permissions: [] });
    }
  }, [user, allPermissions]);

  const handleIsAdminChange = (checked: boolean) => {
    setIsAdminFlag(checked);
    if (checked) {
      setSelectedRoleData({ role: Role.ADMIN, permissions: [...allPermissions] });
    } else {
      setSelectedRoleData({ role: Role.USER, permissions: [] });
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoleEnum = event.target.value as Role;
    if (!isAdminFlag && newRoleEnum !== Role.ADMIN) {
      setSelectedRoleData(prev => ({
        ...(prev || { role: newRoleEnum, permissions: [] }),
        role: newRoleEnum,
        permissions: [] 
      }));
    }
  };

  const handlePermissionChange = (permission: Permission) => {
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

  const handleSelectAllPermissionsForRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    if (!isAdminFlag && selectedRoleData) {
      if (isChecked) {
        setSelectedRoleData(prev => prev ? { ...prev, permissions: [...allPermissions] } : null);
      } else {
        setSelectedRoleData(prev => prev ? { ...prev, permissions: [] } : null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedRoleData) return;
    setIsLoading(true);
    try {
      const rolesToSave: UserRoleData[] = [];
      if (isAdminFlag) {
        rolesToSave.push({ role: Role.ADMIN, permissions: [...allPermissions] });
      } else if (selectedRoleData.role !== Role.ADMIN) {
        rolesToSave.push({ role: selectedRoleData.role, permissions: selectedRoleData.permissions || [] });
      } else {
        rolesToSave.push({ role: Role.USER, permissions: selectedRoleData.permissions || []});
      }

      await onSave(user.id, { 
        name: name === user.name ? undefined : name,
        isAdmin: isAdminFlag,
        roles: rolesToSave
      });
    } catch (error) {
      console.error("Error saving user from modal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const selectableRoles = allRoles.filter(r => r !== Role.ADMIN);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Edit User: ${user.email}`}
      size="lg"
    >
      <div className="space-y-6">
        <FormSection title="Basic Information">
          <FormField label="Name" htmlFor="userName">
            <Input 
              id="userName" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
            />
          </FormField>

          <Toggle
            checked={isAdminFlag}
            onChange={handleIsAdminChange}
            label="Administrator"
            description="Grant full administrative privileges"
          />
        </FormSection>

        {!isAdminFlag && (
          <FormSection 
            title="Role & Permissions"
            description="Configure user role and specific permissions"
          >
            <FormField label="Role" htmlFor="userRole">
              <Select
                id="userRole"
                value={selectedRoleData?.role || Role.USER}
                onChange={handleRoleChange}
              >
                {selectableRoles.map((role) => (
                  <Option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                  </Option>
                ))}
              </Select>
            </FormField>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Permissions</label>
                <Checkbox
                  checked={selectedRoleData?.permissions?.length === allPermissions.length}
                  onChange={handleSelectAllPermissionsForRole}
                  label="Select All"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allPermissions.map((permission) => (
                  <Checkbox
                    key={permission}
                    checked={selectedRoleData?.permissions?.includes(permission) || false}
                    onChange={() => handlePermissionChange(permission)}
                    label={permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  />
                ))}
              </div>
            </div>
          </FormSection>
        )}

        {isAdminFlag && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Administrator Access</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>This user will have full administrative privileges and access to all features.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200 mt-6 -mx-6 -mb-6">
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          className="w-full sm:w-auto sm:ml-3"
        >
          Save Changes
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
} 