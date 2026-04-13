'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Award,
  Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { templateService, ITemplate } from '../../../services/template.service';
import { Table } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmationCard } from '../../../components/ui/ConfirmationCard';
import { Toast } from '../../../components/ui/Toast';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<(ITemplate & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editTemplate, setEditTemplate] = useState<ITemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ITemplate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail modal
  const [detailTemplate, setDetailTemplate] = useState<ITemplate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, title: '', message: '', variant: 'success' as 'success' | 'danger' });

  const showToast = (message: string, variant: 'success' | 'danger' = 'success') => {
    setToast({ show: true, title: variant === 'success' ? 'Success' : 'Error', message, variant });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await templateService.getTemplates(search || undefined, statusFilter);
      setTemplates(data.map(t => ({ ...t, id: t._id })));
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTemplates(), 300);
    return () => clearTimeout(timer);
  }, [fetchTemplates]);

  // File handling
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.docx')) {
      showToast('Only .docx files are allowed', 'danger');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit', 'danger');
      return;
    }
    setUploadFile(file);
    if (!uploadName) {
      setUploadName(file.name.replace(/\.docx$/i, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) return;
    setIsUploading(true);
    try {
      await templateService.uploadTemplate(uploadFile, uploadName.trim());
      showToast('Template uploaded successfully');
      setUploadFile(null);
      setUploadName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'danger');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleStatus = async (template: ITemplate) => {
    try {
      await templateService.updateTemplate(template._id, { enabled: !template.enabled });
      showToast(`Template ${template.enabled ? 'disabled' : 'enabled'}`);
      fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'danger');
    }
  };

  const handleEditSave = async () => {
    if (!editTemplate || !editName.trim()) return;
    setIsSavingEdit(true);
    try {
      await templateService.updateTemplate(editTemplate._id, { name: editName.trim() });
      showToast('Template updated successfully');
      setIsEditModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'danger');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await templateService.deleteTemplate(deleteTarget._id);
      showToast('Template deleted');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  const SPECIAL_PLACEHOLDERS = ['QR_CODE', 'CERTIFICATE_ID', 'DATE'];

  const columns = [
    {
      header: 'TEMPLATE',
      accessor: (t: ITemplate) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 shrink-0">
            <FileText size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 tracking-tight">{t.name}</span>
            <span className="text-[10px] text-gray-400 font-medium">.docx</span>
          </div>
        </div>
      ),
    },
    {
      header: 'PLACEHOLDERS',
      accessor: (t: ITemplate) => (
        <div className="flex items-center space-x-2">
          <Tag size={12} className="text-gray-300" />
          <span className="text-sm font-bold text-gray-700">{t.placeholders?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'UPLOADED',
      accessor: (t: ITemplate) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-700">
            {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            {t.createdBy?.name || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      header: 'STATUS',
      accessor: (t: ITemplate) => (
        <StatusBadge
          label={t.enabled ? 'Active' : 'Inactive'}
          variant={t.enabled ? 'success' : 'gray'}
          dot
        />
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (t: ITemplate) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => { e.stopPropagation(); setDetailTemplate(t); setIsDetailModalOpen(true); }}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title="View Details"
          >
            <Award size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setEditTemplate(t); setEditName(t.name); setIsEditModalOpen(true); }}
            className="p-2 rounded-lg text-gray-400 hover:text-brand-navy hover:bg-blue-50 transition-all"
            title="Edit"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(t); }}
            className={`p-2 rounded-lg transition-all ${t.enabled ? 'text-emerald-500 hover:text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
            title={t.enabled ? 'Disable' : 'Enable'}
          >
            {t.enabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(t); setIsDeleteModalOpen(true); }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <Toast
        isVisible={toast.show}
        onClose={() => setToast(t => ({ ...t, show: false }))}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
      />

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
            <Upload size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Upload Template</h2>
            <p className="text-xs text-gray-400 font-medium">Upload a .docx file with {'{{placeholders}}'} to create a new certificate template</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
              ${isDragging
                ? 'border-purple-400 bg-purple-50/50 scale-[1.01]'
                : uploadFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/20'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            {uploadFile ? (
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle size={20} className="text-emerald-500" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{uploadFile.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    {(uploadFile.size / 1024).toFixed(1)} KB — Ready to upload
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null); setUploadName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-500">Drop .docx file here or click to browse</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Max file size: 10MB</p>
              </div>
            )}
          </div>

          {/* Name + Submit */}
          <div className="w-[300px] space-y-3">
            <div>
              <label className="block ml-1 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Template Name</label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g. Course Completion Certificate"
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-purple-500/5 focus:border-purple-400 outline-none transition-all text-sm font-medium text-gray-700 placeholder:text-gray-300"
              />
            </div>
            <Button
              onClick={handleUpload}
              isLoading={isUploading}
              className="w-full rounded-xl h-12 bg-brand-navy hover:bg-brand-navy/90 text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-brand-navy/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              disabled={!uploadFile || !uploadName.trim()}
            >
              <Plus size={16} />
              Upload Template
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-navy transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-brand-navy outline-none transition-all text-sm font-medium text-gray-700 placeholder:text-gray-300 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as string)}
            options={[
              { label: 'All Templates', value: 'all' },
              { label: 'Active Only', value: 'active' },
              { label: 'Inactive Only', value: 'inactive' },
            ]}
            placeholder="Filter by status"
          />
        </div>
      </motion.div>

      {/* Templates Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <Table data={templates} columns={columns} isLoading={isLoading} />
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setDetailTemplate(null); }}
        title="Template Details"
        size="md"
      >
        {detailTemplate && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 border border-purple-100">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{detailTemplate.name}</h3>
                <p className="text-xs text-gray-400 font-medium">
                  Uploaded {new Date(detailTemplate.createdAt).toLocaleDateString()} by {detailTemplate.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Detected Placeholders</h4>
              {detailTemplate.placeholders?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detailTemplate.placeholders.map((p) => (
                    <span
                      key={p}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        SPECIAL_PLACEHOLDERS.includes(p)
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      {`{{${p}}}`}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No placeholders detected</p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Status: <span className={detailTemplate.enabled ? 'text-emerald-600' : 'text-red-500'}>{detailTemplate.enabled ? 'Active' : 'Inactive'}</span></span>
                <span>{detailTemplate.placeholders?.length || 0} placeholders found</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Template"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block ml-1 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Template Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-brand-navy outline-none transition-all text-sm font-medium text-gray-700"
            />
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 rounded-xl h-14 uppercase font-black tracking-widest text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              isLoading={isSavingEdit}
              className="flex-1 rounded-xl h-14 bg-brand-navy text-white shadow-xl shadow-brand-navy/20 uppercase font-black tracking-[0.2em] text-xs"
              disabled={!editName.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
        title=""
        size="md"
        noScroll
      >
        <ConfirmationCard
          variant="danger"
          title="Delete Template"
          description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          icon={<Trash2 size={32} />}
          confirmLabel="Delete Template"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
          isLoading={isDeleting}
        />
      </Modal>
    </div>
  );
}
