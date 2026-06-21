'use client';

import { create } from 'zustand';
import { Course, DraftCourse, CourseFilter } from '@/types/course';

interface CourseState {
  selectedCourse: Course | null;
  draftCourse: DraftCourse | null;
  myCourses: Course[];
  publishedCourses: Course[];
  filters: CourseFilter;

  setSelectedCourse: (course: Course | null) => void;
  setDraftCourse: (course: DraftCourse | null) => void;
  setMyCourses: (courses: Course[]) => void;
  setPublishedCourses: (courses: Course[]) => void;
  updateFilters: (filters: Partial<CourseFilter>) => void;
  clearCourseState: () => void;
}

const defaultFilters: CourseFilter = {
  difficulty: undefined,
  status: undefined,
  visibility: undefined,
  searchQuery: '',
  tags: [],
  sortBy: 'recent',
};

export const useCourseStore = create<CourseState>((set) => ({
  selectedCourse: null,
  draftCourse: null,
  myCourses: [],
  publishedCourses: [],
  filters: defaultFilters,

  setSelectedCourse: (selectedCourse: Course | null) =>
    set({ selectedCourse }),

  setDraftCourse: (draftCourse: DraftCourse | null) =>
    set({ draftCourse }),

  setMyCourses: (myCourses: Course[]) => set({ myCourses }),

  setPublishedCourses: (publishedCourses: Course[]) =>
    set({ publishedCourses }),

  updateFilters: (newFilters: Partial<CourseFilter>) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    })),

  clearCourseState: () =>
    set({
      selectedCourse: null,
      draftCourse: null,
      myCourses: [],
      publishedCourses: [],
      filters: defaultFilters,
    }),
}));
