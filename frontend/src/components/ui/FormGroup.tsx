import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn('space-y-md', className)}>{children}</div>;
}
