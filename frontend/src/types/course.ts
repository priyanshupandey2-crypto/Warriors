export type CourseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseVisibility = 'PRIVATE' | 'GLOBAL';
export type CourseStatus = 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'REJECTED';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  duration?: number; // in minutes
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}

export interface QuizSummary {
  id: string;
  title: string;
  questionCount: number;
  passingScore: number;
  moduleId?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: CourseDifficulty;
  targetAudience: string;
  duration: number; // in hours
  tags: string[];
  status: CourseStatus;
  visibility: CourseVisibility;
  imageUrl?: string;
  progress?: number;
  rating?: number;
  enrolledCount?: number;
  modules: CourseModule[];
  quizzes?: QuizSummary[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DraftCourse {
  id?: string;
  title?: string;
  description?: string;
  topic: string;
  difficulty: CourseDifficulty;
  targetAudience: string;
  duration: number;
  tags: string[];
  modules?: CourseModule[];
  imageUrl?: string;
  savedAt?: Date;
}

export interface CourseFilter {
  difficulty?: CourseDifficulty;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  searchQuery?: string;
  tags?: string[];
  sortBy?: 'recent' | 'popular' | 'rating';
}

export interface CourseCreateInput {
  title?: string;
  topic: string;
  difficulty: CourseDifficulty;
  targetAudience: string;
  duration: number;
  tags: string[];
}
