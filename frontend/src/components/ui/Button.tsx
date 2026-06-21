import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container',
  tertiary: 'bg-tertiary text-on-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container',
  outline: 'border-2 border-outline-variant text-on-surface hover:border-primary hover:text-primary',
  ghost: 'text-on-surface hover:bg-surface-container-low',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-sm py-xs text-label-sm',
  md: 'px-md py-sm text-label-md',
  lg: 'px-lg py-md text-body-md',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      loading = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-fast active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-ring',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="animate-spin">⟳</span>}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
