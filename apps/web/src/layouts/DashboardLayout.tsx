'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/ui/Sidebar';
import { SuperadminTopBar } from '../components/ui/SuperadminTopBar';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Universal Dashboard Layout used across both Organization and Superadmin portals.
 * Handles cohesive side navigation, top status bar, and page transition animations.
 */
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <SuperadminTopBar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-10 px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
