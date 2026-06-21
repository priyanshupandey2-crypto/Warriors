'use client';

import { ReactNode } from 'react';
import { Card, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  icon: string | ReactNode;
  label: string;
  value: string | number;
  iconColor?: 'primary' | 'secondary' | 'tertiary' | 'error';
}

const iconColorMap = {
  primary: 'bg-primary-container/20 text-primary',
  secondary: 'bg-secondary-container/20 text-secondary',
  tertiary: 'bg-tertiary-container/20 text-tertiary',
  error: 'bg-error-container/20 text-error',
};

export function StatsCard({ icon, label, value, iconColor = 'primary' }: StatsCardProps) {
  return (
    <Card variant="elevated" className="flex items-center gap-md">
      <div className={cn('p-md rounded-lg flex items-center justify-center', iconColorMap[iconColor])}>
        {typeof icon === 'string' ? (
          <Icon name={icon as any} size={24} />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1">
        <p className="text-label-sm uppercase tracking-wider text-outline">{label}</p>
        <p className="text-headline-md font-bold text-on-surface">{value}</p>
      </div>
    </Card>
  );
}
