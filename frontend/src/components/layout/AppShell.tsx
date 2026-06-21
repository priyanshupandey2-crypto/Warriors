'use client';

import { ReactNode, useState } from 'react';
import { Header, HeaderProps } from './Header';
import { Sidebar, SidebarProps } from './Sidebar';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  children: ReactNode;
  headerProps?: HeaderProps;
  sidebarProps?: SidebarProps;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export function AppShell({
  children,
  headerProps = {},
  sidebarProps = { items: [] },
  showSidebar = true,
  showHeader = true,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          {...sidebarProps}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={cn('flex-1 flex flex-col overflow-hidden')}>
        {/* Header */}
        {showHeader && (
          <Header
            {...headerProps}
            actions={
              <div className="flex items-center gap-md">
                {showSidebar && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-sm hover:bg-surface-container-low rounded-lg transition-colors duration-200"
                  >
                    ☰
                  </button>
                )}
                {headerProps.actions}
              </div>
            }
          />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-gutter py-xl max-w-container-max mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
