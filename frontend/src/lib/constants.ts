export const APP_NAME = 'AuraLearn';
export const APP_VERSION = '0.1.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CREATE_COURSE: '/create-course',
  MY_COURSES: '/my-courses',
  PUBLISHED_COURSES: '/published-courses',
  COURSE_DETAIL: (id: string) => `/course/${id}`,
  ADMIN_APPROVALS: '/admin/approvals',
} as const;

export const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export const COURSE_STATUSES = ['DRAFT', 'SUBMITTED', 'PUBLISHED', 'REJECTED'] as const;

export const COURSE_VISIBILITY = ['PRIVATE', 'GLOBAL'] as const;

export const TOAST_DURATION = 3000;
