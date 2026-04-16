import { useState, useRef, useMemo } from 'react';
import { Check, Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import * as xlsx from 'xlsx';

/**
 * Multi-step form for generating certificates in bulk from CSV/Excel
 */
interface BulkGenerationFormProps {
  templates: any[];
  onGenerate: (data: any) => void;
  isLoading: boolean;
}

export const BulkGenerationForm: React.FC<BulkGenerationFormProps> = ({ templates, onGenerate, isLoading }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTemplate = useMemo(() => 
    templates.find(t => t._id === selectedTemplateId), 
    [selectedTemplateId, templates]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json(ws);
        
        if (data.length > 0) {
          setCsvData(data);
          setColumns(Object.keys(data[0] as object));
          setStep(3);
        } else {
          alert('The uploaded file is empty.');
        }
      } catch (err) {
        alert('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleMappingChange = (placeholder: string, column: string) => {
    setMapping(prev => ({ ...prev, [placeholder]: column }));
  };

  const isMappingComplete = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.placeholders.every((p: string) => !!mapping[p]);
  };

  const handleSubmit = () => {
    onGenerate({
      templateId: selectedTemplateId,
      data: csvData,
      mapping
    });
  };

  return (
    <div className="space-y-8 min-h-[400px]">
      {/* Steps Progress */}
      <div className="flex items-center justify-between mb-12 px-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-500
              ${step >= s ? 'bg-brand-orange text-white shadow-lg shadow-orange-500/20 scale-110' : 'bg-white border-2 border-gray-100 text-gray-300'}
            `}
          >
            {step > s ? <Check size={18} /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-xl font-black text-brand-navy tracking-tight">Select Template</h3>
              <p className="text-sm text-gray-400 font-medium">Choose a template for your bulk certificates</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(t => (
                <div 
                  key={t._id}
                  onClick={() => { setSelectedTemplateId(t._id); setStep(2); }}
                  className={`
                    cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300
                    ${selectedTemplateId === t._id ? 'border-brand-orange bg-orange-50/30 shadow-lg' : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'}
                  `}
                >
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t.placeholders?.length} Placeholders</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-brand-orange mx-auto">
              <Upload size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-brand-navy tracking-tight">Upload Data File</h3>
              <p className="text-sm text-gray-400 font-medium">Upload .csv or .xlsx file with recipient data</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.xlsx" 
              onChange={handleFileUpload} 
            />
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()}
              className="px-10 h-14 rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              Choose File
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8"
          >
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Map Data Columns</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{file?.name} — {csvData.length} Rows</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setStep(2)} className="text-red-500 hover:bg-red-50">
                Change File
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {selectedTemplate?.placeholders.map((p: string) => (
                <div key={p} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{p}</label>
                    {mapping[p] && <Check size={14} className="text-emerald-500" />}
                  </div>
                  <Select
                    options={columns.map(c => ({ label: c, value: c }))}
                    value={mapping[p] || ''}
                    onChange={(val) => handleMappingChange(p, val as string)}
                    placeholder="Map to column..."
                  />
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-end">
              <Button 
                variant="primary" 
                size="lg" 
                disabled={!isMappingComplete()}
                onClick={() => setStep(4)}
                className="px-12 h-14 rounded-2xl shadow-xl shadow-brand-orange/20 font-black tracking-widest text-xs uppercase"
              >
                Preview & Confirm
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">Confirm Generation</h3>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">You are about to generate {csvData.length} certificates</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{selectedTemplate?.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selected Template</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-brand-navy rounded-xl flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
                      {selectedTemplate?.placeholders.slice(0, 3).map((p: string) => (
                        <th key={p} className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{p}</th>
                      ))}
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                        {selectedTemplate?.placeholders.slice(0, 3).map((p: string) => (
                          <td key={p} className="px-6 py-4 font-semibold text-gray-700">{row[mapping[p]]}</td>
                        ))}
                        <td className="px-6 py-4 text-xs italic text-gray-400">Preview</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 5 && (
                  <div className="px-6 py-4 bg-white/50 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">And {csvData.length - 5} more rows...</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                  onClick={() => setStep(3)}
                >
                  Back to Mapping
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-[2] h-14 rounded-2xl shadow-xl shadow-brand-navy/20 font-black tracking-widest text-xs uppercase"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                >
                  Start Generation ({csvData.length} records)
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
