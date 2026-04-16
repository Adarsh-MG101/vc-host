'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Award, 
  Search, 
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export default function PublicVerifyPage() {
  const [certId, setCertId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    
    setIsSearching(true);
    // Navigate to the verification result page
    router.push(`/verify/${certId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 selection:bg-brand-orange/20 selection:text-brand-orange overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-orange/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-navy/5 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col md:flex-row items-center gap-16">
        
        {/* Left Side: Branding & Info */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-orange-100"
          >
            <ShieldCheck className="text-brand-orange" size={20} />
            <span className="text-[10px] font-black text-brand-navy uppercase tracking-[0.3em]">Institutional Verification</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-black text-brand-navy tracking-tighter leading-[0.9] italic animate-in fade-in slide-in-from-bottom-4 duration-700">
              Verify <span className="text-brand-orange">Authenticity</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-md mx-auto md:mx-0 leading-relaxed">
              Instantly validate any document issued through the VerifyCert protocol. 
              Our signature verification ensures document integrity and tamper-proof security.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 hidden md:grid"
          >
            {[
              { icon: <Shield size={16} />, text: 'Tamper-Proof' },
              { icon: <Clock size={16} />, text: 'Real-time' },
              { icon: <CheckCircle2 size={16} />, text: 'Authorized' },
              { icon: <Award size={16} />, text: 'Recognized' }
            ].map((f, i) => (
              <div key={i} className="flex items-center space-x-2 text-gray-400">
                <div className="text-brand-orange">{f.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest">{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Verification Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[40px] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] border border-white p-10 relative">
            <div className="absolute top-0 right-10 w-20 h-20 bg-brand-orange/5 rounded-full blur-2xl -z-10" />
            
            <form onSubmit={handleVerify} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Search size={14} className="text-brand-orange" />
                  Enter Document Signature ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-orange scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
                  <input 
                    type="text"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value.toUpperCase())}
                    placeholder="CERT-2026-XXXXX"
                    className="w-full bg-gray-50/50 border-b-2 border-gray-100 px-6 py-8 text-xl font-mono font-bold text-brand-navy outline-none placeholder:text-gray-200 transition-all uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit"
                  isLoading={isSearching}
                  disabled={!certId.trim()}
                  className="w-full h-16 rounded-[24px] bg-brand-navy hover:bg-brand-navy/90 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-navy-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                >
                  Verify Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-[9px] text-gray-400 font-medium text-center italic italic">
                  * Case insensitive. Document ID can be found at the bottom of your certificate.
                </p>
              </div>
            </form>
          </div>

          {/* External verification hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center space-x-3 text-gray-300"
          >
            <Award size={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Secure Institutional Authority</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating security label */}
      <div className="fixed bottom-10 left-10 hidden lg:block">
        <div className="flex items-center space-x-3 opacity-20 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700">
           <Shield size={24} className="text-emerald-600" />
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest leading-none">Powered by</span>
             <span className="text-xs font-black text-brand-orange tracking-tight uppercase leading-none mt-1">VerifyCert Protocol</span>
           </div>
        </div>
      </div>
    </div>
  );
}
