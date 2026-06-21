'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui';
import {
  WelcomeSection,
  QuickActionsCard,
  DraftCoursesSection,
  PublishedCoursesSection,
  RecentActivitySection,
} from '@/components/dashboard/sections';
import { useAuthStore, useCourseStore } from '@/store';
import {
  mockUser,
  mockDraftCourses,
  mockPublishedCourses,
  mockStats,
  mockRecentActivities,
} from '@/lib/mockData';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { setMyCourses, setPublishedCourses } = useCourseStore();

  // Initialize mock data on mount
  useEffect(() => {
    // Set auth user
    if (!user) {
      setUser(mockUser);
    }

    // Set course data
    setMyCourses(mockDraftCourses as any); // Treat drafts as "my courses" for now
    setPublishedCourses(mockPublishedCourses);
  }, [user, setUser, setMyCourses, setPublishedCourses]);

  // Filter draft courses
  const draftCourses = mockDraftCourses;
  const coursesToContinue = mockPublishedCourses;

  return (
    <AppShell
      headerProps={{
        brand: 'AuraLearn',
        navigation: [
          { href: '/dashboard', label: 'Dashboard', active: true },
          { href: '/published-courses', label: 'Browse Courses' },
        ],
        actions: (
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/create-course')}
          >
            Create Course
          </Button>
        ),
      }}
      sidebarProps={{
        items: [
          {
            href: '/dashboard',
            label: 'Dashboard',
            active: true,
            icon: 'LayoutDashboard',
          },
          {
            href: '/my-courses',
            label: 'My Courses',
            icon: 'BookMarked',
          },
          {
            href: '/create-course',
            label: 'Create Course',
            icon: 'Plus',
          },
          {
            href: '/published-courses',
            label: 'Browse',
            icon: 'BookOpen',
          },
        ],
      }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-lg px-md py-lg">
        {/* Welcome Section */}
        <WelcomeSection user={user} stats={mockStats} />

        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Draft Courses */}
        {draftCourses.length > 0 && (
          <DraftCoursesSection drafts={draftCourses} />
        )}

        {/* Published Courses to Continue */}
        {coursesToContinue.length > 0 && (
          <PublishedCoursesSection
            courses={coursesToContinue}
            maxDisplay={3}
          />
        )}

        {/* Recent Activity */}
        {mockRecentActivities.length > 0 && (
          <RecentActivitySection activities={mockRecentActivities as any} />
        )}
      </div>
    </AppShell>
  );
}
