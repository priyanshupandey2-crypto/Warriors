'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { Button, PageHeader } from '@/components/ui';
import { SearchBar, CourseFilters, PublishedCourseCard } from '@/components/published-courses';
import { mockPublishedCourses } from '@/lib/mockData';
import { CourseDifficulty } from '@/types/course';
import { DIFFICULTY_LABELS, INSTRUCTOR_NAMES } from '@/lib/utils/courseEnums';
import { getMainNavigation } from '@/lib/utils/navigation';

type SortBy = 'rating' | 'enrolled' | 'recent';

export default function PublishedCoursesPage() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<CourseDifficulty | null>(null);
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(40);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('rating');

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...mockPublishedCourses];

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.topic.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Difficulty filter
    if (difficulty) {
      result = result.filter((course) => course.difficulty === difficulty);
    }

    // Duration filter
    result = result.filter(
      (course) => course.duration >= minDuration && course.duration <= maxDuration
    );

    // Rating filter
    if (minRating !== null) {
      result = result.filter((course) => (course.rating || 0) >= minRating);
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'enrolled') {
      result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [searchTerm, difficulty, minDuration, maxDuration, minRating, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDifficulty(null);
    setMinDuration(0);
    setMaxDuration(40);
    setMinRating(null);
  };

  const handleEnroll = (courseId: string) => {
    // In real app, would hit API and update Zustand store
    console.log('Enrolled in course:', courseId);
  };

  return (
    <AppShell
      sidebarProps={{
        items: getMainNavigation(pathname),
      }}
    >
      <main className="w-full space-y-lg py-lg px-md">
        <div className="max-w-6xl mx-auto space-y-lg w-full">
        {/* Header */}
        <PageHeader
          title="Explore Courses"
          subtitle="Discover and enroll in courses to expand your skills"
        />

        {/* Search Bar */}
        <div className="mb-lg">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Main Layout: Filters + Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
          {/* Sidebar: Filters (Responsive) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-lg">
              <CourseFilters
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                minDuration={minDuration}
                maxDuration={maxDuration}
                onDurationChange={(min, max) => {
                  setMinDuration(min);
                  setMaxDuration(max);
                }}
                minRating={minRating}
                onRatingChange={setMinRating}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Main Content: Courses */}
          <section className="lg:col-span-3 space-y-lg">
            {/* Sort Controls */}
            <div className="flex items-center justify-between gap-md flex-wrap">
              <div className="text-body-md text-on-surface-variant">
                <span className="font-bold">{filteredCourses.length}</span> course
                {filteredCourses.length !== 1 ? 's' : ''} found
              </div>

              <div className="flex gap-xs">
                {(['rating', 'enrolled', 'recent'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-md py-sm rounded-lg font-medium text-label-md transition-colors ${
                      sortBy === sort
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {sort === 'rating'
                      ? 'Rating'
                      : sort === 'enrolled'
                        ? 'Popular'
                        : 'Recent'}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-2xl">
                <h2 className="text-headline-sm text-on-surface-variant">No courses found</h2>
                <p className="text-body-md text-on-surface-variant mt-sm">
                  Try adjusting your filters or search term
                </p>
                <Button variant="secondary" size="md" className="mt-lg" onClick={handleResetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filteredCourses.map((course) => (
                  <PublishedCourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    difficulty={DIFFICULTY_LABELS[course.difficulty]}
                    duration={`${course.duration}h`}
                    rating={course.rating}
                    image={course.imageUrl}
                    tags={course.tags}
                    creator={INSTRUCTOR_NAMES[course.createdBy] || 'Unknown Instructor'}
                    enrolledCount={course.enrolledCount}
                    onEnroll={() => handleEnroll(course.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
        </div>
      </main>
    </AppShell>
  );
}
