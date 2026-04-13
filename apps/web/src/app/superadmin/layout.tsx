'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '../../components/ui/Header';
import { Footer } from '../../components/ui/Footer';

import { DashboardLayout } from '../../layouts/DashboardLayout';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/superadmin/super-login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header hideNav={true} />
        <main className="flex-1 flex items-center justify-center p-6 bg-gray-50/20">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}