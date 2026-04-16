'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Calendar, 
  ShieldCheck, 
  Building2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verificationService, IVerificationResult } from '../../../services/verification.service';

export default function VerifyIdPage() {
  const { id } = useParams();
  const [result, setResult] = useState<IVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      verificationService.verify(id as string)
        .then(setResult)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
          <p className="text-sm font-black text-brand-navy uppercase tracking-[0.3em] animate-pulse">Verifying Signature...</p>
        </div>
      </div>
    );
  }

  const isVerified = result?.verified;
  const cert = result?.certificate;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 selection:bg-brand-orange/20 selection:text-brand-orange">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-orange/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-navy/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[40px] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden"
      >
        {/* Verification Status Header */}
        <div className={`p-10 text-center relative ${isVerified ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="inline-flex relative mb-6"
          >
            {isVerified ? (
              <>
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-xl border-4 border-emerald-50 relative z-10">
                  <ShieldCheck size={48} strokeWidth={2.5} />
                </div>
              </>
            ) : (
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl border-4 border-red-50 relative z-10">
                <XCircle size={48} strokeWidth={2.5} />
              </div>
            )}
          </motion.div>

          <h1 className={`text-4xl font-black tracking-tighter uppercase italic ${isVerified ? 'text-emerald-700' : 'text-red-700'}`}>
            {isVerified ? 'Certificate Verified' : 'Invalid Document'}
          </h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-3">
            {isVerified ? 'Blockchain-Secured Authenticity' : 'Authentication Failed'}
          </p>
        </div>

        {/* Certificate Content */}
        <div className="p-10 pt-8 space-y-10">
          <AnimatePresence mode="wait">
            {isVerified && cert ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                {/* Main Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Award size={14} className="text-brand-orange" />
                      Issued To
                    </label>
                    <p className="text-2xl font-black text-brand-navy tracking-tight">{cert.recipient}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-brand-orange" />
                      Issue Date
                    </label>
                    <p className="text-lg font-bold text-gray-700">
                      {new Date(cert.issuedAt).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Organization Card */}
                <div className="bg-gray-50/80 rounded-[24px] p-6 border border-gray-100/50 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-50 p-2 group-hover:scale-105 transition-transform duration-500">
                      {cert.organization.logo ? (
                        <img 
                          src={cert.organization.logo} 
                          alt={cert.organization.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 size={32} className="text-brand-navy opacity-20" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-brand-navy tracking-tight leading-tight">{cert.organization.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Authorized Issuer</p>
                    </div>
                  </div>
                  <CheckCircle size={28} className="text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Metadata Grid */}
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Signature ID</span>
                      <p className="text-xs font-mono font-bold text-brand-navy bg-gray-50 px-2 py-1 rounded-md w-fit">
                        {cert.uniqueId}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Document Type</span>
                      <p className="text-xs font-bold text-gray-600">{cert.templateName}</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8 py-4"
              >
                <div className="max-w-xs mx-auto space-y-4">
                  <p className="text-gray-500 font-medium leading-relaxed">
                    We couldn't find any digital record matching the signature 
                    <span className="font-bold text-brand-navy mx-1">"{id}"</span>. 
                    This could be due to a revoked document or an invalid verification link.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                    Security Warning: Do not trust unverified documents
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security Footer */}
        <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center space-x-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Verified by VerifyCert Protocol</span>
        </div>
      </motion.div>
    </div>
  );
}
