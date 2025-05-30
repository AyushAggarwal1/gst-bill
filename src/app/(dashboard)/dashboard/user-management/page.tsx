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

// SVG Icons (Heroicons or similar simple style)
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.032 3.223.094M7.5 5.25l.47-2.551a.75.75 0 01.684-.528h4.692a.75.75 0 01.684.528l.47 2.551M5.25 5.25h13.5" />
  </svg>
);

const RevokeIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

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

// Spinner component (defined at the module level, before the main component)
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

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
  }, [typedSession?.user?.id]);

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
  }, [typedSession?.user?.id]);

  useEffect(() => {
    if (sessionStatus === 'loading') return; 

    if (sessionStatus === 'unauthenticated' || !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAdmin) {
      if (!initialUsersFetchAttempted && !loadingUsers) {
        fetchUsers();
      }
      if (!initialInvitationsFetchAttempted && !loadingInvitations) {
        fetchInvitations();
      }
    }
  }, [sessionStatus, isAdmin, router, initialUsersFetchAttempted, initialInvitationsFetchAttempted, loadingUsers, loadingInvitations, fetchUsers, fetchInvitations]);

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

  if (sessionStatus === 'loading') {
    return <div className="p-8 flex justify-center items-center min-h-screen"><Spinner /></div>;
  }

  if (!isAdmin && sessionStatus === 'authenticated') {
    return <div className="p-8 text-red-500">Access Denied. You are not authorized to view this page.</div>;
  }
  
  const renderPermissions = (permissions: Permission[]) => {
    if (!permissions || permissions.length === 0) return 'None';
    return permissions.map(p => p.split('_')[1].toLowerCase().replace(/s$/, '')).join(', ');
  };
  
  const [showEditInvitationModal, setShowEditInvitationModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserConfirmDialog, setShowDeleteUserConfirmDialog] = useState(false);
  const [showRevokeInvitationConfirmDialog, setShowRevokeInvitationConfirmDialog] = useState(false);

  const openRevokeDialog = (invitation: InvitationData) => {
    setInvitationToRevoke(invitation);
    setShowRevokeInvitationConfirmDialog(true);
    setActionMessage(null);
  };

  const closeRevokeDialog = () => {
    setShowRevokeInvitationConfirmDialog(false);
    setInvitationToRevoke(null);
  };
  
  const openEditInvitationModal = (invitation: InvitationData) => {
    setInvitationToEdit(invitation);
    setShowEditInvitationModal(true);
    setActionMessage(null);
  };

  const closeEditInvitationModal = () => {
    setShowEditInvitationModal(false);
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
    setShowEditUserModal(true);
    setActionMessage(null);
  };

  const closeEditUserModal = () => {
    setShowEditUserModal(false);
    setUserToEdit(null);
  };
  
  const openDeleteUserDialog = (user: UserData) => {
    if (user.id === currentUserId) {
        setActionMessage({ type: 'error', text: 'You cannot delete your own account from here.' });
        return;
    }
    setUserToDelete(user);
    setShowDeleteUserConfirmDialog(true);
    setActionMessage(null);
  };

  const closeDeleteUserDialog = () => {
    setShowDeleteUserConfirmDialog(false);
    setUserToDelete(null);
  };

  const newConfirmRevoke = async () => {
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
      closeRevokeDialog();
    }
  };
  
  const newHandleSaveInvitation = async (invitationId: string, newRole: Role, newPermissions: Permission[]) => {
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
      closeEditInvitationModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating';
      setActionMessage({ type: 'error', text: errorMessage });
    }
  };
  
  const newHandleSaveUser = async (userId: string, updatedData: Partial<Pick<UserDataForModal, 'name' | 'isAdmin' | 'roles'>>) => {
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
      closeEditUserModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating user';
      setActionMessage({ type: 'error', text: errorMessage });
    }
  };

  const newConfirmDeleteUser = async () => {
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
      closeDeleteUserDialog();
    }
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
      setInitialInvitationsFetchAttempted(false);
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
    if (actionMessage) {
      const timer = setTimeout(() => {
        setActionMessage(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  useEffect(() => {
    if (inviteMessage) {
      const timer = setTimeout(() => {
        setInviteMessage(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [inviteMessage]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User & Invitation Management</h1>
      </header>

      {error && <div className="p-4 mb-6 rounded-md bg-red-50 text-red-700">Error: {error}</div>}
      
      {actionMessage && (
        <div 
          className={`p-4 mb-6 rounded-md relative ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
        >
          <span>{actionMessage.text}</span>
          <button 
            onClick={() => setActionMessage(null)} 
            className="absolute top-1 right-2 text-xl font-semibold leading-none hover:opacity-75"
            aria-label="Close message"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-px" aria-label="Tabs">
          <button
            onClick={() => { setActiveTab('users'); setInviteMessage(null); setActionMessage(null); }}
            className={`
              ${activeTab === 'users' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
            `}
          >
            Active Users
          </button>
          <button
            onClick={() => { setActiveTab('invitations'); setInviteMessage(null); setActionMessage(null); }}
            className={`
              ${activeTab === 'invitations' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
            `}
          >
            Invitations
          </button>
          <button
            onClick={() => { setActiveTab('inviteNew'); setActionMessage(null); }}
            className={`
              ${activeTab === 'inviteNew' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
            `}
          >
            Invite New User
          </button>
        </nav>
      </div>

      {activeTab === 'users' && (
        <section id="registered-users" className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 sr-only">Active Users</h2>
          {loadingUsers ? <Spinner /> : users.length === 0 && initialUsersFetchAttempted ? (
             <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Registered Users</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by inviting new users or wait for sign-ups.</p>
              </div>
          ) : loadingUsers ? <Spinner /> : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role(s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.roles && user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((r, index) => (
                              <span 
                                key={index} 
                                className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(r.role)}`}
                              >
                                {r.role.charAt(0).toUpperCase() + r.role.slice(1).toLowerCase()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses('USER')}`}>USER</span> // Default if no roles, or adjust as needed
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 align-top">
                        <PermissionBadges 
                            permissions={user.roles.flatMap(r => r.permissions)} 
                            initialLimit={2}
                            badgeColorClass="bg-blue-100 text-blue-800"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(user.createdAt), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => openEditUserModal(user)} 
                                className="flex items-center text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out px-2 py-1 hover:bg-indigo-50 rounded-md"
                                title="Edit User"
                                disabled={loadingUsers}
                            >
                                <EditIcon /> Edit
                            </button>
                            {user.id !== currentUserId && (
                                <button 
                                    onClick={() => openDeleteUserDialog(user)} 
                                    className="flex items-center text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out px-2 py-1 hover:bg-red-50 rounded-md"
                                    title="Delete User"
                                    disabled={loadingUsers}
                                >
                                    <DeleteIcon /> Delete
                                </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'invitations' && (
        <section id="invitations" className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 sr-only">Invitations</h2>
          {loadingInvitations ? <Spinner /> : invitations.length === 0 && initialInvitationsFetchAttempted ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Invitations</h3>
              <p className="mt-1 text-sm text-gray-500">Use the 'Invite New User' tab to send out new invitations.</p>
            </div>
          ) : loadingInvitations ? <Spinner /> : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accepted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invitation Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map(invite => {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    const invitationLink = `${baseUrl}/accept-invitation?token=${invite.token}`;
                    
                    return (
                      <tr key={invite.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invite.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${invite.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                  invite.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {invite.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(invite.role)}`}>
                                {invite.role.charAt(0).toUpperCase() + invite.role.slice(1).toLowerCase()}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 align-top">
                           <PermissionBadges 
                            permissions={invite.permissions} 
                            initialLimit={2}
                            badgeColorClass="bg-purple-100 text-purple-800"
                           />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(invite.createdAt), 'dd MMM yyyy HH:mm')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(invite.expiresAt), 'dd MMM yyyy HH:mm')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invite.invitedBy.name || invite.invitedBy.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invite.invitedUser ? (invite.invitedUser.name || invite.invitedUser.email) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invite.status === 'PENDING' && baseUrl ? (
                            <a href={invitationLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 break-all" title={invitationLink}>
                              View Link
                            </a>
                          ) : invite.status !== 'PENDING' ? '-' : 'Generating link...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {invite.status === 'PENDING' && (
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => openEditInvitationModal(invite)}
                                className="flex items-center text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out px-2 py-1 hover:bg-indigo-50 rounded-md"
                                title="Edit Invitation"
                                disabled={loadingInvitations}
                              >
                                <EditIcon /> Edit
                              </button>
                              <button 
                                onClick={() => openRevokeDialog(invite)}
                                className="flex items-center text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out px-2 py-1 hover:bg-red-50 rounded-md"
                                title="Revoke Invitation"
                                disabled={loadingInvitations}
                              >
                                <RevokeIcon /> Revoke
                              </button>
                            </div>
                          )}
                          {invite.status !== 'PENDING' && '-'}
                        </td>
                      </tr>
                    )}
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'inviteNew' && (
        <section id="invite-new-user" className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Invite New User</h2>
          {inviteMessage && (
            <div 
              className={`p-4 mb-6 rounded-md relative ${inviteMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
            >
              <span>{inviteMessage.text}</span>
              <button 
                onClick={() => setInviteMessage(null)} 
                className="absolute top-1 right-2 text-xl font-semibold leading-none hover:opacity-75"
                aria-label="Close message"
              >
                &times;
              </button>
            </div>
          )}
          <form onSubmit={handleInviteSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6 max-w-2xl mx-auto">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2 border rounded-md max-h-60 overflow-y-auto">
                {allPermissionsList.map((permission) => (
                  <div key={permission} className="flex items-center">
                    <input
                      id={`invite-permission-${permission}`}
                      type="checkbox"
                      checked={inviteSelectedPermissions.includes(permission)}
                      onChange={() => handleInvitePermissionChange(permission)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
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
        </section>
      )}

      {showRevokeInvitationConfirmDialog && invitationToRevoke && (
        <ConfirmDialog 
            isOpen={showRevokeInvitationConfirmDialog}
            onClose={closeRevokeDialog}
            onConfirm={newConfirmRevoke}
            title="Revoke Invitation"
            message={`Are you sure you want to revoke the invitation for ${invitationToRevoke.email}? This action cannot be undone.`}
            confirmButtonText="Revoke"
            confirmButtonColor="red"
        />
      )}

      {showEditInvitationModal && invitationToEdit && (
        <EditInvitationModal
          isOpen={showEditInvitationModal}
          onClose={closeEditInvitationModal}
          invitation={invitationToEdit}
          onSave={newHandleSaveInvitation}
          allRoles={allRolesList}
          allPermissions={allPermissionsList}
        />
      )}

      {showEditUserModal && userToEdit && (
          <EditUserModal 
            isOpen={showEditUserModal}
            onClose={closeEditUserModal}
            user={userToEdit}
            onSave={newHandleSaveUser}
            allRoles={allRolesList}
            allPermissions={allPermissionsList}
          />
      )}

      {showDeleteUserConfirmDialog && userToDelete && (
        <ConfirmDialog
            isOpen={showDeleteUserConfirmDialog}
            onClose={closeDeleteUserDialog}
            onConfirm={newConfirmDeleteUser}
            title="Delete User"
            message={`Are you sure you want to delete the user ${userToDelete.name || userToDelete.email}? This will also remove their assigned roles. This action cannot be undone.`}
            confirmButtonText="Delete User"
            confirmButtonColor="red"
        />
      )}

    </div>
  );
} 