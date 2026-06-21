'use client';

import { Course } from '@/types/course';
import { Badge } from '@/components/ui';

interface CourseHeaderProps {
  course: Course;
}

const statusColors = {
  DRAFT: 'primary',
  SUBMITTED: 'secondary',
  PUBLISHED: 'tertiary',
  REJECTED: 'error',
} as const;

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="space-y-lg pb-lg border-b border-surface-container">
      {/* Title & Badges */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-md">
        <div className="flex-1">
          <h1 className="text-display-lg-mobile md:text-display-lg text-on-background">
            {course.title}
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-sm max-w-2xl">
            {course.description}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex gap-sm flex-wrap">
          <Badge variant={statusColors[course.status] as any}>
            {course.status}
          </Badge>
          <Badge variant={course.visibility === 'GLOBAL' ? 'tertiary' : 'primary'}>
            {course.visibility}
          </Badge>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-lg text-label-md text-on-surface-variant">
        <div>
          <span className="font-medium text-on-surface">Difficulty:</span> {course.difficulty}
        </div>
        <div>
          <span className="font-medium text-on-surface">Duration:</span> {course.duration} hours
        </div>
        <div>
          <span className="font-medium text-on-surface">Audience:</span> {course.targetAudience}
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex flex-wrap gap-lg text-label-sm text-on-surface-variant border-t border-surface-container pt-md">
        <div>
          Created: {course.createdAt.toLocaleDateString()}
        </div>
        <div>
          Last modified: {course.updatedAt.toLocaleDateString()}
        </div>
        <div>
          By: {course.createdBy}
        </div>
      </div>
    </div>
  );
}
