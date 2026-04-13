'use client';

import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
