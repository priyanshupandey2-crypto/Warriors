'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout';
import {
  CourseHeader,
  LearningObjectives,
  ModulesSection,
  QuizSummary,
  CapstoneSummary,
  DraftActions,
} from '@/components/course-detail';
import { mockPublishedCourses, mockDraftCourses } from '@/lib/mockData';
import { Course } from '@/types/course';
import { getCourseDetailNavigation } from '@/lib/utils/navigation';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Find course from published courses or convert draft to course
    const publishedCourse = mockPublishedCourses.find((c) => c.id === courseId);
    if (publishedCourse) {
      setCourse(publishedCourse);
      setLoading(false);
      return;
    }

    // Try to find in drafts and convert to Course type
    const draftCourse = mockDraftCourses.find((c) => c.id === courseId);
    if (draftCourse) {
      const asCourse: Course = {
        id: draftCourse.id || `draft-${Math.random()}`,
        title: draftCourse.title || 'Untitled Course',
        description: draftCourse.description || '',
        topic: draftCourse.topic,
        difficulty: draftCourse.difficulty,
        targetAudience: draftCourse.targetAudience,
        duration: draftCourse.duration,
        tags: draftCourse.tags,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        modules: draftCourse.modules || [],
        createdAt: draftCourse.savedAt || new Date(),
        updatedAt: draftCourse.savedAt || new Date(),
        createdBy: 'current-user',
      };
      setCourse(asCourse);
    }

    setLoading(false);
  }, [courseId]);

  const handleSaveDraft = async () => {
    console.log('Saving draft for course:', courseId);
  };

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Course submitted:', courseId);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-md">
            <div className="inline-block w-12 h-12 border-4 border-primary-container border-t-primary rounded-full animate-spin" />
            <p className="text-body-lg text-on-surface-variant">Loading course...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-md">
            <h1 className="text-headline-lg text-on-background">Course not found</h1>
            <p className="text-body-lg text-on-surface-variant">
              We couldn't find the course you're looking for.
            </p>
            <button
              onClick={() => router.push('/my-courses')}
              className="text-primary font-medium hover:underline"
            >
              Back to My Courses
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebarProps={{
        items: getCourseDetailNavigation(courseId, pathname),
      }}
    >
      <main className="max-w-6xl mx-auto space-y-xl py-lg px-md">
        {/* Course Header */}
        <CourseHeader course={course} />

        {/* Learning Objectives - fallback if not defined */}
        <LearningObjectives
          objectives={
            (course as any).learningObjectives || [
              'Understand core concepts',
              'Apply knowledge practically',
              'Master advanced techniques',
            ]
          }
        />

        {/* Modules Section */}
        {course.modules && course.modules.length > 0 && (
          <ModulesSection modules={course.modules} />
        )}

        {/* Quizzes Section */}
        {(course as any).quizzes && (course as any).quizzes.length > 0 && (
          <QuizSummary quizzes={(course as any).quizzes} />
        )}

        {/* Capstone Section */}
        {(course as any).capstone && (
          <CapstoneSummary capstone={(course as any).capstone} />
        )}

        {/* Draft Actions - Only show for draft courses */}
        {course.status === 'DRAFT' && (
          <DraftActions
            courseId={courseId}
            onSave={handleSaveDraft}
            onSubmit={handleSubmitForApproval}
            isLoading={submitting}
          />
        )}
      </main>
    </AppShell>
  );
}
