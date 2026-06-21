import { useCourseStore } from '@/store';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/course';
import { useState } from 'react';

export function useCourses() {
  const {
    selectedCourse,
    myCourses,
    publishedCourses,
    setSelectedCourse,
    setMyCourses,
    setPublishedCourses,
  } = useCourseStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublishedCourses = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<Course[]>('/courses/published');
      setPublishedCourses(data);
      setError(null);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch courses';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<Course[]>('/courses/my-courses');
      setMyCourses(data);
      setError(null);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch my courses';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseDetail = async (courseId: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<Course>(`/courses/${courseId}`);
      setSelectedCourse(data);
      setError(null);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch course details';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const enrollCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<Course>(`/courses/${courseId}/enroll`);
      setSelectedCourse(data);
      setError(null);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to enroll in course';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedCourse,
    myCourses,
    publishedCourses,
    isLoading,
    error,
    fetchPublishedCourses,
    fetchMyCourses,
    fetchCourseDetail,
    enrollCourse,
  };
}
