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
        'bg-surface-container-lowest border-b border-surface-container',
        'flex items-center px-gutter py-md gap-xl max-w-container-max mx-auto w-full',
        sticky && 'sticky top-0 z-40 shadow-sm'
      )}
    >
      {/* Logo & Brand */}
      <div className="flex items-center gap-md">
        {logo && <div className="text-xl">{logo}</div>}
        {brand && <span className="text-headline-md font-bold text-primary">{brand}</span>}
      </div>

      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className="hidden md:flex gap-lg">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-body-md font-medium transition-fast',
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
