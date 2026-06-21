'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => closeOnBackdrop && onClose()}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full mx-md rounded-xl bg-surface-container-lowest shadow-xl',
          'flex flex-col max-h-[90vh] overflow-y-auto',
          sizeMap[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-lg border-b border-surface-container sticky top-0 bg-surface-container-lowest">
            <h2 className="text-headline-md font-bold text-on-background">{title}</h2>
            <button
              onClick={onClose}
              className="p-sm text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-lg">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-lg border-t border-surface-container bg-surface-container-low flex gap-md justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
