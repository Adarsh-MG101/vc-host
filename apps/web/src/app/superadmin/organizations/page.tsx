'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Pencil, Trash2, Info, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Table } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { ConfirmationCard } from '../../../components/ui/ConfirmationCard';
import {
  organizationService,
  CreateOrgData,
} from '../../../services/organization.service';

interface OrganizationItem {
  _id: string;
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'active' | 'inactive';
  owner: {
    name: string;
    email: string;
    status: string;
  };
  stats?: {
    members: number;
    templates: number;
    certificates: number;
  };
  membersList?: {
    name: string;
    email: string;
    orgRole: string;
    status: string;
  }[];
  createdAt: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationItem | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<OrganizationItem | null>(null);
  const [viewingOrg, setViewingOrg] = useState<OrganizationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateOrgData>({
    orgName: '',
    orgSlug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    logo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const data = await organizationService.getOrganizations();
      const mappedData = data.map((org: any) => ({
        ...org,
        id: org._id,
      }));
      setOrganizations(mappedData);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'orgName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({
        ...prev,
        orgSlug: slug,
      }));
    }
  };

  const handleEditClick = (org: OrganizationItem) => {
    setEditingOrg(org);
    setFormData({
      orgName: org.name,
      orgSlug: org.slug,
      ownerName: org.owner.name,
      ownerEmail: org.owner.email,
      ownerPassword: '', // Not used for edit
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (org: OrganizationItem) => {
    setDeletingOrg(org);
  };

  const confirmDelete = async () => {
    if (!deletingOrg) return;
    setIsSubmitting(true);
    try {
      await organizationService.deleteOrganization(deletingOrg.id);
      setIsDeleted(true);
      fetchOrganizations();
    } catch (err) {
      setError('Failed to delete organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingOrg) {
        await organizationService.updateOrganization(editingOrg.id, {
          orgName: formData.orgName,
          orgSlug: formData.orgSlug,
        });
        setIsUpdated(true);
      } else {
        await organizationService.createOrganization(formData);
        setIsCreated(true);
      }

      setFormData({
        orgName: '',
        orgSlug: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        logo: '',
      });
      fetchOrganizations();
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${editingOrg ? 'update' : 'create'} organization`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (org: OrganizationItem) => {
    setIsSubmitting(true);
    try {
      const newStatus = org.status === 'active' ? 'inactive' : 'active';
      await organizationService.updateOrganization(org.id, {
        status: newStatus,
      });
      // Update local state instantly for UI feedback
      setOrganizations((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, status: newStatus } : o))
      );
      if (viewingOrg && viewingOrg.id === org.id) {
        setViewingOrg({ ...viewingOrg, status: newStatus });
      }
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;

    // Check if organization was created on or after the selected date
    let matchesDate = true;
    if (dateFilter) {
      const orgDate = new Date(org.createdAt);
      // Reset time portion for pure date comparison
      orgDate.setHours(0, 0, 0, 0);
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      matchesDate = orgDate.getTime() >= filterDate.getTime();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Page Title & Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-gray-900 tracking-tight flex items-center">
            <Users size={28} className="mr-3 text-brand-navy" />
            Organizations
          </h1>
          <p className="text-xs text-gray-400 font-medium ml-[40px]">
            Management and orchestration of all platform entities.
          </p>
        </div>
      </motion.div>

      {/* Control Bar */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="text"
            placeholder="Search organizations..."
            className="w-[320px] px-6 py-3.5 bg-white border border-gray-100 rounded-lg shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-brand-navy outline-none transition-all text-sm font-medium text-gray-700 placeholder:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="w-[180px]">
            <Select
              value={statusFilter}
              onChange={(val) =>
                setStatusFilter(val as 'all' | 'active' | 'inactive')
              }
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Active Only', value: 'active' },
                { label: 'Inactive Only', value: 'inactive' },
              ]}
              placeholder="Filter Status"
            />
          </div>
          <CustomDatePicker
            value={dateFilter}
            onChange={setDateFilter}
            placeholder="Created After"
          />
        </div>

        <button
          onClick={() => {
            setEditingOrg(null);
            setFormData({
              orgName: '',
              orgSlug: '',
              ownerName: '',
              ownerEmail: '',
              ownerPassword: '',
              logo: '',
            });
            setIsModalOpen(true);
          }}
          className="bg-brand-navy hover:opacity-90 text-white px-8 py-3.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/10"
        >
          + NEW ORGANIZATION
        </button>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <Table
          data={filteredOrgs}
          isLoading={isLoading}
          columns={[
            {
              header: 'ORG NAME',
              accessor: (org: OrganizationItem) => (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-brand-navy border border-gray-100 uppercase font-black text-[10px] overflow-hidden">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      org.name.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight">
                      {org.name}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: 'OWNER',
              accessor: (org: OrganizationItem) => (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {org.owner.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                    {org.owner.email}
                  </span>
                </div>
              ),
            },
            {
              header: 'MEMBERS',
              className: 'text-center',
              accessor: (org: OrganizationItem) => (
                <span className="text-sm font-bold text-gray-700">
                  {org.stats?.members || 0}
                </span>
              ),
            },
            {
              header: 'TEMPLATES',
              className: 'text-center',
              accessor: (org: OrganizationItem) => (
                <span className="text-sm font-bold text-gray-700">
                  {org.stats?.templates || 0}
                </span>
              ),
            },
            {
              header: 'CERTIFICATES',
              className: 'text-center',
              accessor: (org: OrganizationItem) => (
                <span className="text-sm font-bold text-gray-700">
                  {org.stats?.certificates || 0}
                </span>
              ),
            },
            {
              header: 'STATUS',
              className: 'text-center',
              accessor: (org: OrganizationItem) => (
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    org.status === 'active'
                      ? 'bg-green-50 text-green-500'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {org.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              header: 'CREATED',
              className: 'text-center',
              accessor: (org: OrganizationItem) => (
                <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest text-center">
                  {new Date(org.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              ),
            },
            {
              header: 'ACTIONS',
              className: 'text-center',
              accessor: (org: OrganizationItem) => (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setViewingOrg(org)}
                    className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    title="View Details"
                  >
                    <Info size={20} />
                  </button>
                  <button
                    onClick={() => handleEditClick(org)}
                    className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                    title="Edit Organization"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(org)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Organization"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Creation Modal (Synched with Image) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            setTimeout(() => {
              setIsCreated(false);
              setIsUpdated(false);
              setEditingOrg(null);
            }, 300);
          }
        }}
        title={
          isCreated || isUpdated
            ? ''
            : editingOrg
            ? 'Configure Organization'
            : 'Register Organization'
        }
        size={isCreated || isUpdated ? 'md' : 'xl'}
        noScroll={isCreated || isUpdated}
        footer={
          isCreated || isUpdated ? (
            <button
              onClick={() => {
                setIsModalOpen(false);
                setTimeout(() => {
                  setIsCreated(false);
                  setIsUpdated(false);
                  setEditingOrg(null);
                }, 300);
              }}
              className="w-full bg-brand-navy text-white px-8 py-3.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all"
            >
              CLOSE
            </button>
          ) : (
            <div className="flex w-full space-x-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 px-8 py-3.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all transform active:scale-[0.98] border border-gray-100"
                disabled={isSubmitting}
              >
                CANCEL
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-brand-navy hover:opacity-90 text-white px-8 py-3.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'SAVING...'
                  : editingOrg
                  ? 'UPDATE'
                  : 'CREATE ORG'}
              </button>
            </div>
          )
        }
      >
        {isCreated || isUpdated ? (
          <ConfirmationCard
            variant="success"
            title={
              isCreated ? 'Organization Provisioned' : 'Organization Updated'
            }
            description={
              isCreated
                ? 'The account has been created and credentials have been securely mailed to the owner.'
                : 'The organization details have been successfully updated.'
            }
            icon={<CheckCircle size={32} />}
            confirmLabel="Done"
            onConfirm={() => {
              setIsModalOpen(false);
              setTimeout(() => {
                setIsCreated(false);
                setIsUpdated(false);
                setEditingOrg(null);
              }, 300);
            }}
            isSingleAction={true}
          />
        ) : (
          <div className="space-y-4 pt-0 pb-2">
            {!editingOrg && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Organization Logo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                        LOGO
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({
                              ...prev,
                              logo: reader.result as string,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-[0.1em] file:bg-gray-50 file:text-brand-navy hover:file:bg-gray-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                      Max block footprint: 2MB. Square (1:1) aspect ratio
                      recommended.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Input
              label="ORGANIZATION NAME"
              name="orgName"
              placeholder="E.g. Acme Corporation"
              value={formData.orgName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="OWNER FULL NAME"
              name="ownerName"
              placeholder="John Doe"
              value={formData.ownerName}
              onChange={handleInputChange}
              disabled={!!editingOrg}
              required
            />
            <Input
              label="OWNER EMAIL ADDRESS"
              name="ownerEmail"
              type="email"
              placeholder="owner@company.com"
              value={formData.ownerEmail}
              onChange={handleInputChange}
              disabled={!!editingOrg}
              required
            />
            {!editingOrg && (
              <Input
                label="INITIAL PASSWORD"
                name="ownerPassword"
                type="password"
                placeholder="Set a temporary password"
                value={formData.ownerPassword}
                onChange={handleInputChange}
                showPasswordToggle={true}
                helperText="The owner will use this to log in initially. Min 8 characters."
                required
              />
            )}
            {error && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest px-2">
                {error}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingOrg}
        onClose={() => {
          if (!isSubmitting) {
            setDeletingOrg(null);
            setIsDeleted(false);
          }
        }}
        title={isDeleted ? 'Delete Successful' : 'Delete Organization'}
        size="md"
        noScroll={true}
      >
        {isDeleted ? (
          <ConfirmationCard
            variant="success"
            title="Organization Deleted"
            description="The organization record and all associated metadata have been permanently removed from the system."
            icon={<CheckCircle size={32} />}
            confirmLabel="Done"
            onConfirm={() => {
              setDeletingOrg(null);
              setIsDeleted(false);
            }}
            isSingleAction={true}
          />
        ) : (
          <ConfirmationCard
            variant="danger"
            title="Are you sure?"
            description={`You are about to permanently delete "${deletingOrg?.name}". This action cannot be undone.`}
            icon={<Trash2 size={32} />}
            confirmLabel="Delete Organization"
            cancelLabel="Keep Organization"
            onConfirm={confirmDelete}
            onCancel={() => setDeletingOrg(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Organization Details Modal */}
      <Modal
        isOpen={!!viewingOrg}
        onClose={() => setViewingOrg(null)}
        title="Organization Details"
        size="lg"
        footer={
          <div className="flex w-full space-x-4">
            <button
              onClick={() => setViewingOrg(null)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 px-8 py-3.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all border border-gray-100"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {viewingOrg && (
          <div className="space-y-8 pt-0 pb-2">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-brand-navy font-black text-xl uppercase mt-1 overflow-hidden">
                  {viewingOrg.logo ? (
                    <img
                      src={viewingOrg.logo}
                      alt={viewingOrg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    viewingOrg.name.charAt(0)
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    {viewingOrg.name}
                  </h3>
                  <div className="mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        viewingOrg.status === 'active'
                          ? 'bg-green-50 text-green-500 border-green-100'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      {viewingOrg.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => handleToggleStatus(viewingOrg)}
                  disabled={isSubmitting}
                  className={`mt-1.5 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all transform active:scale-[0.98] ${
                    viewingOrg.status === 'active'
                      ? 'bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-100/50 hover:shadow-lg hover:shadow-red-500/20'
                      : 'bg-brand-navy hover:opacity-90 text-white shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isSubmitting
                    ? 'Updating...'
                    : viewingOrg.status === 'active'
                    ? 'Deactivate'
                    : 'Activate'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Owner Info */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100/50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Owner Identity
                </h4>
                <div className="flex flex-wrap gap-8 items-start">
                  <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">
                      Name
                    </p>
                    <p
                      className="text-sm font-bold text-gray-900 truncate"
                      title={viewingOrg.owner.name}
                    >
                      {viewingOrg.owner.name}
                    </p>
                  </div>
                  <div className="flex-[2] min-w-[200px]">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">
                      Email Address
                    </p>
                    <p
                      className="text-sm font-medium text-gray-700 truncate"
                      title={viewingOrg.owner.email}
                    >
                      {viewingOrg.owner.email}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">
                      Created
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(viewingOrg.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100/50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Organization Members ({viewingOrg.stats?.members || 0})
                </h4>
                <div className="space-y-3 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                  {viewingOrg.membersList &&
                  viewingOrg.membersList.length > 0 ? (
                    viewingOrg.membersList.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 relative group"
                      >
                        <div className="flex items-center justify-between pb-1">
                          <p className="text-xs font-bold text-gray-900 truncate pr-2">
                            {member.name}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              member.orgRole === 'owner'
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-blue-50 text-blue-500'
                            }`}
                          >
                            {member.orgRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate pr-16">
                          {member.email}
                        </p>
                        <span
                          className={`absolute bottom-3 right-3 w-2 h-2 rounded-full ${
                            member.status === 'active'
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                          title={member.status}
                        ></span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs font-bold text-gray-300 italic uppercase tracking-widest">
                      No members allocated
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
