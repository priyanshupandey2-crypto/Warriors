'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between gap-md flex-wrap">
        <div className="flex-1">
          <h1 className="text-display-lg-mobile md:text-headline-lg text-on-background  tracking-tight">{title}</h1>
          {subtitle && <p className="text-body-lg text-on-surface-variant mt-sm">{subtitle}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}
