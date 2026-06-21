'use client';

import { cn } from '@/lib/utils';

interface AudienceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const audienceOptions = [
  {
    id: 'professionals',
    label: 'Professionals',
    description: 'Career-focused learners looking to advance their skills',
    icon: '💼',
  },
  {
    id: 'students',
    label: 'Students & Learners',
    description: 'Academic or self-directed learners building foundational knowledge',
    icon: '🎓',
  },
  {
    id: 'enthusiasts',
    label: 'Hobbyists & Enthusiasts',
    description: 'Passionate learners exploring a topic out of personal interest',
    icon: '⚡',
  },
];

export function AudienceSelector({ value, onChange, error, disabled }: AudienceSelectorProps) {
  return (
    <div className="space-y-md">
      <div>
        <label className="block text-headline-md font-semibold text-on-background mb-sm">
          Who will you teach?
        </label>
        <p className="text-body-sm text-on-surface-variant">
          This shapes the pace, depth, and examples we'll generate.
        </p>
      </div>

      <div className="space-y-sm">
        {audienceOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            disabled={disabled}
            type="button"
            className={cn(
              'w-full p-md rounded-lg border-2 transition-all text-left space-y-xs',
              value === option.id
                ? 'border-primary bg-primary/5'
                : 'border-surface-container hover:border-surface-container-high',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-start gap-md">
              <span className="text-headline-md flex-shrink-0">{option.icon}</span>
              <div className="flex-1">
                <h4 className="text-body-md font-semibold text-on-surface">{option.label}</h4>
                <p className="text-label-sm text-on-surface-variant">{option.description}</p>
              </div>
              {value === option.id && (
                <span className="text-primary font-bold mt-xs flex-shrink-0">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  );
}
