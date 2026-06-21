'use client';

import { Input } from '@/components/ui';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const topicExamples = [
  'Machine Learning',
  'Web Design',
  'Product Management',
  'Data Science',
  'Cloud Architecture',
];

export function TopicInput({ value, onChange, error, disabled }: TopicInputProps) {
  return (
    <div className="space-y-md">
      <div>
        <label className="block text-headline-md font-semibold text-on-background mb-sm">
          What do you want to teach?
        </label>
        <p className="text-body-sm text-on-surface-variant mb-lg">
          This is the spark. We'll transform it into a complete, structured curriculum.
        </p>
      </div>

      <Input
        placeholder={`e.g., ${topicExamples[Math.floor(Math.random() * topicExamples.length)]}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        disabled={disabled}
        className="text-body-lg"
      />

      {!error && value && (
        <p className="text-label-sm text-primary/80">
          ✓ Ready to transform into a curriculum
        </p>
      )}
    </div>
  );
}
