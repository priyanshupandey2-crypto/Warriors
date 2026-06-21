export type UserRole = 'LEARNER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: Date;
}

export interface UserProfile extends User {
  bio?: string;
  enrolledCourses: string[];
  completedCourses: string[];
  learningHours?: number;
  streak?: number;
}
