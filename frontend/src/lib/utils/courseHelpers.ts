// Type-safe helper functions for course operations
import { CourseDifficulty, CourseStatus, CourseVisibility } from '@/types/course';
import {
  DIFFICULTY_LABELS,
  STATUS_COLORS,
  VISIBILITY_LABELS,
  INSTRUCTOR_NAMES,
  STATUS_LABELS,
} from './courseEnums';

export function getDifficultyLabel(difficulty: CourseDifficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}

export function getStatusColor(
  status: CourseStatus
): 'primary' | 'secondary' | 'tertiary' | 'error' {
  return STATUS_COLORS[status];
}

export function getStatusLabel(status: CourseStatus): string {
  return STATUS_LABELS[status];
}

export function getVisibilityLabel(visibility: CourseVisibility): string {
  return VISIBILITY_LABELS[visibility];
}

export function getInstructorName(instructorId: string): string {
  return INSTRUCTOR_NAMES[instructorId as keyof typeof INSTRUCTOR_NAMES] || 'Unknown Instructor';
}

export function calculateDaysAgo(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysAgo(date: Date): string {
  const days = calculateDaysAgo(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
