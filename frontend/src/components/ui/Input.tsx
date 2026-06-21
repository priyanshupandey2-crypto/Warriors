'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full space-y-xs">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label-md font-medium text-on-surface"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-md py-sm rounded-lg border border-outline-variant',
            'bg-surface text-on-surface placeholder-on-surface-variant',
            'focus:border-primary focus:outline-none focus:shadow-sm focus-ring',
            'transition-colors duration-200',
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

Input.displayName = 'Input';

export { Input };
