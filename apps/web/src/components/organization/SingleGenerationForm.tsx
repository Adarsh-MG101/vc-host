import { useState, useMemo } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SingleGenerationFormProps {
  templates: any[];
  onGenerate: (data: any) => void;
  isLoading: boolean;
}

export const SingleGenerationForm: React.FC<SingleGenerationFormProps> = ({ templates, onGenerate, isLoading }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [sendEmail, setSendEmail] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    recipientEmail: '',
    subject: 'Your Certificate',
    message: 'Please find your certificate attached.',
  });

  const selectedTemplate = useMemo(() => 
    templates.find(t => t._id === selectedTemplateId), 
    [selectedTemplateId, templates]
  );

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailSettingsChange = (key: string, value: string) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      templateId: selectedTemplateId,
      data: formValues,
      sendEmail,
      emailSettings: sendEmail ? emailSettings : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Template Selection */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-brand-orange border border-orange-100">
            <Check size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Step 1: Select Template</h3>
            <p className="text-xs text-gray-400 font-medium tracking-wide">Choose the certificate layout you want to use</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div 
              key={t._id}
              onClick={() => setSelectedTemplateId(t._id)}
              className={`
                cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 relative group overflow-hidden
                ${selectedTemplateId === t._id 
                  ? 'border-brand-orange bg-orange-50/30 ring-4 ring-orange-500/5 shadow-lg' 
                  : 'border-gray-50 bg-gray-50/30 hover:border-gray-200 hover:bg-white hover:shadow-md'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 leading-none">{t.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {t.placeholders?.length || 0} Placeholders
                  </p>
                </div>
                {selectedTemplateId === t._id && (
                  <div className="bg-brand-orange text-white p-1 rounded-full">
                    <Check size={14} />
                  </div>
                )}
              </div>
              {selectedTemplateId === t._id && t.placeholders?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {t.placeholders.map((p: string) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Placeholder Form */}
      <AnimatePresence mode="wait">
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-brand-navy border border-blue-100">
                <ArrowRight size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Step 2: Certificate Data</h3>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Fill in the placeholders for this template</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTemplate.placeholders.map((p: string) => (
                <Input
                  key={p}
                  label={p.replace(/_/g, ' ')}
                  placeholder={`Enter ${p.toLowerCase()}`}
                  value={formValues[p] || ''}
                  onChange={(e) => handleInputChange(p, e.target.value)}
                  required
                />
              ))}
            </div>

            {/* Email Settings Toggle */}
            <div className="pt-6 border-t border-gray-50 space-y-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div 
                  onClick={() => setSendEmail(!sendEmail)}
                  className={`
                    w-12 h-6 rounded-full transition-all duration-300 relative
                    ${sendEmail ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-200'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
                    ${sendEmail ? 'left-7 shadow-sm' : 'left-1'}
                  `} />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-700 tracking-tight block">Send via Email automatically</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.1em]">Sends certificate to recipient after generation</span>
                </div>
              </label>

              {sendEmail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Recipient Email"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailSettings.recipientEmail}
                      onChange={(e) => handleEmailSettingsChange('recipientEmail', e.target.value)}
                      leftIcon={<Mail size={18} />}
                      required={sendEmail}
                    />
                    <Input
                      label="Email Subject"
                      placeholder="Your Certificate"
                      value={emailSettings.subject}
                      onChange={(e) => handleEmailSettingsChange('subject', e.target.value)}
                      required={sendEmail}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block ml-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Email Message</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-900 border border-gray-100 bg-gray-50/30 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-brand-navy transition-all"
                      placeholder="Enter optional message..."
                      value={emailSettings.message}
                      onChange={(e) => handleEmailSettingsChange('message', e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full h-14 rounded-2xl shadow-xl shadow-brand-navy/10 font-black tracking-[0.2em] text-xs uppercase"
                isLoading={isLoading}
                disabled={!selectedTemplateId}
              >
                Generate Certificate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
