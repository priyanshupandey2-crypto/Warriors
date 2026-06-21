'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { Button, Badge, PageHeader, EmptyState } from '@/components/ui';
import { useCourseStore } from '@/store/courseStore';
import { mockDraftCourses, mockPublishedCourses } from '@/lib/mockData';
import { Course } from '@/types/course';
import { STATUS_COLORS } from '@/lib/utils/courseEnums';
import { getMainNavigation } from '@/lib/utils/navigation';

type TabFilter = 'all' | 'draft' | 'submitted' | 'published' | 'rejected';

interface MyCourse extends Course {
  isDraft?: boolean;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [allCourses, setAllCourses] = useState<MyCourse[]>([]);
  const setMyCourses = useCourseStore((state) => state.setMyCourses);

  useEffect(() => {
    // Convert draft courses to Course-like objects with DRAFT status
    const coursesWithDraftStatus: MyCourse[] = mockDraftCourses.map((draft) => ({
      id: draft.id || `draft-${Math.random()}`,
      title: draft.title || 'Untitled Course',
      description: draft.description || '',
      topic: draft.topic,
      difficulty: draft.difficulty,
      targetAudience: draft.targetAudience,
      duration: draft.duration,
      tags: draft.tags,
      status: 'DRAFT' as const,
      visibility: 'PRIVATE' as const,
      modules: draft.modules || [],
      createdAt: draft.savedAt || new Date(),
      updatedAt: draft.savedAt || new Date(),
      createdBy: 'current-user',
      isDraft: true,
    }));

    // Combine with published courses
    const combined: MyCourse[] = [...coursesWithDraftStatus, ...mockPublishedCourses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setAllCourses(combined);
    setMyCourses(combined);
  }, [setMyCourses]);

  const filteredCourses = useMemo(() => {
    if (activeTab === 'all') return allCourses;
    return allCourses.filter((course) => course.status.toLowerCase() === activeTab.toLowerCase());
  }, [allCourses, activeTab]);

  const stats = useMemo(() => {
    return {
      all: allCourses.length,
      draft: allCourses.filter((c) => c.status === 'DRAFT').length,
      submitted: allCourses.filter((c) => c.status === 'SUBMITTED').length,
      published: allCourses.filter((c) => c.status === 'PUBLISHED').length,
      rejected: allCourses.filter((c) => c.status === 'REJECTED').length,
    };
  }, [allCourses]);

  return (
    <AppShell
      sidebarProps={{
        items: getMainNavigation(pathname),
      }}
    >
      <main className="max-w-6xl mx-auto space-y-lg py-lg px-md">
        {/* Header */}
        <PageHeader
          title="My Courses"
          subtitle="Manage and review your courses"
          actions={
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/create-course')}
            >
              Create New Course
            </Button>
          }
        />

        {/* Status Filter Tabs */}
        <div className="flex gap-xs overflow-x-auto pb-sm">
          {[
            { label: 'All', value: 'all' as TabFilter, count: stats.all },
            { label: 'Draft', value: 'draft' as TabFilter, count: stats.draft },
            { label: 'Submitted', value: 'submitted' as TabFilter, count: stats.submitted },
            { label: 'Published', value: 'published' as TabFilter, count: stats.published },
            { label: 'Rejected', value: 'rejected' as TabFilter, count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-lg py-sm rounded-lg font-medium text-label-lg whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
              <span className="ml-sm text-label-md opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            message={
              activeTab === 'all'
                ? 'Create your first course to get started'
                : `You don't have any ${activeTab} courses`
            }
            action={
              <Button variant="primary" onClick={() => router.push('/create-course')}>
                Create Course
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
                className="h-full bg-surface-container rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-surface-container hover:border-primary">
                  {/* Card Background */}
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-tertiary/20" />

                  {/* Content */}
                  <div className="p-lg space-y-md">
                    {/* Title */}
                    <h3 className="text-headline-md text-on-surface font-bold line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Metadata */}
                    <div className="space-y-xs text-label-sm text-on-surface-variant">
                      <div>{course.difficulty} Level</div>
                      <div>{course.duration} hours</div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-xs pt-sm">
                      <Badge variant={STATUS_COLORS[course.status]}>{course.status}</Badge>
                      <Badge variant="secondary">{course.visibility}</Badge>
                    </div>

                    {/* Timestamp */}
                    <p className="text-label-xs text-on-surface-variant border-t border-surface-container pt-md">
                      {new Date(course.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    {/* Action - Show for draft only */}
                    {course.status === 'DRAFT' && (
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="w-full mt-md"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        Continue Editing
                      </Button>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
