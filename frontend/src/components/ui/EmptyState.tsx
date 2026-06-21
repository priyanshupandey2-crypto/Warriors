'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface EmptyStateProps {
  icon: string | ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Card variant="elevated" className="p-2xl text-center space-y-md">
      {typeof icon === 'string' ? (
        <div className="text-5xl flex justify-center">{icon}</div>
      ) : (
        <div className="flex justify-center">{icon}</div>
      )}
      <div className="space-y-sm">
        <h2 className="text-headline-md text-on-surface font-bold">{title}</h2>
        <p className="text-body-md text-on-surface-variant">{message}</p>
      </div>
      {action && <div className="pt-md">{action}</div>}
    </Card>
  );
}
