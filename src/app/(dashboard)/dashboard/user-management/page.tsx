"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Role, Permission } from '@/generated/prisma';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditInvitationModal from '@/components/EditInvitationModal';
import EditUserModal, { UserDataForModal, UserRoleData } from '@/components/EditUserModal';
import PermissionBadges from '@/components/PermissionBadges';
import { LoadingSpinner } from "@/components/Spinner";
import { PageHeader } from "@/components/ui";
import { EditIcon, DeleteIcon, RevokeIcon } from "@/components/icons";
import WorkInProgressBanner from "@/components/WorkInProgressBanner";
// import { LoadingSpinner, PageHeader } from "@/components/ui";

const getRoleBadgeClasses = (role: Role | string): string => {
  switch (role) {
    case Role.ADMIN:
      return 'bg-purple-100 text-purple-800';
    case Role.USER:
      return 'bg-sky-100 text-sky-800';
    // Add more cases for other roles if they exist
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface SessionUser extends Record<string, any> {
  id?: string;
  isAdmin?: boolean;
  role?: string;
}

interface UserData extends UserDataForModal {
  email: string;
  createdAt: string;
}

interface InvitationData {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string | null; email: string };
  invitedUser: { name: string | null; email: string } | null;
  token: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const typedSession = session as { user: SessionUser } | null;
  const currentUserId = typedSession?.user?.id;
  const isAdmin = typedSession?.user?.isAdmin || typedSession?.user?.role === 'ADMIN';

  const [users, setUsers] = useState<UserData[]>([]);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [initialUsersFetchAttempted, setInitialUsersFetchAttempted] = useState(false);
  const [initialInvitationsFetchAttempted, setInitialInvitationsFetchAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'invitations' | 'inviteNew'>('users');
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [invitationToRevoke, setInvitationToRevoke] = useState<InvitationData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [invitationToEdit, setInvitationToEdit] = useState<InvitationData | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserDataForModal | null>(null);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSelectedRole, setInviteSelectedRole] = useState<Role>(Role.USER);
  const [inviteSelectedPermissions, setInviteSelectedPermissions] = useState<Permission[]>([]);
  const [inviteIsLoading, setInviteIsLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [invitationSearchTerm, setInvitationSearchTerm] = useState('');

  const allRolesList = Object.values(Role);
  const allPermissionsList = Object.values(Permission);

  const fetchUsers = useCallback(async () => {
    if (loadingUsers) return; 
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users', {
        headers: { 'user-id': typedSession?.user?.id || '' } 
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch users' }));
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users');
      setUsers([]); 
    } finally {
      setLoadingUsers(false);
      setInitialUsersFetchAttempted(true);
    }
  }, [typedSession?.user?.id, loadingUsers]);

  const fetchInvitations = useCallback(async () => {
    if (loadingInvitations) return; 
    try {
      setLoadingInvitations(true);
      const response = await fetch('/api/invitations', {
        headers: { 'user-id': typedSession?.user?.id || '' } 
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch invitations' }));
        throw new Error(errorData.error || 'Failed to fetch invitations');
      }
      const data = await response.json();
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load invitations');
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
      setInitialInvitationsFetchAttempted(true);
    }
  }, [typedSession?.user?.id, loadingInvitations]);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && isAdmin) {
      if (!initialUsersFetchAttempted && !loadingUsers) {
        fetchUsers();
      }
      if (!initialInvitationsFetchAttempted && !loadingInvitations) {
        fetchInvitations();
      }
    }
  }, [sessionStatus, isAdmin, initialUsersFetchAttempted, initialInvitationsFetchAttempted, loadingUsers, loadingInvitations, fetchUsers, fetchInvitations]);

  const refetchUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const refetchInvitations = useCallback(async () => {
    await fetchInvitations();
  }, [fetchInvitations]);

  const handleRevokeClick = (invitation: InvitationData) => {
    setInvitationToRevoke(invitation);
    setShowConfirmDialog(true);
    setActionMessage(null);
  };

  const confirmRevoke = async () => {
    if (!invitationToRevoke) return;
    try {
      const response = await fetch(`/api/invitations/${invitationToRevoke.id}`,
        {
          method: 'DELETE',
          headers: { 'user-id': typedSession?.user?.id || '' } 
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke invitation');
      }
      setActionMessage({ type: 'success', text: 'Invitation revoked successfully!' });
      setInvitations(prev => prev.filter(inv => inv.id !== invitationToRevoke.id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setActionMessage({ type: 'error', text: errorMessage });
    } finally {
      setShowConfirmDialog(false);
      setInvitationToRevoke(null);
    }
  };

  const handleEditClick = (invitation: InvitationData) => {
    setInvitationToEdit(invitation);
    setShowEditModal(true);
    setActionMessage(null);
  };

  const handleSaveInvitation = async (invitationId: string, newRole: Role, newPermissions: Permission[]) => {
    if (!invitationToEdit) return;
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': typedSession?.user?.id || '' 
        },
        body: JSON.stringify({ role: newRole, permissions: newPermissions })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update invitation');
      }
      setActionMessage({ type: 'success', text: 'Invitation updated successfully!' });
      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId 
          ? { ...inv, role: newRole, permissions: newPermissions, updatedAt: new Date().toISOString() } 
          : inv
      ));
      setShowEditModal(false);
      setInvitationToEdit(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating';
      setActionMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleEditUserClick = (user: UserData) => {
    const userForModal: UserDataForModal = {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        roles: user.roles.map(r => ({ role: r.role, permissions: r.permissions || [] }))
    };
    setUserToEdit(userForModal);
    setShowEditModal(true);
    setActionMessage(null);
  };

  const handleSaveUser = async (userId: string, updatedData: Partial<Pick<UserDataForModal, 'name' | 'isAdmin' | 'roles'>>) => {
    try {
      setActionMessage(null);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUserId || '' 
        },
        body: JSON.stringify(updatedData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      setActionMessage({ type: 'success', text: 'User updated successfully!' });
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, ...data.user } 
          : u
      ));
      setShowEditModal(false);
      setUserToEdit(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating user';
      setActionMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleDeleteUserClick = (user: UserData) => {
    if (user.id === currentUserId) {
        setActionMessage({ type: 'error', text: 'You cannot delete your own account.' });
        return;
    }
    setUserToDelete(user);
    setShowConfirmDialog(true);
    setActionMessage(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setActionMessage(null);
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'user-id': currentUserId || '' }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      setActionMessage({ type: 'success', text: 'User deleted successfully!' });
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setActionMessage({ type: 'error', text: errorMessage });
    } finally {
      setShowConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const openRevokeDialog = (invitation: InvitationData) => {
    setInvitationToRevoke(invitation);
    setShowConfirmDialog(true);
    setActionMessage(null);
  };

  const closeRevokeDialog = () => {
    setShowConfirmDialog(false);
    setInvitationToRevoke(null);
  };

  const openEditInvitationModal = (invitation: InvitationData) => {
    setInvitationToEdit(invitation);
    setShowEditModal(true);
    setActionMessage(null);
  };

  const closeEditInvitationModal = () => {
    setShowEditModal(false);
    setInvitationToEdit(null);
  };

  const openEditUserModal = (user: UserData) => { 
    const userForModal: UserDataForModal = { 
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        roles: user.roles.map(r => ({ role: r.role, permissions: r.permissions || [] }))
    };
    setUserToEdit(userForModal);
    setShowEditModal(true); 
    setActionMessage(null);
  };

  const closeEditUserModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
  };
  
  const openDeleteUserDialog = (user: UserData) => {
    if (user.id === currentUserId) {
        setActionMessage({ type: 'error', text: 'You cannot delete your own account from here.' });
        return;
    }
    setUserToDelete(user);
    setShowConfirmDialog(true); 
    setActionMessage(null);
  };

  const closeDeleteUserDialog = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };

  const handleInvitePermissionChange = (permission: Permission) => {
    setInviteSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission) 
        : [...prev, permission]
    );
  };

  const handleInviteSelectAllPermissions = (isChecked: boolean) => {
    if (isChecked) {
      setInviteSelectedPermissions([...allPermissionsList]);
    } else {
      setInviteSelectedPermissions([]);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteIsLoading(true);
    setInviteMessage(null);
    setActionMessage(null);

    try {
      const adminUserId = typedSession?.user?.id;
      if (!adminUserId) {
        throw new Error('Admin user ID not found. Ensure you are logged in as admin.');
      }

      const response = await fetch('/api/invitations/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminUserId 
        },
        body: JSON.stringify({ 
          email: inviteEmail, 
          role: inviteSelectedRole, 
          permissions: inviteSelectedPermissions 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setInviteMessage({ type: 'success', text: 'Invitation sent successfully!' });
      setInviteEmail('');
      setInviteSelectedRole(Role.USER);
      setInviteSelectedPermissions([]);
      refetchInvitations(); 
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setInviteMessage({ type: 'error', text: errorMessage });
      console.error('Invitation error:', error);
    } finally {
      setInviteIsLoading(false);
    }
  };

  useEffect(() => {
    if (inviteMessage) {
      const timer = setTimeout(() => {
        setInviteMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [inviteMessage]);

  // Filtered lists (should be BEFORE the session status checks that might return early)
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredInvitations = invitations.filter(invitation =>
    invitation.email.toLowerCase().includes(invitationSearchTerm.toLowerCase())
  );

  // Auto dismiss action messages
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        setActionMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Corrected session status checks
  if (sessionStatus === 'loading') {
    return <LoadingSpinner />;
  }

  // IMPORTANT: Check for unauthenticated FIRST, then authenticated non-admin.
  // This order prevents isAdmin (which might be false for unauthenticated) from causing premature redirection.
  if (sessionStatus === 'unauthenticated') {
    router.push('/login'); // Or your designated login page
    return <div className="p-4 text-red-500">Session expired or not authenticated. Redirecting to login...</div>;
  }
  
  // Now, if authenticated, check if admin. If not, redirect.
  if (sessionStatus === 'authenticated' && !isAdmin) {
    router.push('/dashboard');
    return <div className="p-4 text-red-500">Access Denied. You are not authorized to view this page. Redirecting to dashboard...</div>;
  }
  
  // If we reach here, session is 'authenticated' AND user is 'isAdmin'.
  // Proceed to render the page content.

  const renderPermissions = (permissions: Permission[]) => {
    if (!permissions || permissions.length === 0) return 'None';
    return permissions.map(p => p.split('_')[1].toLowerCase().replace(/s$/, '')).join(', ');
  };
  
  const renderUsersTab = () => (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
        />
      </div>

      {/* Loading State */}
      {loadingUsers && !initialUsersFetchAttempted && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && initialUsersFetchAttempted && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingUsers && initialUsersFetchAttempted && filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {userSearchTerm ? 'No Users Found' : 'No Users Available'}
          </h3>
          <p className="text-gray-500 mb-6">
            {userSearchTerm ? 'Try a different search term.' : 'No users have been added yet.'}
          </p>
          {!userSearchTerm && (
            <button
              onClick={() => setActiveTab('inviteNew')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite First User
            </button>
          )}
        </div>
      )}

      {/* Users Table */}
      {filteredUsers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          System Admin
                        </span>
                      ) : user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span key={role.role} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {role.role}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Role
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                       {user.isAdmin ? (
                          <span className="text-xs italic text-gray-400">All Permissions</span>
                        ) : user.roles && user.roles.length > 0 && user.roles[0].permissions.length > 0 ? (
                          <PermissionBadges 
                              permissions={user.roles[0].permissions} 
                              initialLimit={2} 
                              defaultBadgeColorClass="bg-primary-100 text-primary-800"
                          />
                        ) : (
                          <span className="text-xs italic text-gray-400">No Permissions</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isAdmin ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          user.isAdmin ? 'bg-success-400' : 'bg-gray-400'
                        }`}></div>
                        {user.isAdmin ? 'Active Admin' : 'Active User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                        >
                          <EditIcon className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        {currentUserId !== user.id && (
                          <button
                            onClick={() => openDeleteUserDialog(user)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors duration-200"
                          >
                           <DeleteIcon className="w-3 h-3 mr-1" />
                           Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderInvitationsTab = () => (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search invitations by email..."
          value={invitationSearchTerm}
          onChange={(e) => setInvitationSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
        />
      </div>

      {/* Loading State */}
      {loadingInvitations && !initialInvitationsFetchAttempted && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && initialInvitationsFetchAttempted && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingInvitations && initialInvitationsFetchAttempted && filteredInvitations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {invitationSearchTerm ? 'No Invitations Found' : 'No Invitations Available'}
          </h3>
          <p className="text-gray-500 mb-6">
            {invitationSearchTerm ? 'Try a different search term.' : 'No invitations have been sent yet.'}
          </p>
          {!invitationSearchTerm && (
            <button
              onClick={() => setActiveTab('inviteNew')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send First Invitation
            </button>
          )}
        </div>
      )}
      {/* Invitations Table */}
      {filteredInvitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invitation</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sent</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expires</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvitations.map((invite) => {
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                const invitationLink = `${baseUrl}/accept-invitation?token=${invite.token}`;
                
                return (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${invite.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          invite.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {invite.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(invite.role)}`}>
                        {invite.role.charAt(0).toUpperCase() + invite.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <PermissionBadges 
                        permissions={invite.permissions} 
                        initialLimit={2}
                        defaultBadgeColorClass="bg-purple-100 text-purple-800"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(invite.createdAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(invite.expiresAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invite.invitedBy.name || invite.invitedBy.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invite.invitedUser ? (invite.invitedUser.name || invite.invitedUser.email) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invite.status === 'PENDING' && baseUrl ? (
                        <a href={invitationLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 break-all" title={invitationLink}>
                          View Link
                        </a>
                      ) : invite.status !== 'PENDING' ? '-' : 'Generating link...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invite.status === 'PENDING' && (
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => openEditInvitationModal(invite)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <EditIcon /> Edit
                          </button>
                          <button 
                            onClick={() => openRevokeDialog(invite)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <RevokeIcon /> Revoke
                          </button>
                        </div>
                      )}
                      {invite.status !== 'PENDING' && '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderInviteTab = () => (
    <div className="p-6 space-y-6">
      {inviteMessage && (
        <div 
          className={`p-4 rounded-xl border shadow-sm relative ${
            inviteMessage.type === 'success' 
              ? 'bg-success-50 border-success-200 text-success-700' 
              : 'bg-danger-50 border-danger-200 text-danger-700'
          }`}
        >
          <div className="flex items-center">
            {inviteMessage.type === 'success' ? (
              <svg className="w-5 h-5 mr-3 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-3 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{inviteMessage.text}</span>
          </div>
          <button 
            onClick={() => setInviteMessage(null)} 
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invite New User</h2>
          <p className="text-gray-600">Send an invitation to add a new user to your organization.</p>
        </div>
        
        <form onSubmit={handleInviteSubmit} className="space-y-6">
        <div>
          <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="inviteEmail"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 mb-1">
            Assign Role
          </label>
          <select
            id="inviteRole"
            value={inviteSelectedRole}
            onChange={(e) => setInviteSelectedRole(e.target.value as Role)}
            className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
          >
            {allRolesList.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Permissions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-xl max-h-60 overflow-y-auto bg-gray-50">
            {allPermissionsList.map((permission) => (
              <div key={permission} className="flex items-center">
                <input
                  id={`invite-permission-${permission}`}
                  type="checkbox"
                  checked={inviteSelectedPermissions.includes(permission)}
                  onChange={() => handleInvitePermissionChange(permission)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor={`invite-permission-${permission}`} className="ml-2 text-sm text-gray-700">
                  {permission.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </label>
              </div>
            ))}
             {allPermissionsList.length === 0 && <p className="col-span-full text-sm text-gray-500">No permissions available to assign.</p>}
          </div>
        </div>

        {allPermissionsList.length > 0 && (
          <div className="flex items-center mt-3 mb-2">
            <input
              id="invite-select-all-permissions"
              type="checkbox"
              checked={inviteSelectedPermissions.length === allPermissionsList.length}
              onChange={(e) => handleInviteSelectAllPermissions(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="invite-select-all-permissions" className="ml-2 text-sm font-medium text-gray-700">
              Select All Permissions
            </label>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={inviteIsLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {inviteIsLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Invitation...
                </>
            ) : 'Send Invitation'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and invitations for your organization"
        icon={
          <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <WorkInProgressBanner pageName="User Management" />

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}
        
        {actionMessage && (
          <div 
            className={`p-4 mb-6 rounded-xl border shadow-sm relative ${
              actionMessage.type === 'success' 
                ? 'bg-success-50 border-success-200 text-success-700' 
                : 'bg-danger-50 border-danger-200 text-danger-700'
            }`}
          >
            <div className="flex items-center">
              {actionMessage.type === 'success' ? (
                <svg className="w-5 h-5 mr-3 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{actionMessage.text}</span>
            </div>
            <button 
              onClick={() => setActionMessage(null)} 
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => { setActiveTab('users'); setInviteMessage(null); setActionMessage(null); }}
                className={`
                  ${activeTab === 'users' 
                    ? 'border-primary-500 text-primary-600 bg-primary-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg
                `}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Active Users
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('invitations'); setInviteMessage(null); setActionMessage(null); }}
                className={`
                  ${activeTab === 'invitations' 
                    ? 'border-primary-500 text-primary-600 bg-primary-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg
                `}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Invitations
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('inviteNew'); setActionMessage(null); }}
                className={`
                  ${activeTab === 'inviteNew' 
                    ? 'border-primary-500 text-primary-600 bg-primary-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg
                `}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Invite New User
                </div>
              </button>
            </nav>
          </div>

          {activeTab === 'users' && renderUsersTab()}

          {activeTab === 'invitations' && renderInvitationsTab()}

          {activeTab === 'inviteNew' && renderInviteTab()}
        </div>

        {invitationToRevoke && (
          <ConfirmDialog 
              isOpen={showConfirmDialog && !!invitationToRevoke}
              onClose={closeRevokeDialog}
              onConfirm={confirmRevoke}
              title="Revoke Invitation"
              message={`Are you sure you want to revoke the invitation for ${invitationToRevoke.email}? This action cannot be undone.`}
              confirmButtonText="Revoke"
              confirmButtonColor="red"
          />
        )}

        {invitationToEdit && (
          <EditInvitationModal
            isOpen={showEditModal && !!invitationToEdit}
            onClose={closeEditInvitationModal}
            invitation={invitationToEdit}
            onSave={handleSaveInvitation}
            allRoles={allRolesList}
            allPermissions={allPermissionsList}
          />
        )}

        {userToEdit && (
            <EditUserModal 
              isOpen={showEditModal && !!userToEdit}
              onClose={closeEditUserModal}
              user={userToEdit}
              onSave={handleSaveUser}
              allRoles={allRolesList}
              allPermissions={allPermissionsList}
            />
        )}

        {userToDelete && (
          <ConfirmDialog
              isOpen={showConfirmDialog && !!userToDelete}
              onClose={closeDeleteUserDialog}
              onConfirm={confirmDeleteUser}
              title="Delete User"
              message={`Are you sure you want to delete the user ${userToDelete.name || userToDelete.email}? This will also remove their assigned roles. This action cannot be undone.`}
              confirmButtonText="Delete User"
              confirmButtonColor="red"
          />
        )}
      </div>
    </div>
  );
} 