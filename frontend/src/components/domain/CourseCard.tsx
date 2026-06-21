'use client';

import { ReactNode } from 'react';
import { Card, Badge } from '@/components/ui';

export interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  progress?: number;
  rating?: number;
  enrolled?: boolean;
  completed?: boolean;
  badge?: ReactNode;
  onEnroll?: () => void;
  onResume?: () => void;
}

const difficultyColorMap = {
  Beginner: 'primary',
  Intermediate: 'secondary',
  Advanced: 'tertiary',
} as const;

export function CourseCard({
  title,
  description,
  image,
  difficulty,
  duration,
  progress,
  rating,
  enrolled = false,
  completed = false,
  badge,
  onResume,
}: CourseCardProps) {
  return (
    <Card variant="elevated" className="overflow-hidden flex flex-col h-full group hover:shadow-lg transition-shadow">
      {/* Image Section */}
      {image && (
        <div className="relative h-48 overflow-hidden bg-surface-container">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {difficulty && (
            <div className="absolute top-md right-md">
              <Badge variant={difficultyColorMap[difficulty] as any}>{difficulty}</Badge>
            </div>
          )}
          {enrolled && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-md">
              <button
                onClick={onResume}
                className="bg-surface-container-lowest text-on-surface px-md py-sm rounded-full text-label-md font-bold flex items-center gap-xs hover:bg-surface-container transition-colors"
              >
                ▶ {completed ? 'Review' : 'Resume'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-lg flex-1 flex flex-col gap-md">
        <div>
          <div className="flex justify-between items-start gap-md mb-sm">
            <h3 className="text-body-lg font-bold text-on-surface flex-1">{title}</h3>
            {badge && badge}
          </div>
          {description && <p className="text-label-md text-on-surface-variant">{description}</p>}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="space-y-xs">
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-label-sm text-outline">
              <span>{progress}% Complete</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-md border-t border-surface-variant flex items-center justify-between gap-md">
          <div className="flex items-center gap-xs text-on-surface-variant">
            {duration && (
              <>
                <span className="text-sm">⏱</span>
                <span className="text-label-md">{duration}</span>
              </>
            )}
          </div>
          {rating !== undefined && (
            <div className="flex items-center gap-xs">
              <span className="text-sm">⭐</span>
              <span className="text-label-md font-bold text-on-surface">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
