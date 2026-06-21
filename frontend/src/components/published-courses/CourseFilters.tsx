'use client';

import { Card } from '@/components/ui';
import { CourseDifficulty } from '@/types/course';

interface CourseFiltersProps {
  difficulty: CourseDifficulty | null;
  onDifficultyChange: (difficulty: CourseDifficulty | null) => void;
  minDuration: number;
  maxDuration: number;
  onDurationChange: (min: number, max: number) => void;
  minRating: number | null;
  onRatingChange: (rating: number | null) => void;
  onReset: () => void;
}

const difficulties: CourseDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const ratingOptions = [
  { label: '4.0+ stars', value: 4.0 },
  { label: '4.5+ stars', value: 4.5 },
  { label: '4.8+ stars', value: 4.8 },
];

export function CourseFilters({
  difficulty,
  onDifficultyChange,
  minDuration,
  maxDuration,
  onDurationChange,
  minRating,
  onRatingChange,
  onReset,
}: CourseFiltersProps) {
  const hasActiveFilters = difficulty !== null || minRating !== null || minDuration > 0 || maxDuration < 40;

  return (
    <Card variant="outlined" className="p-lg space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-md">
        <h2 className="text-headline-md text-on-background font-bold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-label-sm text-primary font-medium hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-sm">
        <h3 className="text-label-lg font-bold text-on-surface">Level</h3>
        <div className="space-y-xs">
          {difficulties.map((level) => (
            <label
              key={level}
              className="flex items-center gap-sm cursor-pointer p-sm hover:bg-surface-container rounded transition-colors"
            >
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={difficulty === level}
                onChange={(e) => onDifficultyChange(e.target.checked ? level : null)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-body-md text-on-surface">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration Range */}
      <div className="space-y-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-label-lg font-bold text-on-surface">Duration</h3>
          <span className="text-label-sm text-on-surface-variant">
            {minDuration} - {maxDuration} hrs
          </span>
        </div>
        <div className="space-y-md">
          {/* Min Duration */}
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">
              Min: {minDuration} hours
            </label>
            <input
              type="range"
              min="0"
              max="40"
              value={minDuration}
              onChange={(e) => {
                const newMin = parseInt(e.target.value);
                if (newMin <= maxDuration) {
                  onDurationChange(newMin, maxDuration);
                }
              }}
              className="w-full"
            />
          </div>

          {/* Max Duration */}
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">
              Max: {maxDuration} hours
            </label>
            <input
              type="range"
              min="0"
              max="40"
              value={maxDuration}
              onChange={(e) => {
                const newMax = parseInt(e.target.value);
                if (newMax >= minDuration) {
                  onDurationChange(minDuration, newMax);
                }
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-sm">
        <h3 className="text-label-lg font-bold text-on-surface">Rating</h3>
        <div className="space-y-xs">
          {ratingOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-sm cursor-pointer p-sm hover:bg-surface-container rounded transition-colors"
            >
              <input
                type="radio"
                name="rating"
                value={option.value}
                checked={minRating === option.value}
                onChange={(e) => onRatingChange(e.target.checked ? option.value : null)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-body-md text-on-surface">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}
