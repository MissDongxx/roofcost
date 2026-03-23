'use client';

import { useEffect, useState } from 'react';
import { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';

import { Sidebar } from './sidebar';

export function DashboardLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: SidebarType;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 14)',
        } as React.CSSProperties
      }
    >
      {mounted && sidebar && (
        <Sidebar variant={sidebar.variant || 'inset'} sidebar={sidebar} />
      )}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
