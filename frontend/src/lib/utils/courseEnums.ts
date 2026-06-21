// Enum mappings and converters for course-related types
import { CourseDifficulty, CourseStatus, CourseVisibility } from '@/types/course';

// Difficulty Level Mapping
export const DIFFICULTY_LABELS: Record<CourseDifficulty, 'Beginner' | 'Intermediate' | 'Advanced'> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

// Course Status Colors
export const STATUS_COLORS: Record<CourseStatus, 'primary' | 'secondary' | 'tertiary' | 'error'> = {
  DRAFT: 'primary',
  SUBMITTED: 'secondary',
  PUBLISHED: 'tertiary',
  REJECTED: 'error',
} as const;

// Visibility Labels
export const VISIBILITY_LABELS: Record<CourseVisibility, string> = {
  PRIVATE: 'Private',
  GLOBAL: 'Global',
} as const;

// Instructor/Creator Name Map
export const INSTRUCTOR_NAMES: Record<string, string> = {
  'instructor-1': 'Sarah Mitchell',
  'instructor-2': 'Dr. James Chen',
  'instructor-3': 'Maya Patel',
  'instructor-4': 'Prof. Alexander König',
  'instructor-5': 'Elena Rodriguez',
  'current-user': 'You',
} as const;

// Status Labels
export const STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
} as const;
