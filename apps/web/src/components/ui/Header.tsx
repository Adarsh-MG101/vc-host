import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  hideNav?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ hideNav = false }) => {
  return (
    <header className="w-full px-8 py-4 flex items-center bg-white border-b border-gray-100 backdrop-blur-xl z-[100] transition-all duration-300">
      <Link href="/" className="flex items-center space-x-4 group">
        <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-md border border-brand-orange/10 group-hover:shadow-lg transition-all transform group-hover:scale-105 duration-300">
          <Image 
            src="/vc logo.jpeg" 
            alt="VerifyCerts Logo" 
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-black text-brand-orange tracking-tighter uppercase leading-none">
            VerifyCerts
          </span>
          <span className="text-[8px] font-bold text-brand-navy uppercase tracking-[0.3em] mt-1.5 shrink-0">
            Secure & Reliable
          </span>
        </div>
      </Link>
      
      {!hideNav && (
        <div className="ml-auto flex items-center space-x-10">
          
          
         
        </div>
      )}
    </header>
  );
};





