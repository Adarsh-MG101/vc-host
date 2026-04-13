'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full px-8 py-5 flex items-center bg-white border-t border-gray-100">
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
        VerifyCerts © 2026
      </div>
      <div className="ml-auto flex items-center space-x-10">
        <Link href="#" className="text-[9px] font-bold text-gray-300 hover:text-brand-navy transition-all uppercase tracking-widest">
          Security Policy
        </Link>
        <Link href="#" className="text-[9px] font-bold text-gray-300 hover:text-brand-navy transition-all uppercase tracking-widest">
          Terms of Access
        </Link>
        <Link href="#" className="text-[9px] font-bold text-gray-300 hover:text-brand-navy transition-all uppercase tracking-widest">
          Governance Support
        </Link>
      </div>
    </footer>
  );
};



