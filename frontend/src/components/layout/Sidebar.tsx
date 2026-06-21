'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

export interface SidebarItem {
  href: string;
  label: string;
  icon?: string | ReactNode;
  active?: boolean;
  subItems?: Omit<SidebarItem, 'subItems'>[];
}

export interface SidebarProps {
  items: SidebarItem[];
  open?: boolean;
  onClose?: () => void;
  brand?: string;
}

export function Sidebar({ items, open = true, onClose, brand = 'AuraLearn' }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen w-64 bg-surface-container-lowest',
          'border-r border-outline-variant flex flex-col overflow-y-auto transition-transform duration-300 z-40',
          !open && '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="hidden md:block p-md border-b border-outline-variant">
          <span className="text-headline-md font-headline-md text-primary tracking-tight">{brand}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-sm py-md space-y-sm">
          {items.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-md px-md py-sm rounded-lg text-label-md transition-colors duration-200',
                  item.active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )}
              >
                {item.icon && typeof item.icon === 'string' ? (
                  <Icon name={item.icon as any} size={20} />
                ) : (
                  item.icon && <span>{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>

              {/* Sub Items */}
              {item.subItems && item.active && (
                <div className="ml-md mt-xs space-y-sm border-l-2 border-outline-variant pl-md">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        'flex items-center gap-md px-sm py-xs rounded-md text-label-sm transition-colors duration-200',
                        subItem.active
                          ? 'text-primary font-label-md'
                          : 'text-on-surface-variant hover:text-primary'
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="hidden md:block p-md border-t border-outline-variant text-center text-label-sm text-on-surface-variant">
          <p>© 2024 AuraLearn</p>
        </div>
      </aside>
    </>
  );
}
