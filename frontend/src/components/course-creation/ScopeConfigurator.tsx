'use client';

import { Input, Badge } from '@/components/ui';
import { CourseDifficulty } from '@/types/course';
import { cn } from '@/lib/utils';

interface ScopeConfiguratorProps {
  difficulty: CourseDifficulty | '';
  onDifficultyChange: (difficulty: CourseDifficulty | '') => void;
  duration: number | '';
  onDurationChange: (duration: number | '') => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (input: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

const difficultyOptions = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Foundational knowledge' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Building expertise' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Mastery & specialization' },
] as const;

export function ScopeConfigurator({
  difficulty,
  onDifficultyChange,
  duration,
  onDurationChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  errors,
  disabled,
}: ScopeConfiguratorProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddTag();
    }
  };

  return (
    <div className="space-y-lg">
      <div>
        <h3 className="text-headline-md font-semibold text-on-background mb-lg">
          Define Your Scope
        </h3>
        <p className="text-body-sm text-on-surface-variant mb-lg">
          These settings help us tailor the depth, pace, and breadth of your curriculum.
        </p>
      </div>

      {/* Difficulty Level - Visual Buttons */}
      <div className="space-y-md">
        <label className="block text-label-md font-semibold text-on-surface">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-sm">
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDifficultyChange(opt.value)}
              disabled={disabled}
              type="button"
              className={cn(
                'p-md rounded-lg border-2 transition-all space-y-xs text-center',
                difficulty === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-container hover:border-surface-container-high',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="text-body-md font-semibold text-on-surface">{opt.label}</div>
              <div className="text-label-xs text-on-surface-variant">{opt.description}</div>
            </button>
          ))}
        </div>
        {errors.difficulty && (
          <p className="text-label-sm text-error">{errors.difficulty}</p>
        )}
      </div>

      {/* Duration */}
      <Input
        label="Duration (hours)"
        type="number"
        placeholder="e.g., 12"
        value={duration}
        onChange={(e) => {
          onDurationChange(e.target.value ? parseInt(e.target.value) : '');
        }}
        error={errors.duration}
        disabled={disabled}
        helperText="This helps us size the modules and lessons appropriately"
      />

      {/* Topics / Tags */}
      <div className="space-y-md">
        <label className="block text-label-md font-semibold text-on-surface">
          Key Topics (optional, max 5)
        </label>
        <p className="text-label-sm text-on-surface-variant">
          Add topics the AI should focus on or integrate into the curriculum.
        </p>

        <div className="flex gap-sm">
          <input
            type="text"
            placeholder="e.g., APIs, Databases, Testing"
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || tags.length >= 5}
            className="flex-1 px-md py-sm rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface placeholder-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={onAddTag}
            disabled={!tagInput.trim() || disabled || tags.length >= 5}
            type="button"
            className="px-lg py-sm rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-sm">
            {tags.map((tag) => (
              <Badge key={tag} variant="primary">
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  disabled={disabled}
                  className="ml-xs hover:opacity-70 disabled:opacity-50 font-bold"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
