'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Icon } from '@/components/ui';

export function QuickActionsCard() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
      {/* Create Course Card */}
      <Card variant="elevated" className="flex flex-col items-start justify-between hover-lift">
        <div className="space-y-md mb-lg">
          <div className="p-sm bg-primary-container rounded-lg w-fit">
            <Icon name="Plus" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Create New Course</h3>
            <p className="text-body-md text-on-surface-variant">
              Use AI to generate a personalized course
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => router.push('/create-course')}
        >
          Start Creating
        </Button>
      </Card>

      {/* Browse Courses Card */}
      <Card variant="elevated" className="flex flex-col items-start justify-between hover-lift">
        <div className="space-y-md mb-lg">
          <div className="p-sm bg-secondary-container rounded-lg w-fit">
            <Icon name="Globe" size={24} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Browse Courses</h3>
            <p className="text-body-md text-on-surface-variant">
              Explore published courses from expert instructors
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => router.push('/published-courses')}
        >
          Browse Now
        </Button>
      </Card>
    </div>
  );
}
