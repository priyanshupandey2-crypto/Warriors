'use client';

import { Input } from '@/components/ui';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search courses by title or topic...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-lg pr-lg"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors text-lg"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
