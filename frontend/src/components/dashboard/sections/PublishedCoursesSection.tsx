'use client';

import { useRouter } from 'next/navigation';
import { Course } from '@/types/course';
import { CourseCard } from '@/components/domain';
import { SectionHeader, Button } from '@/components/ui';

interface PublishedCoursesSectionProps {
  courses: Course[];
  onCourseSelect?: (courseId: string) => void;
  maxDisplay?: number;
}

export function PublishedCoursesSection({
  courses,
  onCourseSelect,
  maxDisplay = 3,
}: PublishedCoursesSectionProps) {
  const router = useRouter();

  if (!courses || courses.length === 0) {
    return null;
  }

  // Sort by progress (in-progress first), then by rating
  const sorted = [...courses].sort((a, b) => {
    const aProgress = a.progress || 0;
    const bProgress = b.progress || 0;

    if (aProgress === 0 && bProgress > 0) return 1;
    if (aProgress > 0 && bProgress === 0) return -1;
    if (aProgress !== bProgress) return bProgress - aProgress;

    return (b.rating || 0) - (a.rating || 0);
  });

  const displayedCourses = sorted.slice(0, maxDisplay);
  const hasMore = sorted.length > maxDisplay;

  return (
    <section className="space-y-lg">
      <SectionHeader
        title={
          sorted.some((c) => (c.progress || 0) > 0)
            ? 'Continue Learning'
            : 'Explore Published Courses'
        }
        subtitle={
          sorted.some((c) => (c.progress || 0) > 0)
            ? 'Pick up where you left off'
            : 'Find your next course to learn from'
        }
        action={
          hasMore && (
            <Button variant="ghost" size="sm" onClick={() => router.push('/published-courses')}>
              View All
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {displayedCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => {
              onCourseSelect?.(course.id);
              router.push(`/course/${course.id}`);
            }}
            className="cursor-pointer hover-lift"
          >
            <CourseCard
              id={course.id}
              title={course.title}
              description={course.description}
              image={course.imageUrl}
              difficulty={course.difficulty as any}
              duration={`${course.duration}h`}
              progress={course.progress}
              rating={course.rating}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-lg">
          <button
            onClick={() => router.push('/published-courses')}
            className="text-primary font-label-lg hover:text-primary-container transition-colors duration-200 bg-transparent border-none cursor-pointer"
          >
            View All Courses →
          </button>
        </div>
      )}
    </section>
  );
}
