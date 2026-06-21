import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  divider?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  divider = false,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-md', className)}>
      <div className="flex-1">
        <h2 className="text-headline-lg text-on-background font-bold">{title}</h2>
        {subtitle && <p className="text-body-md text-on-surface-variant mt-sm">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {divider && <div className="h-px bg-surface-container mt-md" />}
    </div>
  );
}
