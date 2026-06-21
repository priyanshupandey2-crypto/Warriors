'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: ReactNode; disabled?: boolean }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options = [], children, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full space-y-xs">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-label-md font-medium text-on-surface"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-md py-sm rounded-lg border-2 border-outline-variant',
            'bg-surface text-on-surface',
            'focus:border-primary focus:outline-none focus-ring',
            'transition-fast appearance-none cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error',
            className
          )}
          {...props}
        >
          {options.length > 0 ? (
            options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        {(error || helperText) && (
          <p className={cn('text-label-sm', error ? 'text-error' : 'text-on-surface-variant')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
