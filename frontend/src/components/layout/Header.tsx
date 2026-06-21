'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  logo?: ReactNode;
  brand?: string;
  navigation?: Array<{ href: string; label: string; active?: boolean }>;
  actions?: ReactNode;
  sticky?: boolean;
}

export function Header({
  logo,
  brand = 'AuraLearn',
  navigation = [],
  actions,
  sticky = true,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'bg-surface-container-lowest',
        'flex items-center px-gutter py-md gap-xl max-w-container-max mx-auto w-full h-16',
        sticky && 'fixed top-0 left-0 right-0 z-50 shadow-[0_12px_16px_rgba(0,0,0,0.04)]'
      )}
    >
      {/* Logo & Brand */}
      <div className="flex items-center gap-md">
        {logo && <div className="text-xl">{logo}</div>}
        {brand && <span className="text-headline-md font-headline-md text-primary tracking-tight">{brand}</span>}
      </div>

      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className="hidden md:flex gap-md font-body-md text-body-md">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors duration-200',
                item.active
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      {actions && <div className="flex items-center gap-md">{actions}</div>}
    </header>
  );
}
