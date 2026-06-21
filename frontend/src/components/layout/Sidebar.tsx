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
          'fixed md:sticky top-0 left-0 h-screen w-64 bg-surface-container-lowest border-r border-surface-container',
          'flex flex-col overflow-y-auto transition-transform duration-300 z-40',
          !open && '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-lg border-b border-surface-container">
          <span className="text-headline-md font-bold text-primary">{brand}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-md space-y-xs">
          {items.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-md px-md py-sm rounded-lg transition-fast text-body-md font-medium',
                  item.active
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
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
                <div className="ml-lg mt-xs space-y-xs border-l-2 border-surface-container">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        'flex items-center gap-md px-md py-sm rounded-lg transition-fast text-label-md',
                        subItem.active
                          ? 'text-primary font-bold'
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
        <div className="p-md border-t border-surface-container text-center text-label-sm text-on-surface-variant">
          <p>© 2024 AuraLearn</p>
        </div>
      </aside>
    </>
  );
}
