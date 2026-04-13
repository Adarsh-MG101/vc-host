'use client';

import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Shield,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Mail,
  Settings,
} from 'lucide-react';
import { Table } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Toast } from '../../../components/ui/Toast';
import { ConfirmationCard } from '../../../components/ui/ConfirmationCard';
import { IUser, IRole } from '../../../services/team.service';

import { useTeam } from '../../../hooks/useTeam';
import { motion, AnimatePresence } from 'framer-motion';

interface ITableUser extends IUser {
  id: string;
}

interface ITableRole extends IRole {
  id: string;
}

const ALL_PERMISSIONS = [
  { id: 'dashboard.view', label: 'View Dashboard' },
  { id: 'template.view', label: 'View Templates' },
  { id: 'template.add', label: 'Add Templates' },
  { id: 'template.edit', label: 'Edit Templates' },
  { id: 'template.delete', label: 'Delete Templates' },
  { id: 'certificate.view', label: 'View Certificates' },
  { id: 'certificate.generate', label: 'Generate Certificates' },
  { id: 'certificate.send', label: 'Send Certificates' },
  { id: 'certificate.delete', label: 'Delete Certificates' },
  { id: 'profile.update', label: 'Update Profile' },
  { id: 'activity.view', label: 'View Activity' },
  { id: 'activity.export', label: 'Export Activity' },
];

export default function RolesAndUsersPage() {
  const {
    users,
    roles,
    isLoading,
    createUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    createRole,
    updateRole,
    deleteRole,
  } = useTeam();

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Toast state
  const [toast, setToast] = useState<{
    isVisible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'danger' | 'warning' | 'info';
  }>({
    isVisible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showToast = (
    title: string,
    message: string,
    variant: 'success' | 'danger' | 'warning' | 'info'
  ) => {
    setToast({ isVisible: true, title, message, variant });
  };

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isUserDeleted, setIsUserDeleted] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any | null>(null);
  const [isRoleDeleted, setIsRoleDeleted] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [roleUpdateStep, setRoleUpdateStep] = useState<'select' | 'confirm'>(
    'select'
  );
  const [isConfirmingRoleSave, setIsConfirmingRoleSave] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form states
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgRole: 'member',
    customRole: '',
  });

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    permissions: [] as string[],
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(userFormData);
      setIsUserCreated(true);
      setUserFormData({
        name: '',
        email: '',
        password: '',
        orgRole: 'member',
        customRole: '',
      });
    } catch (err: any) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEditItem) {
      setIsConfirmingRoleSave(true);
    } else {
      await confirmSaveRole();
    }
  };

  const confirmSaveRole = async () => {
    try {
      setIsSavingRole(true);
      if (currentEditItem) {
        await updateRole(currentEditItem.id, roleFormData);
        showToast('Success', 'Role updated successfully', 'success');
      } else {
        await createRole(roleFormData);
        showToast('Success', 'Role created successfully', 'success');
      }
      setIsRoleModalOpen(false);
      setRoleFormData({ name: '', permissions: [] });
      setCurrentEditItem(null);
      setIsConfirmingRoleSave(false);
    } catch (err: any) {
      showToast('Error', err.message, 'danger');
    } finally {
      setIsSavingRole(false);
    }
  };

  const togglePermission = (permId: string) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsUserDeleted(false);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setIsUserDeleted(true);
    } catch (err: any) {
      showToast('Error', err.message, 'danger');
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      setIsDeletingRole(true);
      await deleteRole(roleToDelete.id);
      setIsRoleDeleted(true);
      showToast('Success', 'Role deleted successfully', 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'danger');
    } finally {
      setIsDeletingRole(false);
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    try {
      await updateUserStatus(userId, currentStatus);
      showToast('Success', `User status updated successfully`, 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleRoleChangeConfirm = async () => {
    if (!userToUpdateRole || !newRole) return;
    try {
      setIsUpdatingRole(true);
      await updateUserRole(userToUpdateRole.id, newRole);
      showToast('Success', 'Role updated successfully', 'success');
      setUserToUpdateRole(null);
    } catch (err: any) {
      showToast('Error', err.message, 'danger');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const userColumns = [
    {
      header: 'NAME',
      accessor: (u: ITableUser) => (
        <div className="flex items-center space-x-3 text-left">
          <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xs uppercase shadow-inner border border-brand-orange/20 scale-110 shrink-0">
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-extrabold text-brand-navy tracking-tight">
              {u.name}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                {u.email}
              </p>
              {u.customRole && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-200" />
                  <span className="text-[9px] font-black text-brand-orange uppercase tracking-wider bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100/50">
                    {typeof u.customRole === 'object'
                      ? u.customRole.name.toUpperCase()
                      : 'CUSTOM ROLE'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'ROLE',
      className: 'text-center',
      accessor: (u: ITableUser) => (
        <div className="flex items-center justify-center space-x-2">
          <StatusBadge
            label={u.orgRole.toUpperCase()}
            variant={u.orgRole === 'owner' ? 'brand' : 'gray'}
          />
        </div>
      ),
    },
    {
      header: 'STATUS',
      className: 'text-center',
      accessor: (u: ITableUser) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() =>
              u.orgRole !== 'owner' && handleUpdateStatus(u._id, u.status)
            }
            className={`transition-all duration-300 ${
              u.orgRole === 'owner'
                ? 'cursor-default'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            <StatusBadge
              label={u.status.toUpperCase()}
              variant={u.status === 'active' ? 'success' : 'danger'}
            />
          </button>
        </div>
      ),
    },
    {
      header: 'JOINED',
      className: 'text-center',
      accessor: (u: ITableUser) => (
        <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest text-center">
          {new Date(u.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })}
        </p>
      ),
    },
    {
      header: 'ACTIONS',
      className: 'text-center',
      accessor: (u: ITableUser) => {
        // Use the same robust owner detection as the Sidebar
        const storageUser =
          typeof window !== 'undefined'
            ? localStorage.getItem('vc_user') || localStorage.getItem('user')
            : null;
        const me = storageUser ? JSON.parse(storageUser) : null;

        // In this app environment, non-superadmins are considered organization owners/admins
        const isPrivileged = me?.role !== 'superadmin';
        const isTargetOwner = u.orgRole?.toLowerCase() === 'owner';

        if (!isMounted) return null;

        return (
          <div className="flex items-center justify-center space-x-2">
            {isPrivileged && !isTargetOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-brand-navy hover:bg-blue-50 transition-all rounded-xl p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToUpdateRole(u);
                  setNewRole(u.orgRole);
                }}
                title="Change User Role"
              >
                <Settings size={18} />
              </Button>
            )}
            {!isTargetOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(u);
                }}
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const roleColumns = [
    {
      header: 'ROLE NAME',
      accessor: (r: ITableRole) => (
        <div className="flex items-center space-x-3 text-brand-navy">
          <div className="p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner shrink-0">
            <Shield size={18} className="text-brand-orange" />
          </div>
          <p className="font-extrabold tracking-tight text-left">{r.name}</p>
        </div>
      ),
    },
    {
      header: 'PERMISSIONS',
      className: 'text-center',
      accessor: (r: ITableRole) => (
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            {r.permissions.length} PERMS
          </p>
        </div>
      ),
    },
    {
      header: 'TYPE',
      className: 'text-center',
      accessor: (r: ITableRole) => (
        <div className="flex justify-center">
          <StatusBadge
            label={r.isSystem ? 'SYSTEM' : 'CUSTOM'}
            variant={r.isSystem ? 'brand' : 'info'}
          />
        </div>
      ),
    },
    {
      header: 'ACTIONS',
      className: 'text-center',
      accessor: (r: ITableRole) => (
        <div className="flex items-center justify-center space-x-2">
          {!r.isSystem && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-brand-navy hover:bg-blue-50 transition-all active:scale-95 rounded-xl"
                onClick={() => {
                  setCurrentEditItem(r);
                  setRoleFormData({ name: r.name, permissions: r.permissions });
                  setIsRoleModalOpen(true);
                }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95 rounded-xl"
                onClick={() => setRoleToDelete(r)}
              >
                <Trash2 size={18} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 min-h-screen pb-20 font-sans">
      <Toast
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
      />{' '}
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-gray-100 shadow-2xl shadow-gray-200/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange shadow-inner">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">
              Roles & Support
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-400 ml-13">
            Manage your organization's team structure and access controls.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="rounded-xl px-6 h-13 bg-brand-navy hover:bg-brand-navy/90 text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-brand-navy/20 transition-all duration-300 active:scale-95 flex items-center gap-2"
            onClick={() =>
              activeTab === 'users'
                ? setIsUserModalOpen(true)
                : setIsRoleModalOpen(true)
            }
          >
            <Plus size={18} />
            ADD {activeTab === 'users' ? 'USER' : 'ROLE'}
          </Button>
        </div>
      </div>
      {/* Tabs Layout */}
      <div className="flex items-center space-x-3 bg-white p-1.5 rounded-xl border border-gray-100 shadow-lg w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`
            px-8 py-3 rounded-lg text-xs font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center space-x-3
            ${
              activeTab === 'users'
                ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                : 'text-gray-400 hover:text-brand-navy hover:bg-gray-50'
            }
          `}
        >
          <UsersIcon size={16} />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`
            px-8 py-3 rounded-lg text-xs font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center space-x-3
            ${
              activeTab === 'roles'
                ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                : 'text-gray-400 hover:text-brand-navy hover:bg-gray-50'
            }
          `}
        >
          <Shield size={16} />
          <span>Roles</span>
        </button>
      </div>
      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'users' ? (
            <Table data={users} columns={userColumns} isLoading={isLoading} />
          ) : (
            <Table data={roles} columns={roleColumns} isLoading={isLoading} />
          )}
        </div>
      </div>
      {/* User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setTimeout(() => setIsUserCreated(false), 300);
        }}
        title={isUserCreated ? 'Invitation Sent' : 'Invite New User'}
        size="lg"
      >
        {isUserCreated ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                User Invited Successfully
              </h3>
              <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                An email with login credentials has been sent to the new team
                member.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full">
              <Mail size={14} />
              <span>Notification Sent</span>
            </div>
            <Button
              onClick={() => {
                setIsUserModalOpen(false);
                setTimeout(() => setIsUserCreated(false), 300);
              }}
              className="w-full mt-4 bg-brand-navy rounded-2xl h-14 uppercase font-black tracking-widest text-xs"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-6">
            <Input
              label="FULL NAME"
              placeholder="John Doe"
              required
              value={userFormData.name}
              onChange={(e) =>
                setUserFormData({ ...userFormData, name: e.target.value })
              }
            />
            <Input
              label="EMAIL ADDRESS"
              type="email"
              placeholder="john@example.com"
              required
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
            />
            <Input
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              required
              value={userFormData.password}
              onChange={(e) =>
                setUserFormData({ ...userFormData, password: e.target.value })
              }
              showPasswordToggle
            />
            <Select
              label="ORGANIZATION ROLE"
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Member', value: 'member' },
              ]}
              value={userFormData.orgRole}
              onChange={(val: string | number) =>
                setUserFormData({ ...userFormData, orgRole: val as string })
              }
            />
            <Select
              label="CUSTOM ROLE (OPTIONAL)"
              options={[
                { label: 'None', value: '' },
                ...roles.map((r) => ({ label: r.name, value: r._id })),
              ]}
              value={userFormData.customRole}
              onChange={(val: string | number) =>
                setUserFormData({ ...userFormData, customRole: val as string })
              }
            />
            <div className="flex gap-4 pt-4">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="flex-1 rounded-2xl h-14 uppercase font-black tracking-widest text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-2xl h-14 bg-brand-navy text-white shadow-xl shadow-brand-navy/20 uppercase font-black tracking-[0.2em] text-xs"
              >
                Create User
              </Button>
            </div>
          </form>
        )}
      </Modal>
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setCurrentEditItem(null);
          setRoleFormData({ name: '', permissions: [] });
          setIsConfirmingRoleSave(false);
        }}
        title={
          currentEditItem
            ? isConfirmingRoleSave
              ? 'Confirm Update'
              : 'Edit Custom Role'
            : 'Create Custom Role'
        }
        size={isConfirmingRoleSave ? 'md' : 'xl'}
        noScroll={isConfirmingRoleSave}
      >
        <div
          className={
            isConfirmingRoleSave
              ? 'h-[340px] flex flex-col justify-center'
              : 'min-h-[400px]'
          }
        >
          <AnimatePresence mode="wait">
            {!isConfirmingRoleSave ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleCreateRole} className="space-y-8">
                  <Input
                    label="ROLE NAME"
                    placeholder="e.g. Academic Manager"
                    required
                    value={roleFormData.name}
                    onChange={(e) =>
                      setRoleFormData({ ...roleFormData, name: e.target.value })
                    }
                  />

                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                      Permissions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {ALL_PERMISSIONS.map((perm) => (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`
                            p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between
                            ${
                              roleFormData.permissions.includes(perm.id)
                                ? 'border-brand-navy bg-blue-50/30'
                                : 'border-gray-100 bg-gray-50/20 hover:border-gray-200'
                            }
                          `}
                        >
                          <span
                            className={`text-sm font-bold tracking-tight ${
                              roleFormData.permissions.includes(perm.id)
                                ? 'text-brand-navy'
                                : 'text-gray-500'
                            }`}
                          >
                            {perm.label}
                          </span>
                          {roleFormData.permissions.includes(perm.id) ? (
                            <div className="w-5 h-5 bg-brand-navy rounded-full flex items-center justify-center text-white">
                              <CheckCircle size={14} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-100 rounded-full" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setIsRoleModalOpen(false)}
                      className="flex-1 rounded-2xl h-14 uppercase font-black tracking-widest text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-2xl h-14 bg-brand-navy text-white shadow-xl shadow-brand-navy/20 uppercase font-black tracking-[0.2em] text-xs"
                    >
                      {currentEditItem ? 'Review Changes' : 'Create Role'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <ConfirmationCard
                  variant="warning"
                  title="Update Custom Role"
                  description={`You are about to modify the permissions for "${roleFormData.name}". These changes will apply to all users assigned to this role.`}
                  icon={<Shield size={32} />}
                  confirmLabel="Confirm & Update"
                  cancelLabel="Back to Edit"
                  onConfirm={confirmSaveRole}
                  onCancel={() => setIsConfirmingRoleSave(false)}
                  isLoading={isSavingRole}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
      {/* User Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => {
          if (!isLoading) {
            setUserToDelete(null);
            setIsUserDeleted(false);
          }
        }}
        title={isUserDeleted ? 'Account Removed' : 'Delete User Account?'}
        size="md"
        noScroll={true}
      >
        {isUserDeleted ? (
          <ConfirmationCard
            variant="success"
            title="Account Removed"
            description="The user account has been permanently removed from the organization database."
            icon={<CheckCircle size={32} />}
            confirmLabel="Done"
            onConfirm={() => {
              setUserToDelete(null);
              setIsUserDeleted(false);
            }}
            isSingleAction={true}
          />
        ) : (
          <ConfirmationCard
            variant="danger"
            title="Are you sure?"
            description={`You are about to permanently delete "${userToDelete?.name}". All access will be revoked immediately.`}
            icon={<Trash2 size={32} />}
            confirmLabel="Confirm Delete"
            cancelLabel="Keep User"
            onConfirm={confirmDeleteUser}
            onCancel={() => setUserToDelete(null)}
            isLoading={isLoading}
          />
        )}
      </Modal>
      {/* Role Update Modal (User Role) */}
      <Modal
        isOpen={!!userToUpdateRole}
        onClose={() => {
          setUserToUpdateRole(null);
          setRoleUpdateStep('select');
        }}
        title={
          roleUpdateStep === 'select'
            ? 'Change User Role'
            : 'Confirm Role Change'
        }
        size="md"
        noScroll={true}
      >
        <div className="h-[340px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {roleUpdateStep === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 w-full"
              >
                <div className="p-4 bg-white rounded-2xl flex items-center space-x-4 border border-gray-100">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                    <Settings size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {userToUpdateRole?.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">
                      {userToUpdateRole?.email}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Select
                    label="SYSTEM ROLE"
                    options={[
                      { label: 'Admin', value: 'admin' },
                      { label: 'Member', value: 'member' },
                    ]}
                    value={newRole}
                    onChange={(val) => setNewRole(val as string)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setUserToUpdateRole(null)}
                    className="flex-1 rounded-2xl h-14 uppercase font-black tracking-widest text-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!newRole || newRole === userToUpdateRole?.orgRole}
                    onClick={() => setRoleUpdateStep('confirm')}
                    className="flex-1 rounded-2xl h-14 bg-brand-navy text-white shadow-xl shadow-brand-navy/20 uppercase font-black tracking-widest text-[10px]"
                  >
                    Update Role
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="w-full"
              >
                <ConfirmationCard
                  variant="warning"
                  title="Update Authorization"
                  description={`You are changing permissions for ${
                    userToUpdateRole?.name
                  } to the ${newRole.toUpperCase()} role.`}
                  icon={<Settings size={32} />}
                  confirmLabel="Confirm & Update"
                  cancelLabel="Back"
                  onConfirm={handleRoleChangeConfirm}
                  onCancel={() => setRoleUpdateStep('select')}
                  isLoading={isUpdatingRole}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
      {/* Role Delete Confirmation Modal */}
      <Modal
        isOpen={!!roleToDelete}
        onClose={() => {
          if (!isDeletingRole) {
            setRoleToDelete(null);
            setIsRoleDeleted(false);
          }
        }}
        title={isRoleDeleted ? 'Role Deleted' : 'Delete Custom Role?'}
        size="md"
        noScroll={true}
      >
        {isRoleDeleted ? (
          <ConfirmationCard
            variant="success"
            title="Role Deleted"
            description="The custom role has been successfully removed from the organization."
            icon={<CheckCircle size={32} />}
            confirmLabel="Done"
            onConfirm={() => {
              setRoleToDelete(null);
              setIsRoleDeleted(false);
            }}
            isSingleAction={true}
          />
        ) : (
          <ConfirmationCard
            variant="danger"
            title="Are you sure?"
            description={`You are about to permanently delete the custom role "${roleToDelete?.name}".`}
            icon={<Trash2 size={32} />}
            confirmLabel="Confirm Delete"
            cancelLabel="Keep Role"
            onConfirm={confirmDeleteRole}
            onCancel={() => setRoleToDelete(null)}
            isLoading={isDeletingRole}
          />
        )}
      </Modal>
    </div>
  );
}
