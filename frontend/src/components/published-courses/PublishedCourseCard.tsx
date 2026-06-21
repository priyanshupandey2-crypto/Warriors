'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

interface PublishedCourseCardProps {
  id: string;
  title: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  rating?: number;
  image?: string;
  tags?: string[];
  creator?: string;
  enrolledCount?: number;
  onEnroll?: () => void;
}

const difficultyColorMap = {
  Beginner: 'primary',
  Intermediate: 'secondary',
  Advanced: 'tertiary',
} as const;

export function PublishedCourseCard({
  title,
  description,
  difficulty,
  duration,
  rating,
  image,
  tags = [],
  creator,
  enrolledCount,
  onEnroll,
}: PublishedCourseCardProps) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      if (onEnroll) {
        onEnroll();
      }
      // Simulate enrollment
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setEnrolling(false);
    }
  };

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
        </div>
      )}

      {/* Content Section */}
      <div className="p-lg flex-1 flex flex-col gap-md">
        {/* Title and Rating */}
        <div>
          <h3 className="text-headline-sm font-semibold text-on-surface">{title}</h3>
          {description && (
            <p className="text-body-md text-on-surface-variant mt-sm line-clamp-2">{description}</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-label-xs bg-primary-container text-primary px-sm py-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-label-xs text-on-surface-variant">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Enrollment Info */}
        <div className="space-y-xs text-label-sm text-on-surface-variant">
          {enrolledCount !== undefined && (
            <div>👥 {enrolledCount.toLocaleString()} students enrolled</div>
          )}
          {creator && <div>👤 by {creator}</div>}
        </div>

        {/* Footer: Duration and Rating */}
        <div className="mt-auto pt-md border-t border-surface-variant flex items-center justify-between gap-md">
          {duration && (
            <div className="flex items-center gap-xs text-on-surface-variant">
              <span className="text-sm">⏱</span>
              <span className="text-label-md">{duration}</span>
            </div>
          )}
          {rating !== undefined && (
            <div className="flex items-center gap-xs">
              <span className="text-sm">⭐</span>
              <span className="text-label-md font-bold text-on-surface">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Enroll Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleEnroll}
          disabled={enrolling}
          loading={enrolling}
          className="mt-md"
        >
          {enrolling ? 'Enrolling...' : '📚 Enroll Now'}
        </Button>
      </div>
    </Card>
  );
}
