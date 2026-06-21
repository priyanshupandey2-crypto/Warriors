'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type LoaderSize = 'sm' | 'md' | 'lg';
type LoaderVariant = 'primary' | 'secondary' | 'on-surface';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoaderSize;
  variant?: LoaderVariant;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const variantClasses: Record<LoaderVariant, string> = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  'on-surface': 'border-on-surface',
};

const Loader = forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 'md', variant = 'primary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-block rounded-full border-2 border-t-transparent animate-spin',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Loader.displayName = 'Loader';

export { Loader };
