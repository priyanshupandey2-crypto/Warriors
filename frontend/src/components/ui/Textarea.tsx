'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full space-y-xs">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-label-md font-medium text-on-surface"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-md py-sm rounded-lg border-2 border-outline-variant',
            'bg-surface text-on-surface placeholder-on-surface-variant',
            'focus:border-primary focus:outline-none focus-ring',
            'transition-fast resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn('text-label-sm', error ? 'text-error' : 'text-on-surface-variant')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
