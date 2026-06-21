'use client';

import { Course } from '@/types/course';
import { Card, Badge, Button } from '@/components/ui';
import { DIFFICULTY_LABELS, INSTRUCTOR_NAMES } from '@/lib/utils/courseEnums';
import { calculateDaysAgo } from '@/lib/utils/courseHelpers';

interface SubmittedCourseCardProps {
  course: Course;
  isSelected?: boolean;
  onReview: (course: Course) => void;
}

export function SubmittedCourseCard({
  course,
  isSelected = false,
  onReview,
}: SubmittedCourseCardProps) {
  const daysAgo = calculateDaysAgo(course.createdAt);

  return (
    <Card
      variant="elevated"
      className={`p-lg space-y-md transition-all ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      {/* Header */}
      <div className="space-y-sm">
        <div className="flex items-start justify-between gap-md">
          <h3 className="text-headline-md text-on-surface font-bold line-clamp-2 flex-1">
            {course.title}
          </h3>
          <Badge variant="secondary">SUBMITTED</Badge>
        </div>
        <p className="text-body-sm text-on-surface-variant line-clamp-2">
          {course.description}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-sm text-label-sm">
        <div className="space-y-xs">
          <p className="text-on-surface-variant">Level</p>
          <p className="text-on-surface font-medium">
            {DIFFICULTY_LABELS[course.difficulty]}
          </p>
        </div>
        <div className="space-y-xs">
          <p className="text-on-surface-variant">Duration</p>
          <p className="text-on-surface font-medium">{course.duration}h</p>
        </div>
        <div className="space-y-xs">
          <p className="text-on-surface-variant">Creator</p>
          <p className="text-on-surface font-medium">
            {INSTRUCTOR_NAMES[course.createdBy] || 'Unknown'}
          </p>
        </div>
        <div className="space-y-xs">
          <p className="text-on-surface-variant">Submitted</p>
          <p className="text-on-surface font-medium">{daysAgo}d ago</p>
        </div>
      </div>

      {/* Tags */}
      {course.tags.length > 0 && (
        <div className="flex flex-wrap gap-xs pt-sm border-t border-surface-container">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-label-xs bg-primary-container/20 text-primary px-sm py-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="text-label-xs text-on-surface-variant">
              +{course.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action */}
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={() => onReview(course)}
        className="mt-md"
      >
        Review Course →
      </Button>
    </Card>
  );
}
