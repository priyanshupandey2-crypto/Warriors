'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  min?: number;
  max?: number;
  value?: number | string;
  onChange?: (value: number) => void;
  showValue?: boolean;
}

const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  ({ className, label, min = 0, max = 100, value, onChange, showValue = true, ...props }, ref) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : (value || min);

    return (
      <div className="w-full space-y-sm">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-label-md font-medium text-on-surface">{label}</label>
            {showValue && <span className="text-label-md font-bold text-primary">{numValue}</span>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={numValue}
          onChange={(e) => onChange?.(parseInt(e.target.value, 10))}
          className={cn(
            'w-full h-2 rounded-lg bg-surface-container appearance-none cursor-pointer',
            'accent-primary',
            'focus:outline-none focus-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {!label && showValue && (
          <div className="text-right">
            <span className="text-label-sm text-on-surface-variant">{numValue}</span>
          </div>
        )}
      </div>
    );
  }
);

RangeSlider.displayName = 'RangeSlider';

export { RangeSlider };
