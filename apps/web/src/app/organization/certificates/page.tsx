'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Award, Search, ExternalLink, Download, Send, 
  ChevronLeft, ChevronRight, Trash2,
  Mail, Check, Upload,
  FileDown, Plus, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { certificateService, IDocument } from '../../../services/certificate.service';
import { templateService, ITemplate } from '../../../services/template.service';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationCard } from '../../../components/ui/ConfirmationCard';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import * as xlsx from 'xlsx';

type ActivePanel = null | 'single' | 'bulk';

export default function CertificatesPage() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [certificates, setCertificates] = useState<IDocument[]>([]);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<IDocument | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Single generation state
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Post-generation state
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    recipientEmail: '',
    subject: 'Your Certificate',
    message: 'Please find your certificate attached.',
  });

  // Bulk generation state
  const [bulkTemplateId, setBulkTemplateId] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [bulkMapping, setBulkMapping] = useState<Record<string, string>>({});
  const [bulkGeneratedDocs, setBulkGeneratedDocs] = useState<any[]>([]);
  const [isBulkSuccessModalOpen, setIsBulkSuccessModalOpen] = useState(false);
  const [activeSuccessType, setActiveSuccessType] = useState<'single' | 'bulk' | null>(null);
  const [filterTemplateId, setFilterTemplateId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const bulkFileRef = useRef<HTMLInputElement>(null);

  // Toast State
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', variant: 'info' as any });

  const showToast = (title: string, message: string, variant: 'success' | 'danger' | 'info' = 'info') => {
    setToast({ isVisible: true, title, message, variant });
  };

  const closeAllAndClear = () => {
    setIsSuccessModalOpen(false);
    setIsBulkSuccessModalOpen(false);
    setIsEmailModalOpen(false);
    setGeneratedDoc(null);
    setBulkGeneratedDocs([]);
    setActiveSuccessType(null);
    setEmailSettings({ recipientEmail: '', subject: 'Your Certificate', message: 'Please find your certificate attached.' });
  };

  const selectedTemplate = useMemo(() => 
    templates.find(t => t._id === selectedTemplateId), 
    [selectedTemplateId, templates]
  );

  const bulkTemplate = useMemo(() => 
    templates.find(t => t._id === bulkTemplateId), 
    [bulkTemplateId, templates]
  );

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await certificateService.getCertificates({ 
        search, 
        templateId: filterTemplateId,
        startDate,
        endDate,
        page, 
        limit: 10 
      });
      setCertificates(data.documents);
      setTotalPages(data.pages);
    } catch (err: any) {
      console.error(err);
      showToast('Error', 'Failed to load certificates', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, filterTemplateId, startDate, endDate]);

  const fetchTemplates = async () => {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchTemplates();
  }, [fetchCertificates]);

  // --- Single Generation ---
  const handleSingleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await certificateService.generateSingle({
        templateId: selectedTemplateId,
        data: formValues,
      });

      setGeneratedDoc(res.document);
      setActiveSuccessType('single');
      setIsSuccessModalOpen(true);
      showToast('Success', 'Certificate generated successfully!', 'success');
      setFormValues({});
      fetchCertificates();
    } catch (err: any) {
      showToast('Generation Failed', err.message || 'Something went wrong', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedDoc && activeSuccessType === 'single') return;
    setIsSendingEmail(true);
    try {
      if (activeSuccessType === 'bulk') {
        await certificateService.sendBulkEmail(bulkGeneratedDocs.map(d => d._id), emailSettings);
      } else {
        if (!generatedDoc) return;
        await certificateService.sendCertificateEmail(generatedDoc._id, emailSettings);
      }
      
      showToast('Success', 'Email sent successfully!', 'success');
      setIsEmailModalOpen(false);
      // Removed closing of success modals to allow further actions (download/resend)
      setEmailSettings(prev => ({ ...prev, recipientEmail: '' }));
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to send email', 'danger');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // --- Bulk CSV ---
  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || !bulkTemplate) return;
    setBulkFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(ws);
        if (data.length > 0) {
          const columns = Object.keys(data[0] as object);
          setCsvData(data);

          // Auto-mapping logic
          const mapping: Record<string, string> = {};
          bulkTemplate.placeholders.forEach(p => {
            const match = columns.find(c => 
              c.toUpperCase().trim() === p.toUpperCase().trim() ||
              c.toUpperCase().trim().replace(/ /g, '_') === p.toUpperCase().trim()
            );
            if (match) {
              mapping[p] = match;
            }
          });
          setBulkMapping(mapping);
        } else {
          showToast('Error', 'The uploaded file is empty.', 'danger');
        }
      } catch {
        showToast('Error', 'Failed to parse file.', 'danger');
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleDownloadSampleCSV = () => {
    if (!bulkTemplate) return;
    const headers = bulkTemplate.placeholders;
    const sampleRow = headers.reduce((acc: any, h: string) => {
      acc[h] = `Sample ${h.replace(/_/g, ' ').toLowerCase()}`;
      return acc;
    }, {} as Record<string, string>);
    const ws = xlsx.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Data');
    xlsx.writeFile(wb, `${bulkTemplate.name}_sample.csv`);
  };

  const handleBulkSubmit = async () => {
    if (!bulkTemplate || csvData.length === 0) return;
    setIsGenerating(true);
    try {
      // Map columns
      const mappedData = csvData.map(row => {
        const item: Record<string, any> = {};
        for (const placeholder of bulkTemplate.placeholders) {
          item[placeholder] = row[bulkMapping[placeholder]] || '';
        }
        return item;
      });

      const res = await certificateService.generateBulk({
        templateId: bulkTemplateId,
        data: mappedData,
      });

      setBulkGeneratedDocs(res.certificates || []);
      setActiveSuccessType('bulk');
      setIsBulkSuccessModalOpen(true);

      showToast('Success', `Successfully generated ${csvData.length} certificates!`, 'success');
      setActivePanel(null);
      setBulkTemplateId('');
      setBulkFile(null);
      setCsvData([]);
      setBulkMapping({});
      fetchCertificates();
    } catch (err: any) {
      showToast('Bulk Generation Failed', err.message || 'Something went wrong', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInitiateEmailShare = (doc: IDocument) => {
    setGeneratedDoc(doc);
    setActiveSuccessType('single');
    // Pre-fill email from document data if available
    const email = doc.data?.EMAIL || doc.data?.email || doc.data?.recipientEmail || '';
    setEmailSettings(prev => ({ ...prev, recipientEmail: email }));
    setIsEmailModalOpen(true);
  };

  // --- Delete ---
  const handleDeleteCertificate = (doc: IDocument) => {
    setDeleteTarget(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await certificateService.deleteCertificate(deleteTarget._id);
      showToast('Success', 'Certificate deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchCertificates();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete certificate', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };


  const columns = [
    {
      header: 'CERTIFICATE ID',
      accessor: (doc: IDocument) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-brand-orange border border-orange-100">
            <Award size={18} />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">{doc.uniqueId}</span>
        </div>
      ),
    },
    {
      header: 'RECIPIENT',
      accessor: (doc: IDocument) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-700">{doc.data.NAME || doc.data.name || 'N/A'}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.data.COURSE || doc.data.course || 'Document'}</span>
        </div>
      ),
    },
    {
      header: 'TEMPLATE',
      accessor: (doc: IDocument) => (
        <StatusBadge label={doc.template?.name || 'Deleted'} variant="gray" size="xs" />
      ),
    },
    {
      header: 'DATE',
      accessor: (doc: IDocument) => (
        <span className="text-sm font-semibold text-gray-500">
          {new Date(doc.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (doc: IDocument) => (
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-50 rounded-lg transition-all" title="View PDF"
            onClick={() => window.open(certificateService.getCertificateFileUrl(doc._id), '_blank')}>
            <ExternalLink size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-brand-orange hover:bg-gray-50 rounded-lg transition-all" title="Download"
            onClick={() => window.open(certificateService.getCertificateFileUrl(doc._id, 'download'), '_blank')}>
            <Download size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Resend Email"
            onClick={() => handleInitiateEmailShare(doc)}>
            <Send size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"
            onClick={() => handleDeleteCertificate(doc)}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
      <Toast 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
        title={toast.title} 
        message={toast.message} 
        variant={toast.variant} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center text-white shadow-xl shadow-navy-900/20">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tighter uppercase italic leading-none">Certificates</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Manage & Generate Documents</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActivePanel('single')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 bg-white text-gray-500 border-gray-100 hover:border-brand-orange hover:text-brand-orange"
          >
            <Plus size={14} />
            Single Issue
          </button>
          <button
            onClick={() => setActivePanel('bulk')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 bg-white text-gray-500 border-gray-100 hover:border-brand-navy hover:text-brand-navy"
          >
            <Upload size={14} />
            Bulk Issue
          </button>
        </div>
      </div>

      {/* MODALS */}
      
      {/* --- SINGLE ISSUE MODAL --- */}
      <Modal
        isOpen={activePanel === 'single'}
        onClose={() => setActivePanel(null)}
        title="Issue Single Certificate"
        size="lg"
        noScroll
      >
        <form onSubmit={handleSingleGenerate} className="space-y-6 p-1">
          {/* Template Select */}
          <Select
            label="Template"
            searchable
            searchPlaceholder="Search templates..."
            placeholder="Choose a template..."
            options={templates.filter(t => t.enabled).map(t => ({ label: t.name, value: t._id, meta: `${t.placeholders?.length || 0} placeholders` }))}
            value={selectedTemplateId}
            onChange={(val) => { setSelectedTemplateId(val as string); setFormValues({}); }}
          />

          {/* Dynamic Fields */}
          <AnimatePresence>
            {selectedTemplate && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.placeholders.map((p: string) => (
                    <Input
                      key={p}
                      label={p.replace(/_/g, ' ')}
                      placeholder={`Enter ${p.toLowerCase().replace(/_/g, ' ')}`}
                      value={formValues[p] || ''}
                      onChange={(e) => setFormValues(prev => ({ ...prev, [p]: e.target.value }))}
                      required
                    />
                  ))}
                </div>

                <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl shadow-lg shadow-brand-navy/10 font-black tracking-widest text-xs uppercase mt-4" isLoading={isGenerating} disabled={!selectedTemplateId}>
                  Generate Certificate
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Modal>

      {/* --- BULK ISSUE MODAL --- */}
      <Modal
        isOpen={activePanel === 'bulk'}
        onClose={() => setActivePanel(null)}
        title="Issue Bulk Certificates"
        size="xl"
        noScroll
      >
        <div className="space-y-6 p-1">
          {/* Template Select */}
          <Select
            label="Template"
            searchable
            searchPlaceholder="Search templates..."
            placeholder="Choose a template..."
            options={templates.filter(t => t.enabled).map(t => ({ label: t.name, value: t._id, meta: `${t.placeholders?.length || 0} placeholders` }))}
            value={bulkTemplateId}
            onChange={(val) => { setBulkTemplateId(val as string); setCsvData([]); setBulkFile(null); setBulkMapping({}); }}
          />

          {/* Upload & Download Sample */}
          <AnimatePresence>
            {bulkTemplate && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <input type="file" ref={bulkFileRef} className="hidden" accept=".csv,.xlsx" onChange={handleBulkFileUpload} />
                  <button
                    type="button"
                    onClick={() => bulkFileRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-4 rounded-xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-500 hover:border-brand-navy hover:text-brand-navy transition-all flex-1 text-left bg-gray-50/30"
                  >
                    <Upload size={16} />
                    {bulkFile ? bulkFile.name : 'Click to upload CSV or Excel Data File'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="flex items-center gap-2 px-5 py-4 rounded-xl border-2 border-gray-100 text-xs font-bold text-brand-orange hover:bg-orange-50 hover:border-orange-200 transition-all bg-white"
                  >
                    <FileDown size={18} />
                    Download Sample
                  </button>
                </div>

                {/* Automapping Status & Preview */}
                {csvData.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Automatic Mapping Complete</p>
                          <p className="text-[10px] font-bold text-emerald-600/70">{Object.keys(bulkMapping).length} / {bulkTemplate.placeholders.length} fields connected from {csvData.length} records</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCsvData([])}
                        className="text-[10px] font-black text-emerald-700 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Compact Preview Table */}
                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100 bg-white/50 flex items-center justify-between">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Data Preview</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100/30">
                            <tr>
                              <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">#</th>
                              {bulkTemplate.placeholders.slice(0, 4).map((p: string) => (
                                <th key={p} className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">{p}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {csvData.slice(0, 3).map((row, idx) => (
                              <tr key={idx} className="bg-white/50">
                                <td className="px-4 py-3 text-xs font-bold text-gray-300">{idx + 1}</td>
                                {bulkTemplate.placeholders.slice(0, 4).map((p: string) => (
                                  <td key={p} className="px-4 py-3 text-xs font-semibold text-gray-600 truncate max-w-[120px]">{row[bulkMapping[p]] || '—'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {csvData.length > 3 && (
                        <div className="px-4 py-2 text-center bg-white/30 border-t border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic text-gray-400">Showing 3 of {csvData.length} records</p>
                        </div>
                      )}
                    </div>

                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="w-full h-16 rounded-2xl shadow-xl shadow-brand-navy/20 font-black tracking-widest text-xs uppercase"
                      onClick={handleBulkSubmit}
                      isLoading={isGenerating}
                      disabled={!bulkTemplate.placeholders.every((p: string) => !!bulkMapping[p])}
                    >
                      Process & Issue {csvData.length} Certificates
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Template Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Template Filter</label>
            <Select
              placeholder="All Templates"
              options={[{ label: 'All Templates', value: 'all' }, ...templates.map(t => ({ label: t.name, value: t._id }))]}
              value={filterTemplateId}
              onChange={(val) => setFilterTemplateId(val as string)}
              className="!space-y-0"
            />
          </div>

          {/* Date From */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date</label>
            <CustomDatePicker 
              value={startDate} 
              onChange={setStartDate} 
              placeholder="Pick Start Date" 
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date</label>
            <CustomDatePicker 
              value={endDate} 
              onChange={setEndDate} 
              placeholder="Pick End Date" 
            />
          </div>

          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Records</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" size={16} />
              <input 
                type="text"
                placeholder="ID, Name..."
                className="w-full pl-11 pr-6 py-3.5 bg-white border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-brand-orange transition-all text-xs font-bold shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Clear */}
        {(filterTemplateId !== 'all' || startDate || endDate || search) && (
          <div className="pt-2 flex items-center justify-end">
             <button 
              onClick={() => { setFilterTemplateId('all'); setStartDate(''); setEndDate(''); setSearch(''); setPage(1); }}
              className="text-[10px] font-black text-gray-300 hover:text-brand-orange uppercase tracking-[0.2em] transition-colors"
             >
                Clear All Filters
             </button>
          </div>
        )}
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/20 overflow-hidden">
        <Table data={certificates} columns={columns} isLoading={isLoading} />
        
        {certificates.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-xl">
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="rounded-xl">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

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
          title="Delete Certificate"
          description={`Are you sure you want to delete certificate "${deleteTarget?.uniqueId}"? This action cannot be undone.`}
          icon={<Trash2 size={32} />}
          confirmLabel="Delete Certificate"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
          isLoading={isDeleting}
        />
      </Modal>

      {/* Success Modal — Post Generation */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={closeAllAndClear}
        title=""
        size="md"
        noScroll
      >
        <div className="text-center space-y-6 p-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-4 border-emerald-100">
            <Check size={40} strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-brand-navy tracking-tighter">Certificate Generated</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{generatedDoc?.uniqueId}</p>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                if (generatedDoc) {
                  window.open(certificateService.getCertificateFileUrl(generatedDoc._id, 'download'), '_blank');
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-brand-navy text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-navy-900/20 hover:bg-brand-navy/90 active:scale-[0.98] transition-all"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:border-brand-orange hover:text-brand-orange hover:bg-orange-50/30 active:scale-[0.98] transition-all"
            >
              <Mail size={18} />
              Send via Email
            </button>
          </div>
            <button
              onClick={closeAllAndClear}
              className="flex-1 h-14 rounded-2xl border border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </button>
        </div>
      </Modal>

      {/* Email Send Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Send Certificate via Email"
        size="md"
      >
        <div className="space-y-5 p-2">
          <Input label="Recipient Email" type="email" placeholder="recipient@example.com" value={emailSettings.recipientEmail} onChange={(e) => setEmailSettings(s => ({ ...s, recipientEmail: e.target.value }))} leftIcon={<Mail size={16} />} required />
          <Input label="Subject" placeholder="Your Certificate" value={emailSettings.subject} onChange={(e) => setEmailSettings(s => ({ ...s, subject: e.target.value }))} required />
          <div className="space-y-1.5">
            <label className="block ml-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 text-sm font-medium text-gray-900 border border-gray-100 bg-gray-50/30 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-brand-navy transition-all"
              placeholder="Enter optional message..."
              value={emailSettings.message}
              onChange={(e) => setEmailSettings(s => ({ ...s, message: e.target.value }))}
            />
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="ghost" onClick={() => setIsEmailModalOpen(false)} className="flex-1 h-12 rounded-xl font-black tracking-widest text-[10px] uppercase text-gray-400">
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSendEmail} isLoading={isSendingEmail} disabled={!emailSettings.recipientEmail} className="flex-1 h-12 rounded-xl shadow-lg shadow-brand-navy/10 font-black tracking-widest text-xs uppercase">
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Success Modal */}
      <Modal
        isOpen={isBulkSuccessModalOpen}
        onClose={closeAllAndClear}
        title="Batch Ready"
        size="md"
      >
        <div className="flex flex-col items-center text-center px-4 py-8 space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-2">
            <Check size={40} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-brand-navy mb-1 tracking-tight">Bulk Issuance Success!</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{bulkGeneratedDocs.length} Certificates Generated</p>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium max-w-xs mx-auto">
              Your certificates are ready. You can download the entire batch as a ZIP file or view them in the dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => {
                const ids = bulkGeneratedDocs.map(d => d._id);
                if (ids.length > 0) {
                  window.open(certificateService.getBulkZipUrl(ids), '_blank');
                }
              }}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-brand-navy text-white rounded-2xl shadow-xl shadow-brand-navy/20 font-black tracking-widest text-xs uppercase hover:bg-blue-900 active:scale-95 transition-all"
            >
              <Archive size={18} />
              Download ZIP Archive
            </button>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-orange-100 text-brand-orange rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-orange-50 transition-all"
            >
              <Mail size={18} />
              Send Batch via Email
            </button>
            <button
              onClick={closeAllAndClear}
              className="flex items-center justify-center gap-2 px-8 py-5 border border-gray-100 text-gray-400 rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
