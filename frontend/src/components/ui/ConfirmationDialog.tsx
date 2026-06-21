'use client';

import { ReactNode } from 'react';
import { Button, Card } from '@/components/ui';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmationDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
      <Card variant="elevated" className="max-w-md w-full space-y-lg">
        <div className="space-y-sm">
          <h3 className="text-headline-md text-on-background font-bold">{title}</h3>
          <p className="text-body-md text-on-surface-variant">{message}</p>
        </div>

        {children && <div>{children}</div>}

        <div className="flex gap-md">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="lg"
            fullWidth
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
